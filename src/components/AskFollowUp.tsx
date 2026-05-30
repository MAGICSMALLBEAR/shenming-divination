// AI 追問元件 - 嵌入結果頁底部
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { TempleTheme, TempleSpacing, TempleFonts } from '@/constants/temple-theme';

interface AskFollowUpProps {
  godName: string;
  poemContent: string;
  aiInterpretation?: string | null;
}

interface Message { role: 'user' | 'ai'; text: string }

export function AskFollowUp({ godName, poemContent, aiInterpretation }: AskFollowUpProps) {
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const apiUrl = process.env.EXPO_PUBLIC_AI_API_URL?.replace('/api/interpret', '/api/chat')
    || (require('react-native').Platform.OS === 'android'
      ? 'http://10.0.2.2:3001/api/chat'
      : 'http://localhost:3001/api/chat');

  const handleAsk = async () => {
    if (!input.trim() || isLoading) return;
    const q = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setIsLoading(true);

    try {
      const context = [
        { role: 'system', content: `你是【${godName}】，信眾剛得到以下籤詩：「${poemContent}」。已解籤如下：${aiInterpretation || ''}。請繼續以慈悲智慧的語氣回答信眾的追問。回應請控制在150字內。` },
        ...messages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
        { role: 'user', content: q },
      ];

      const resp = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: context }),
      });

      if (resp.ok) {
        const data = await resp.json();
        setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
      } else {
        throw new Error('API error');
      }
    } catch {
      // 本地後備回應
      const fallbacks = [
        `「${q}」— 此事當以平常心對待，${godName}已在籤中給予指引，細細體會自有答案。`,
        `信眾勿急，${godName}提示：行事需循序漸進，時機一到自然水到渠成。`,
        `誠心祈求，${godName}庇佑。你所問之事，靜下心來思考，答案其實已在你心中。`,
      ];
      setMessages(prev => [...prev, { role: 'ai', text: fallbacks[messages.length % 3] }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.toggleBtn} onPress={() => setExpanded(!expanded)}>
        <Text style={styles.toggleText}>🙏 向{godName}追問</Text>
        <Text style={styles.toggleArrow}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.panel}>
          {messages.map((m, i) => (
            <View key={i} style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.aiBubble]}>
              <Text style={styles.bubbleRole}>{m.role === 'user' ? '🙋 你' : `🏛️ ${godName}`}</Text>
              <Text style={styles.bubbleText}>{m.text}</Text>
            </View>
          ))}

          {isLoading && (
            <View style={styles.loading}>
              <ActivityIndicator size="small" color={TempleTheme.goldLight} />
              <Text style={styles.loadingText}>{godName}思考中...</Text>
            </View>
          )}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder={`問${godName}任何事...`}
              placeholderTextColor={TempleTheme.textMuted}
              onSubmitEditing={handleAsk}
            />
            <TouchableOpacity
              style={[styles.askBtn, (!input.trim() || isLoading) && styles.askBtnDisabled]}
              onPress={handleAsk}
              disabled={!input.trim() || isLoading}
            >
              <Text style={styles.askBtnText}>問</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: TempleSpacing.sm },
  toggleBtn: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: TempleSpacing.sm, paddingHorizontal: TempleSpacing.md,
    backgroundColor: TempleTheme.bgCard, borderRadius: 10,
    borderWidth: 1, borderColor: TempleTheme.gold + '30',
  },
  toggleText: { fontSize: TempleFonts.small, color: TempleTheme.goldLight, fontWeight: '600' },
  toggleArrow: { fontSize: 10, color: TempleTheme.textMuted },
  panel: {
    marginTop: TempleSpacing.xs, backgroundColor: TempleTheme.bgCard,
    borderRadius: 12, borderWidth: 1, borderColor: TempleTheme.gold + '20',
    overflow: 'hidden',
  },
  bubble: { padding: TempleSpacing.sm, margin: TempleSpacing.xs, borderRadius: 10 },
  userBubble: { backgroundColor: TempleTheme.goldDark + '20', alignSelf: 'flex-end', maxWidth: '80%' },
  aiBubble: { backgroundColor: TempleTheme.bgDark + '50', alignSelf: 'flex-start', maxWidth: '90%' },
  bubbleRole: { fontSize: 11, color: TempleTheme.goldLight, fontWeight: '700', marginBottom: 4 },
  bubbleText: { fontSize: TempleFonts.small, color: TempleTheme.textLight, lineHeight: 20 },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: TempleSpacing.sm },
  loadingText: { fontSize: TempleFonts.small, color: TempleTheme.textMuted },
  inputRow: {
    flexDirection: 'row', padding: TempleSpacing.sm, gap: TempleSpacing.xs,
    borderTopWidth: 1, borderTopColor: TempleTheme.goldDark + '20',
  },
  input: {
    flex: 1, backgroundColor: TempleTheme.bgDark + '40', borderRadius: 8,
    padding: 8, fontSize: TempleFonts.small, color: TempleTheme.textLight,
  },
  askBtn: {
    width: 40, height: 36, borderRadius: 8, backgroundColor: TempleTheme.goldDark,
    justifyContent: 'center', alignItems: 'center',
  },
  askBtnDisabled: { opacity: 0.4 },
  askBtnText: { color: '#FFF', fontWeight: '700' },
});
