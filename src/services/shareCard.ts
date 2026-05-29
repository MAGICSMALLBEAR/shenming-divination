// 分享籤詩圖卡服務 - 使用 ViewShot 截圖 + Share
import { captureRef } from 'react-native-view-shot';
import { Share, Platform } from 'react-native';
import type { Poem } from '@/data/poems/leiyushi';

interface ShareCardData {
  godName: string;
  poem: Poem;
  aiInterpretation?: string | null;
}

// 從 View ref 截圖並分享
export async function captureAndShare(viewRef: number, data: ShareCardData): Promise<void> {
  try {
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 0.9,
      result: 'tmpfile',
    });

    const message = `【${data.godName}靈籤】第 ${data.poem.number} 籤 · ${data.poem.level}\n\n${data.poem.content.split('\n').join(' ')}\n\n— 神明占卜`;

    await Share.share(
      Platform.OS === 'ios'
        ? { url: uri, message }
        : { url: uri, message: `${message}\n下載神明占卜 App 獲得更多指引` },
    );
  } catch (error: any) {
    if (error?.message !== 'User did not share') {
      console.warn('分享失敗:', error);
      // 降級為純文字分享
      await Share.share({
        message: `【${data.godName}靈籤】第 ${data.poem.number} 籤 · ${data.poem.level}\n\n${data.poem.content}\n\n— 神明占卜`,
      });
    }
  }
}
