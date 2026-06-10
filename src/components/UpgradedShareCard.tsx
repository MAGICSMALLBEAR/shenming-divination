// 升級版分享圖卡（P4）— 3 種精美模板
import React, { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { getGodCardImage } from '@/data/godImages';
import type { Poem } from '@/data/poems/leiyushi';

export type ShareCardTemplate = 'classic' | 'festival' | 'minimal';

interface Props {
  template: ShareCardTemplate;
  godId: number;
  godName: string;
  poem: Poem;
  aiSummary?: string;
  festivalName?: string;   // 節慶版專用
  zodiac?: string;         // 生肖版專用
}

// 經典廟宇金色卡
function ClassicCard({ godId, godName, poem, aiSummary }: Props) {
  return (
    <View style={classic.card}>
      <View style={classic.header}>
        <Image source={getGodCardImage(godId)} style={classic.godImg} contentFit="cover" />
        <View style={classic.headerText}>
          <Text style={classic.appName}>神明占卜</Text>
          <Text style={classic.godName}>{godName} 靈籤</Text>
          <Text style={classic.poemNum}>第 {poem.number} 籤・{poem.level}</Text>
        </View>
      </View>
      <View style={classic.divider} />
      <Text style={classic.ganzhi}>{poem.ganzhi}</Text>
      {poem.content.split('\n').map(line => (
        <Text key={line} style={classic.poemLine}>{line}</Text>
      ))}
      <View style={classic.divider} />
      <Text style={classic.vernacular}>{poem.vernacular}</Text>
      {aiSummary ? (
        <Text style={classic.aiSummary} numberOfLines={3}>{aiSummary}</Text>
      ) : null}
      <Text style={classic.footer}>神明占卜 App · 求籤 × AI 解析</Text>
    </View>
  );
}

// 節慶版（紅底金字）
function FestivalCard({ godId, godName, poem, festivalName, aiSummary }: Props) {
  return (
    <View style={festival.card}>
      <View style={festival.topBanner}>
        <Text style={festival.festivalName}>{festivalName ?? '節慶吉日'}</Text>
        <Text style={festival.festivalSub}>神明指引・好運隨行</Text>
      </View>
      <View style={festival.body}>
        <Image source={getGodCardImage(godId)} style={festival.godImg} contentFit="cover" />
        <Text style={festival.godName}>{godName}</Text>
        <Text style={festival.poemNum}>第 {poem.number} 籤・{poem.level}</Text>
        {poem.content.split('\n').slice(0, 2).map(line => (
          <Text key={line} style={festival.poemLine}>{line}</Text>
        ))}
        <Text style={festival.vernacular} numberOfLines={2}>{poem.vernacular}</Text>
        {aiSummary ? (
          <Text style={festival.aiSummary} numberOfLines={2}>{aiSummary}</Text>
        ) : null}
      </View>
      <Text style={festival.footer}>神明占卜 App</Text>
    </View>
  );
}

// 極簡白卡（墨字版）
function MinimalCard({ godId, godName, poem, zodiac, aiSummary }: Props) {
  return (
    <View style={minimal.card}>
      <Text style={minimal.zodiac}>{zodiac ?? ''}</Text>
      <Text style={minimal.poemNum}>第 {poem.number} 籤</Text>
      <Text style={minimal.level}>{poem.level}</Text>
      <View style={minimal.divider} />
      {poem.content.split('\n').map(line => (
        <Text key={line} style={minimal.poemLine}>{line}</Text>
      ))}
      <View style={minimal.divider} />
      <Text style={minimal.godLine}>— {godName} 籤詩</Text>
      <Text style={minimal.vernacular} numberOfLines={3}>{poem.vernacular}</Text>
      {aiSummary ? (
        <Text style={minimal.ai} numberOfLines={2}>{aiSummary}</Text>
      ) : null}
      <Text style={minimal.footer}>神明占卜</Text>
    </View>
  );
}

export const UpgradedShareCard = forwardRef<View, Props>((props, ref) => {
  return (
    <View ref={ref} collapsable={false}>
      {props.template === 'classic' && <ClassicCard {...props} />}
      {props.template === 'festival' && <FestivalCard {...props} />}
      {props.template === 'minimal' && <MinimalCard {...props} />}
    </View>
  );
});

UpgradedShareCard.displayName = 'UpgradedShareCard';

// 生成分享文字（各模板共用，帶 hashtag）
export function buildEnhancedShareText(props: Props): string {
  const { godName, poem, aiSummary, festivalName, zodiac } = props;
  const lines: string[] = [];

  if (festivalName) lines.push(`🎊 ${festivalName}・${godName}籤詩`);
  else if (zodiac) lines.push(`${zodiac}生人・${godName}指引`);
  else lines.push(`${godName}靈籤`);

  lines.push(`第 ${poem.number} 籤・${poem.title}・${poem.level}`);
  lines.push('');
  lines.push(poem.content);
  lines.push('');
  lines.push(`白話：${poem.vernacular}`);

  if (aiSummary) {
    lines.push('');
    lines.push(`神明開示：${aiSummary.slice(0, 100)}${aiSummary.length > 100 ? '...' : ''}`);
  }

  lines.push('');
  lines.push('#神明占卜 #靈籤 #命理 #台灣廟宇');
  return lines.join('\n');
}

// === Styles ===

const classic = StyleSheet.create({
  card: {
    width: 320,
    backgroundColor: '#1A1210',
    borderWidth: 2,
    borderColor: '#B8860B',
    borderRadius: 16,
    padding: 20,
  },
  header: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  godImg: { width: 64, height: 80, borderRadius: 8, borderWidth: 1, borderColor: '#B8860B44' },
  headerText: { flex: 1, justifyContent: 'center' },
  appName: { color: '#A09880', fontSize: 10, marginBottom: 2 },
  godName: { color: '#FFD700', fontWeight: '900', fontSize: 16, marginBottom: 2 },
  poemNum: { color: '#C9A96E', fontSize: 12 },
  divider: { height: 1, backgroundColor: '#B8860B44', marginVertical: 10 },
  ganzhi: { color: '#A09880', fontSize: 11, marginBottom: 8 },
  poemLine: { color: '#F8F8FF', fontSize: 15, lineHeight: 26, fontWeight: '600' },
  vernacular: { color: '#A09880', fontSize: 12, lineHeight: 18 },
  aiSummary: { marginTop: 8, color: '#C9A96E', fontSize: 11, lineHeight: 16, fontStyle: 'italic' },
  footer: { marginTop: 12, color: '#7A6A4A', fontSize: 10, textAlign: 'right' },
});

const festival = StyleSheet.create({
  card: { width: 320, backgroundColor: '#6D0000', borderRadius: 16, overflow: 'hidden' },
  topBanner: {
    backgroundColor: '#990000',
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#FFD70066',
  },
  festivalName: { color: '#FFD700', fontWeight: '900', fontSize: 20 },
  festivalSub: { color: '#FFECAA', fontSize: 11, marginTop: 2 },
  body: { padding: 20, alignItems: 'center', gap: 6 },
  godImg: { width: 72, height: 90, borderRadius: 10, borderWidth: 2, borderColor: '#FFD70066', marginBottom: 4 },
  godName: { color: '#FFD700', fontWeight: '900', fontSize: 16 },
  poemNum: { color: '#FFECAA', fontSize: 12 },
  poemLine: { color: '#F8F8FF', fontSize: 15, lineHeight: 26, fontWeight: '600', textAlign: 'center' },
  vernacular: { color: '#FFD70088', fontSize: 11, lineHeight: 16, textAlign: 'center' },
  aiSummary: { color: '#FFECAA', fontSize: 11, lineHeight: 16, textAlign: 'center', fontStyle: 'italic' },
  footer: { color: '#FFD70066', fontSize: 10, textAlign: 'center', paddingBottom: 14 },
});

const minimal = StyleSheet.create({
  card: { width: 320, backgroundColor: '#FFFEF5', borderRadius: 16, padding: 24 },
  zodiac: { color: '#8B6914', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  poemNum: { color: '#2C1E10', fontSize: 20, fontWeight: '900', marginBottom: 2 },
  level: { color: '#7A5C0A', fontSize: 14, fontWeight: '700', marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#B8860B33', marginVertical: 10 },
  poemLine: { color: '#1A1210', fontSize: 15, lineHeight: 28, fontWeight: '600' },
  godLine: { color: '#8B6914', fontSize: 12, fontStyle: 'italic', textAlign: 'right', marginBottom: 6 },
  vernacular: { color: '#5C4A2A', fontSize: 12, lineHeight: 18 },
  ai: { marginTop: 8, color: '#7A5C0A', fontSize: 11, lineHeight: 16, fontStyle: 'italic' },
  footer: { marginTop: 14, color: '#B8A078', fontSize: 10, textAlign: 'right' },
});
