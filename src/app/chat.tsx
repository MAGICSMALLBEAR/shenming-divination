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

import { TempleFonts, TempleSpacing } from '@/constants/temple-theme';
import { getLastPoemContext, type LastPoemContext } from '@/services/storage';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { ThemeColors } from '@/constants/themes';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const FALLBACK_WELCOME =
  '把你想繼續追問的事情告訴我，我會沿著上一支籤的脈絡幫你整理重點、下一步與需要注意的地方。';

function buildInitialAssistantMessage(lastPoem: LastPoemContext | null): string {
  if (!lastPoem) return FALLBACK_WELCOME;

  return [
    '我已經接上你上一支籤的脈絡。',
    `${lastPoem.godName} · ${lastPoem.poemTitle} · ${lastPoem.poemLevel}`,
    lastPoem.question ? `你當時問的是：${lastPoem.question}` : '',
    lastPoem.aiInterpretation
      ? `先前解讀摘要：${lastPoem.aiInterpretation.replace(/\n+/g, ' ').slice(0, 120)}...`
      : '',
    '你可以直接追問細節、下一步，或想確認的時間點。',
  ]
    .filter(Boolean)
    .join('\n\n');
}

export default function ChatScreen() {
  const layout = useResponsiveLayout();
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
      return ['我現在最該先做什麼？', '這件事適合主動推進嗎？', '我需要先避開什麼？'];
    }

    return [
      lastPoem.question
        ? `關於「${lastPoem.question}」，我接下來最重要的一步是什麼？`
        : '我接下來最重要的一步是什麼？',
      '這支籤比較像提醒我保守，還是其實可以慢慢推進？',
      '如果我要再追問一次，最值得確認的是哪個方向？',
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

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const apiUrl =
        process.env.EXPO_PUBLIC_AI_API_URL?.replace('/api/interpret', '/api/chat') ||
        (Platform.OS === 'android'
          ? 'http://10.0.2.2:3001/api/chat'
          : 'http://localhost:3001/api/chat');

      const systemContent = lastPoem
        ? [
            `你正在延續解讀 ${lastPoem.godName} 的籤詩。`,
            `籤題：${lastPoem.poemTitle} / ${lastPoem.poemLevel}`,
            `籤文：${lastPoem.poemContent}`,
            lastPoem.question ? `原本提問：${lastPoem.question}` : '',
            lastPoem.aiInterpretation ? `先前解讀：${lastPoem.aiInterpretation}` : '',
            '請用溫和、具體、簡潔的方式回答，並聚焦在下一步與提醒。',
          ]
            .filter(Boolean)
            .join('\n')
        : '你是神明占卜 App 的追問助手，回答要溫和、具體、可執行。';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemContent },
            ...nextMessages.slice(-6).map((message) => ({
              role: message.role,
              content: message.content,
            })),
          ],
        }),
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
            '我剛剛沒有成功連上 AI，但還是可以先這樣理解：先別急著求大答案，先把你現在最在意的那一件事拆成一個小步驟，做完後再回頭看局勢會更清楚。',
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
      <StatusBar barStyle="light-content" backgroundColor={theme.bgDark} />
      <View
        style={[
          styles.container,
          { maxWidth: layout.narrowMaxWidth, paddingHorizontal: layout.gutter },
        ]}
      >
        <Text style={styles.pageTitle}>AI 追問解籤</Text>

        {lastPoem ? (
          <View style={styles.contextCard}>
            <Text style={styles.contextTitle}>目前承接的籤詩</Text>
            <Text style={styles.contextMain}>
              {lastPoem.godName} · {lastPoem.poemTitle}
            </Text>
            <Text style={styles.contextSub}>{lastPoem.poemLevel}</Text>
            {lastPoem.question ? (
              <Text style={styles.contextQuestion}>原問題：{lastPoem.question}</Text>
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
                layout.isDesktop && styles.msgBubbleDesktop,
                message.role === 'user' ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              <Text style={styles.msgRole}>
                {message.role === 'user' ? '你' : '解籤助手'}
              </Text>
              {message.content.split('\n').map((line, lineIndex) => (
                <Text
                  key={lineIndex}
                  style={[
                    styles.msgText,
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
              <ActivityIndicator color={theme.goldLight} size="small" />
              <Text style={styles.loadingText}>正在整理回應...</Text>
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
            placeholder="直接輸入你想追問的內容..."
            placeholderTextColor={theme.textMuted}
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

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.bgDark },
  container: { flex: 1, width: '100%', alignSelf: 'center', paddingVertical: TempleSpacing.md },
  pageTitle: {
    fontSize: TempleFonts.subtitle,
    fontWeight: '900',
    color: theme.goldLight,
    textAlign: 'center',
    marginBottom: TempleSpacing.md,
  },
  contextCard: {
    backgroundColor: theme.bgCard,
    borderRadius: 12,
    padding: TempleSpacing.md,
    borderWidth: 1,
    borderColor: theme.goldDark + '35',
    marginBottom: TempleSpacing.sm,
  },
  contextTitle: {
    fontSize: 11,
    color: theme.textMuted,
    marginBottom: 6,
  },
  contextMain: {
    fontSize: TempleFonts.body,
    color: theme.goldLight,
    fontWeight: '700',
  },
  contextSub: {
    fontSize: TempleFonts.small,
    color: theme.gold,
    marginTop: 2,
  },
  contextQuestion: {
    fontSize: TempleFonts.small,
    color: theme.textMuted,
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
  msgBubbleDesktop: {
    maxWidth: '74%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: theme.goldDark + '25',
    borderWidth: 1,
    borderColor: theme.goldDark + '40',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.gold + '30',
  },
  msgRole: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.goldLight,
    marginBottom: 6,
  },
  msgText: {
    fontSize: TempleFonts.body,
    lineHeight: 24,
    color: theme.textLight,
  },
  msgBlankLine: { height: 6 },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: TempleSpacing.sm,
  },
  loadingText: {
    fontSize: TempleFonts.small,
    color: theme.textMuted,
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
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.goldDark + '25',
  },
  quickPromptText: {
    fontSize: 12,
    color: theme.textLight,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: TempleSpacing.sm,
    paddingTop: TempleSpacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.goldDark + '20',
  },
  chatInput: {
    flex: 1,
    backgroundColor: theme.bgCard,
    borderRadius: 12,
    padding: TempleSpacing.sm,
    fontSize: TempleFonts.body,
    color: theme.textLight,
    maxHeight: 96,
    minHeight: 48,
    borderWidth: 1,
    borderColor: theme.goldDark + '20',
  },
  sendBtn: {
    minWidth: 64,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.goldDark,
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
}
