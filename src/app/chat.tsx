import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { TempleFonts, TempleSpacing, TempleTheme } from '@/constants/temple-theme';
import { getLastPoemContext, type LastPoemContext } from '@/services/storage';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const FALLBACK_WELCOME =
  '我是你的解籤追問助手。你可以直接問我這支籤對感情、工作、時間點、該怎麼做，或幫你把神明給的提醒拆成更容易行動的版本。';

function buildInitialAssistantMessage(lastPoem: LastPoemContext | null): string {
  if (!lastPoem) return FALLBACK_WELCOME;

  const summary = [
    `我先接上你最近一次的籤詩脈絡。`,
    `${lastPoem.godName} | ${lastPoem.poemTitle} | ${lastPoem.poemLevel}`,
    lastPoem.question ? `當時問的是：${lastPoem.question}` : '',
    lastPoem.aiInterpretation
      ? `上次解讀摘要：${lastPoem.aiInterpretation.slice(0, 100)}${lastPoem.aiInterpretation.length > 100 ? '...' : ''}`
      : '',
    '你現在可以直接追問細節，我會沿著這支籤繼續幫你拆。',
  ].filter(Boolean);

  return summary.join('\n\n');
}

export default function ChatScreen() {
  const [lastPoem, setLastPoem] = useState<LastPoemContext | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: FALLBACK_WELCOME,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    getLastPoemContext().then((context) => {
      setLastPoem(context);
      setMessages([
        {
          role: 'assistant',
          content: buildInitialAssistantMessage(context),
          timestamp: Date.now(),
        },
      ]);
    });
  }, []);

  const quickPrompts = useMemo(() => {
    if (!lastPoem) {
      return ['這支籤大方向在提醒我什麼？', '我下一步應該先做什麼？'];
    }

    return [
      lastPoem.question
        ? `如果回到「${lastPoem.question}」，這支籤最重要的提醒是什麼？`
        : '這支籤最核心的提醒是什麼？',
      '這件事接下來一週我適合怎麼做？',
      '這支籤裡有哪些我容易誤會的地方？',
    ];
  }, [lastPoem]);

  const sendMessage = async (rawContent: string) => {
    const content = rawContent.trim();
    if (!content || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiUrl =
        process.env.EXPO_PUBLIC_AI_API_URL?.replace('/api/interpret', '/api/chat') ||
        (Platform.OS === 'android'
          ? 'http://10.0.2.2:3001/api/chat'
          : 'http://localhost:3001/api/chat');

      const systemContent = lastPoem
        ? `你正在延續一支籤詩的追問。神明：${lastPoem.godName}。籤題：${lastPoem.poemTitle}。籤等：${lastPoem.poemLevel}。籤文：${lastPoem.poemContent}。${lastPoem.question ? `原始問題：${lastPoem.question}。` : ''}${lastPoem.aiInterpretation ? `先前解讀：${lastPoem.aiInterpretation}。` : ''}請用溫和、具體、可行動的方式回答，避免武斷斷言。`
        : '你是神明占卜 app 的追問助手。請延續使用者當下的問題脈絡，用溫和、具體、可行動的方式回答，避免武斷斷言。';

      const recentMessages = [
        { role: 'system', content: systemContent },
        ...messages.slice(-6).map((message) => ({
          role: message.role,
          content: message.content,
        })),
        { role: 'user', content },
      ];

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: recentMessages }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply,
          timestamp: Date.now(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '我先用本地模式陪你繼續拆這支籤。你可以改問得更具體一點，例如「如果我要等，應該等多久」或「這支籤比較像提醒我先停還是先動」。',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={TempleTheme.bgDark} />
      <View style={styles.container}>
        <Text style={styles.pageTitle}>AI 追問解籤</Text>

        {lastPoem ? (
          <View style={styles.contextCard}>
            <Text style={styles.contextTitle}>目前追問脈絡</Text>
            <Text style={styles.contextMain}>
              {lastPoem.godName} | {lastPoem.poemTitle}
            </Text>
            <Text style={styles.contextSub}>{lastPoem.poemLevel}</Text>
            {lastPoem.question ? (
              <Text style={styles.contextQuestion}>原始提問：{lastPoem.question}</Text>
            ) : null}
          </View>
        ) : null}

        <ScrollView
          ref={scrollRef}
          style={styles.chatList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message, index) => (
            <View
              key={`${message.timestamp}-${index}`}
              style={[
                styles.msgBubble,
                message.role === 'user' ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              <Text style={styles.msgRole}>
                {message.role === 'user' ? '你' : '追問助手'}
              </Text>
              {message.content.split('\n').map((line, lineIndex) => (
                <Text
                  key={lineIndex}
                  style={[
                    styles.msgText,
                    message.role === 'user' ? styles.userText : styles.assistantText,
                    !line.trim() && styles.msgBlankLine,
                  ]}
                >
                  {line || ' '}
                </Text>
              ))}
            </View>
          ))}

          {isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={TempleTheme.goldLight} size="small" />
              <Text style={styles.loadingText}>正在整理回覆...</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.quickPromptSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {quickPrompts.map((prompt) => (
              <TouchableOpacity
                key={prompt}
                style={styles.quickPromptChip}
                onPress={() => sendMessage(prompt)}
                disabled={isLoading}
              >
                <Text style={styles.quickPromptText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.chatInput}
            value={input}
            onChangeText={setInput}
            placeholder="直接問：時間點、感情、工作、下一步..."
            placeholderTextColor={TempleTheme.textMuted}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
          >
            <Text style={styles.sendBtnText}>送出</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: TempleTheme.bgDark },
  container: { flex: 1, padding: TempleSpacing.md },
  pageTitle: {
    fontSize: TempleFonts.subtitle,
    fontWeight: '900',
    color: TempleTheme.goldLight,
    textAlign: 'center',
    marginBottom: TempleSpacing.md,
  },
  contextCard: {
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 12,
    padding: TempleSpacing.md,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '35',
    marginBottom: TempleSpacing.sm,
  },
  contextTitle: {
    fontSize: 11,
    color: TempleTheme.textMuted,
    marginBottom: 6,
  },
  contextMain: {
    fontSize: TempleFonts.body,
    color: TempleTheme.goldLight,
    fontWeight: '700',
  },
  contextSub: {
    fontSize: TempleFonts.small,
    color: TempleTheme.gold,
    marginTop: 2,
  },
  contextQuestion: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
    marginTop: TempleSpacing.xs,
    lineHeight: 20,
  },
  chatList: { flex: 1 },
  chatContent: { paddingBottom: TempleSpacing.sm },
  msgBubble: {
    borderRadius: 16,
    padding: TempleSpacing.md,
    marginBottom: TempleSpacing.sm,
    maxWidth: '88%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: TempleTheme.goldDark + '25',
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '40',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: TempleTheme.bgCard,
    borderWidth: 1,
    borderColor: TempleTheme.gold + '30',
  },
  msgRole: {
    fontSize: 11,
    fontWeight: '700',
    color: TempleTheme.goldLight,
    marginBottom: 6,
  },
  msgText: {
    fontSize: TempleFonts.body,
    lineHeight: 24,
  },
  userText: { color: TempleTheme.textLight },
  assistantText: { color: TempleTheme.textLight },
  msgBlankLine: { height: 6 },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: TempleSpacing.sm,
  },
  loadingText: {
    fontSize: TempleFonts.small,
    color: TempleTheme.textMuted,
  },
  quickPromptSection: {
    marginTop: TempleSpacing.xs,
    marginBottom: TempleSpacing.sm,
  },
  quickPromptChip: {
    marginRight: TempleSpacing.xs,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: TempleTheme.bgCard,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '25',
  },
  quickPromptText: {
    fontSize: 12,
    color: TempleTheme.textLight,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: TempleSpacing.sm,
    paddingTop: TempleSpacing.sm,
    borderTopWidth: 1,
    borderTopColor: TempleTheme.goldDark + '20',
  },
  chatInput: {
    flex: 1,
    backgroundColor: TempleTheme.bgCard,
    borderRadius: 12,
    padding: TempleSpacing.sm,
    fontSize: TempleFonts.body,
    color: TempleTheme.textLight,
    maxHeight: 96,
    minHeight: 48,
    borderWidth: 1,
    borderColor: TempleTheme.goldDark + '20',
  },
  sendBtn: {
    minWidth: 64,
    height: 44,
    borderRadius: 22,
    backgroundColor: TempleTheme.goldDark,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
