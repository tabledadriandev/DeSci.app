import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { sendCoachMessage } from '../../lib/api';
import { getUserId } from '../../lib/user-id';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function CoachScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    const init = async () => {
      const id = await getUserId();
      setUserId(id);
      if (!id) return;
      setMessages([
        {
          role: 'assistant',
          content:
            "Hi, I'm your AI Health Coach. Ask me anything about your health, nutrition, sleep, training or longevity, and I'll give you evidence-based, practical suggestions.",
        },
      ]);
    };
    init();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!userId) {
      Alert.alert('Profile needed', 'Set your ID in the Profile tab first.');
      return;
    }
    const text = input.trim();
    setInput('');
    const nextHistory = [...messages, { role: 'user', content: text }];
    setMessages(nextHistory);
    setLoading(true);
    try {
      const res = await sendCoachMessage(userId, text, nextHistory);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.response }]);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to contact coach');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>AI COACH</Text>
      <Text style={styles.title}>AI Health Coach</Text>
      <Text style={styles.subtitle}>
        Chat with your GPT-powered health coach about labs, nutrition, training, sleep, and more.
      </Text>

      {!userId && (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            Set your ID in the Profile tab to let the coach use your health data.
          </Text>
        </View>
      )}

      <View style={styles.chatCard}>
        <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={{ paddingBottom: 8 }}>
          {messages.map((msg, index) => (
            <View
              key={index}
              style={[
                styles.bubbleRow,
                msg.role === 'user' ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' },
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  msg.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant,
                ]}
              >
                <Text style={msg.role === 'user' ? styles.textUser : styles.textAssistant}>
                  {msg.content}
                </Text>
              </View>
            </View>
          ))}
          {loading && (
            <View style={[styles.bubbleRow, { justifyContent: 'flex-start' }]}>
              <View style={[styles.bubble, styles.bubbleAssistant]}>
                <ActivityIndicator size="small" color="#0F4C81" />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask the coach anything..."
            style={styles.input}
            editable={!loading}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={loading || !input.trim()}
            style={[styles.sendButton, (loading || !input.trim()) && { opacity: 0.5 }]}
          >
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F3',
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  kicker: {
    fontSize: 12,
    letterSpacing: 4,
    color: '#8B8580',
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F4C81',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B6560',
    marginBottom: 12,
  },
  notice: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    marginBottom: 12,
  },
  noticeText: {
    fontSize: 12,
    color: '#92400E',
  },
  chatCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#0F4C81',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  messages: {
    flex: 1,
  },
  bubbleRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleUser: {
    backgroundColor: '#0F4C81',
  },
  bubbleAssistant: {
    backgroundColor: '#F3F4F6',
  },
  textUser: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  textAssistant: {
    color: '#111827',
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#0F4C81',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  sendText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

