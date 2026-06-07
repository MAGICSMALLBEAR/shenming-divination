import { Share, Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import type { Poem } from '@/data/poems/leiyushi';

interface ShareCardData {
  godName: string;
  poem: Poem;
  aiInterpretation?: string | null;
}

function buildShareMessage(data: ShareCardData): string {
  const lines = [
    `【${data.godName}靈籤】第 ${data.poem.number} 籤 · ${data.poem.title} · ${data.poem.level}`,
    data.poem.ganzhi,
    '',
    data.poem.content,
    '',
    `白話：${data.poem.vernacular}`,
  ];

  if (data.aiInterpretation) {
    lines.push('', `開示摘要：${data.aiInterpretation.slice(0, 120)}${data.aiInterpretation.length > 120 ? '...' : ''}`);
  }

  lines.push('', '神明占卜');
  return lines.join('\n');
}

export async function captureAndShare(viewRef: number, data: ShareCardData): Promise<void> {
  const message = buildShareMessage(data);

  try {
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 0.9,
      result: 'tmpfile',
    });

    await Share.share(
      Platform.OS === 'ios'
        ? { url: uri, message }
        : { url: uri, message: `${message}\n\n由神明占卜 App 產生` },
    );
  } catch (error: any) {
    if (error?.message !== 'User did not share') {
      console.warn('Share card failed:', error);
      await Share.share({ message });
    }
  }
}
