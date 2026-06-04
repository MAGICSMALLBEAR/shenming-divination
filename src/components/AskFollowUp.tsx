import React, { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { TempleTheme, TempleSpacing, TempleFonts } from '@/constants/temple-theme';

interface AskFollowUpProps {
  godName: string;
  poemContent: string;
  aiInterpretation?: string | null;
}

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export function AskFollowUp({ godName, poemContent, aiInterpretation }: AskFollowUpProps) {
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const apiUrl =
    process.env.EXPO_PUBLIC_AI_API_URL?.replace('/api/interpret', '/api/chat') ||
    (require('react-native').Platform.OS === 'android'
      ? 'http://10.0.2.2:3001/api/chat'
      : 'http://localhost:3001/api/chat');

  const quickPrompts = [
    `關於這支籤，我最該先做的事是什麼？`,
    `這支籤比較像提醒我暫緩，還是其實可以穩穩往前？`,
    `如果我想再確認一次，最值得追問的是哪個方向？`,
  ];

  const handleAsk = async (rawInput?: string) => {
    const question = (rawInput ?? input).trim();
    if (!question || isLoading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setIsLoading(true);

    try {
      const context = [
        {
          role: 'system',
          content: [
            `你正在延續解讀 ${godName} 的籤詩。`,
            `籤文：${poemContent}`,
            aiInterpretation ? `先前解讀：${aiInterpretation}` : '',
            '請用溫和、具體、短而有用的方式回答，盡量給下一步。',
          ]
            .filter(Boolean)
            .join('\n'),
        },
        ...messages.map((message) => ({
          role: message.role === 'user' ? 'user' : 'assistant',
          content: message.text,
        })),
        { role: 'user', content: question },
      ];

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: context }),
      });

      if (!response.ok) {
        throw new Error('API error');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'ai', text: data.reply }]);
    } catch {
      const fallbacks = [
        `以這支${godName}的籤意來看，先不要急著求一次到位，先做一個最明確的小步驟會更好。`,
        `如果你現在心裡還很亂，代表這題更需要先整理局勢，而不是立刻做大決定。`,
        `你可以把問題再縮小一點，先問「我下一步最該確認什麼」，通常會更清楚。`,
      ];
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: fallbacks[prev.length % fallbacks.length] },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.toggleBtn} onPress={() => setExpanded(!expanded)}>
        <Text style={styles.toggleText}>和 {godName} 再追問一次</Text>
        <Text style={styles.toggleArrow}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded ? (
        <View style={styles.panel}>
          <View style={styles.quickPromptList}>
            {quickPrompts.map((prompt) => (
              <TouchableOpacity
                key={prompt}
                style={styles.quickPromptChip}
                onPress={() => handleAsk(prompt)}
              >
                <Text style={styles.quickPromptText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {messages.map((message, index) => (
            <View
              key={`${message.role}-${index}`}
              style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.aiBubble]}
            >
              <Text style={styles.bubbleRole}>
                {message.role === 'user' ? '你' : `${godName}解讀`}
              </Text>
              <Text style={styles.bubbleText}>{message.text}</Text>
            </View>
          ))}

          {isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="small" color={TempleTheme.goldLight} />
              <Text style={styles.loadingText}>{godName}正在整理回應...</Text>
            </View>
          ) : null}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder={`想再問 ${godName} 什麼？`}
              placeholderTextColor={TempleTheme.textMuted}
            />
            <TouchableOpacity
              style={[styles.askBtn, (!input.trim() || isLoading) && styles.askBtnDisabled]}
              onPress={() => handleAsk()}
              disabled={!input.trim() || isLoading}
            >
              <Text style={styles.askBtnText}>送出</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: TempleSpacing.sm },
  toggleBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: TempleSpacing.sm,
    paddingHorizontal: TempleSpacing.md,
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: TempleTheme.gold + '30',
  },
  toggleText: {
    fontSize: TempleFonts.small,
    color: TempleTheme.goldLight,
    fontWeight: '600',
  },
  toggleArrow: { fontSize: 10, color: TempleTheme.textMuted },
  panel: {
    marginTop: TempleSpacing.xs,
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: TempleTheme.gold + '20',
    overflow: 'hidden',
  },
  quickPromptList: {
    padding: TempleSpacing.sm,
    gap: TempleSpacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: TempleTheme.goldDark + '15',
  },
  quickPromptChip: {
    borderRadius: 10,
    backgroundColor: TempleTheme.bgDark + '50',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '20',
  },
  quickPromptText: {
    color: TempleTheme.textLight,
    fontSize: 12,
    lineHeight: 18,
  },
  bubble: { padding: TempleSpacing.sm, margin: TempleSpacing.xs, borderRadius: 10 },
  userBubble: {
    backgroundColor: TempleTheme.goldDark + '20',
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  aiBubble: {
    backgroundColor: TempleTheme.bgDark + '50',
    alignSelf: 'flex-start',
    maxWidth: '90%',
  },
  bubbleRole: {
    fontSize: 11,
    color: TempleTheme.goldLight,
    fontWeight: '700',
    marginBottom: 4,
  },
  bubbleText: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textLight,
    lineHeight: 20,
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: TempleSpacing.sm,
  },
  loadingText: { fontSize: TempleFonts.small, color: TempleTheme.textMuted },
  inputRow: {
    flexDirection: 'row',
    padding: TempleSpacing.sm,
    gap: TempleSpacing.xs,
    borderTopWidth: 1,
    borderTopColor: TempleTheme.goldDark + '20',
  },
  input: {
    flex: 1,
    backgroundColor: TempleTheme.bgDark + '40',
    borderRadius: 8,
    padding: 8,
    fontSize: TempleFonts.small,
    color: TempleTheme.textLight,
  },
  askBtn: {
    minWidth: 54,
    height: 36,
    borderRadius: 8,
    backgroundColor: TempleTheme.goldDark,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  askBtnDisabled: { opacity: 0.4 },
  askBtnText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
});
