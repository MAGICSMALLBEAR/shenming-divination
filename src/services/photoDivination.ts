// 拍照解籤服務 - 用 expo-image-picker 拍照，送 Vision AI 辨識籤號
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getPoemsByGod , gods } from '@/data/gods';

const getVisionApiUrl = () => {
  if (Platform.OS === 'android') return 'http://10.0.2.2:3001/api/vision';
  return 'http://localhost:3001/api/vision';
};

export interface VisionResult {
  success: boolean;
  poemNumber?: number | null;
  poemSystem?: string | null;
  poemLevel?: string | null;
  poemTextHint?: string | null;
  confidence?: string;
  notes?: string;
  error?: string;
}

export interface MatchedPoem {
  godId: number;
  godName: string;
  poemSystem: string;
  poem: {
    number: number;
    level: string;
    content: string;
    vernacular: string;
    story?: string;
  };
}

// 將圖片 URI 轉換為 base64
async function imageUriToBase64(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // 去掉 data:...;base64, 前綴
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// 從 Vision 結果找對應的籤詩
function findMatchedPoem(visionResult: VisionResult): MatchedPoem | null {
  if (!visionResult.poemNumber) return null;

  const targetNumber = visionResult.poemNumber;
  const targetSystem = visionResult.poemSystem;

  // 優先依籤系統比對
  const systemToGodIds: Record<string, number[]> = {
    '雷雨師百首': [1, 5, 8, 11, 14, 15],
    '保生健康籤': [5],
    '濟公活佛籤': [11],
    '觀音靈籤': [2],
    '六十甲子籤': [3, 4, 6, 7, 12, 13],
    '三太子衝關籤': [12],
    '月老姻緣籤': [13],
    '諸葛神數': [9],
    '二十八宿靈籤': [10],
  };

  let candidateGodIds: number[] = [];

  if (targetSystem) {
    for (const [system, ids] of Object.entries(systemToGodIds)) {
      if (targetSystem.includes(system.slice(0, 3)) || system.includes(targetSystem.slice(0, 3))) {
        candidateGodIds = ids;
        break;
      }
    }
  }

  if (!candidateGodIds.length) {
    // 沒有系統線索，試所有神明
    candidateGodIds = gods.map(g => g.id);
  }

  for (const godId of candidateGodIds) {
    const god = gods.find(g => g.id === godId);
    if (!god) continue;
    const poems = getPoemsByGod(godId);
    const poem = (poems as { number: number; level: string; content: string; vernacular: string; story?: string }[])
      .find(p => p.number === targetNumber);
    if (poem) {
      return {
        godId,
        godName: god.name,
        poemSystem: god.poemSystem,
        poem,
      };
    }
  }

  return null;
}

// 主流程：選圖或拍照 → 送 AI 辨識 → 回傳比對結果
export async function pickAndIdentifyPoem(source: 'camera' | 'library'): Promise<{
  visionResult: VisionResult;
  matchedPoem: MatchedPoem | null;
  imageUri: string | null;
}> {
  // 請求權限
  if (source === 'camera') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return {
        visionResult: { success: false, error: '需要相機權限才能拍照解籤' },
        matchedPoem: null,
        imageUri: null,
      };
    }
  } else {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return {
        visionResult: { success: false, error: '需要相簿權限才能選取圖片' },
        matchedPoem: null,
        imageUri: null,
      };
    }
  }

  // 選取或拍攝圖片
  const result = source === 'camera'
    ? await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        base64: false,
      })
    : await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        base64: false,
      });

  if (result.canceled || !result.assets?.[0]?.uri) {
    return {
      visionResult: { success: false, error: '未選取圖片' },
      matchedPoem: null,
      imageUri: null,
    };
  }

  const imageUri = result.assets[0].uri;

  try {
    // 轉 base64
    const base64 = await imageUriToBase64(imageUri);

    // 送 Vision API
    const response = await fetch(getVisionApiUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64, mimeType: 'image/jpeg' }),
    });

    if (!response.ok) {
      throw new Error(`Vision API 回傳錯誤 ${response.status}`);
    }

    const visionResult: VisionResult = await response.json();
    const matchedPoem = findMatchedPoem(visionResult);

    return { visionResult, matchedPoem, imageUri };
  } catch (error) {
    return {
      visionResult: {
        success: false,
        error: error instanceof Error ? error.message : '圖片辨識失敗，請稍後再試',
      },
      matchedPoem: null,
      imageUri,
    };
  }
}
