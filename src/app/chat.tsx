// AI 多輪對話頁面 - 針對解籤內容追問
import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, ScrollView, TextInput, ActivityIndicator,
} from 'react-native';
import { TempleTheme, TempleSpacing, TempleFonts } from '@/constants/temple-theme';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '歡迎來到神明對話室 🙏\n\n你可以針對上一支籤詩的解讀來向神明追問，或者直接訴說你的心事。\n\n我將以慈悲智慧之心為你指引方向。',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: 'user', content: input.trim(), timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const apiUrl = process.env.EXPO_PUBLIC_AI_API_URL?.replace('/api/interpret', '/api/chat')
        || (require('react-native').Platform.OS === 'android'
          ? 'http://10.0.2.2:3001/api/chat'
          : 'http://localhost:3001/api/chat');

      const recentMessages = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content,
      }));
      recentMessages.push({ role: 'user', content: userMsg.content });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: recentMessages }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply, timestamp: Date.now() }]);
      } else {
        // 後端不可用，使用本地回覆
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `我聽到了你的心聲 🙏\n\n「${userMsg.content}」\n\n請保持正向信念，心誠則靈。建議可回到求籤頁面向神明請示，獲得更具體的指引。`,
          timestamp: Date.now(),
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `我聽到了你的心聲 🙏\n\n「${userMsg.content}」\n\n請保持正向信念，心誠則靈。多行善事、廣結善緣，自有貴人相助。`,
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={TempleTheme.bgDark} />
      <View style={styles.container}>
        <Text style={styles.pageTitle}>神明對話</Text>

        <ScrollView
          ref={scrollRef}
          style={styles.chatList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, i) => (
            <View
              key={i}
              style={[
                styles.msgBubble,
                msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              <Text style={styles.msgRole}>{msg.role === 'user' ? '🙋 你' : '🏛️ 神明'}</Text>
              {msg.content.split('\n').map((line, j) => (
                <Text
                  key={j}
                  style={[
                    styles.msgText,
                    msg.role === 'user' ? styles.userText : styles.assistantText,
                    line.trim() === '' && { height: 4 },
                  ]}
                >
                  {line || ' '}
                </Text>
              ))}
            </View>
          ))}
          {isLoading && (
            <View style={styles.loading}>
              <ActivityIndicator color={TempleTheme.goldLight} size="small" />
              <Text style={styles.loadingText}>神明思考中...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.chatInput}
            value={input}
            onChangeText={setInput}
            placeholder="向神明訴說你的疑問..."
            placeholderTextColor={TempleTheme.textMuted}
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || isLoading}
          >
            <Text style={styles.sendBtnText}>↑</Text>
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
    fontSize: TempleFonts.subtitle, fontWeight: '900',
    color: TempleTheme.goldLight, textAlign: 'center', marginBottom: TempleSpacing.md,
  },
  chatList: { flex: 1 },
  chatContent: { paddingBottom: TempleSpacing.sm },
  msgBubble: {
    borderRadius: 16, padding: TempleSpacing.md, marginBottom: TempleSpacing.sm, maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: TempleTheme.goldDark + '25',
    borderWidth: 1, borderColor: TempleTheme.goldDark + '40',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: TempleTheme.bgCard,
    borderWidth: 1, borderColor: TempleTheme.gold + '30',
  },
  msgRole: { fontSize: 11, fontWeight: '700', color: TempleTheme.goldLight, marginBottom: 6 },
  msgText: { fontSize: TempleFonts.body, lineHeight: 26 },
  userText: { color: TempleTheme.textLight },
  assistantText: { color: TempleTheme.textLight },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: TempleSpacing.sm },
  loadingText: { fontSize: TempleFonts.small, color: TempleTheme.textMuted },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: TempleSpacing.sm,
    paddingTop: TempleSpacing.sm, borderTopWidth: 1, borderTopColor: TempleTheme.goldDark + '20',
  },
  chatInput: {
    flex: 1, backgroundColor: TempleTheme.bgCard, borderRadius: 12,
    padding: TempleSpacing.sm, fontSize: TempleFonts.body, color: TempleTheme.textLight,
    maxHeight: 80, borderWidth: 1, borderColor: TempleTheme.goldDark + '20',
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: TempleTheme.goldDark,
    justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});
