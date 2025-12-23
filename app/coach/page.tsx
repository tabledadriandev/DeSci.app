'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations/variants';
import AnimatedCard from '@/components/ui/AnimatedCard';
import AnimatedButton from '@/components/ui/AnimatedButton';
import PageTransition from '@/components/ui/PageTransition';
import { Send, Sparkles, Lightbulb, Activity, Utensils, Heart, Brain, Moon, Beaker, Zap, Calendar, Bot, Trash2, Download, History, Info, TrendingUp, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

const QUICK_ACTIONS = [
  { icon: Utensils, label: 'Analyze Last Meal', action: 'quick_action', quickAction: 'analyze_last_meal', color: 'from-orange-500 to-red-500' },
  { icon: Calendar, label: '7-Day Meal Plan', action: 'quick_action', quickAction: 'design_7_day_meal_plan', color: 'from-blue-500 to-cyan-500' },
  { icon: Activity, label: 'Workout Today', action: 'quick_action', quickAction: 'generate_workout_today', color: 'from-green-500 to-emerald-500' },
  { icon: Moon, label: 'Improve Sleep', action: 'quick_action', quickAction: 'improve_sleep_tonight', color: 'from-indigo-500 to-purple-500' },
  { icon: Brain, label: 'Reduce Stress Now', action: 'quick_action', quickAction: 'reduce_stress_now', color: 'from-pink-500 to-rose-500' },
  { icon: Beaker, label: 'Interpret Labs', action: 'quick_action', quickAction: 'interpret_latest_labs', color: 'from-teal-500 to-cyan-500' },
  { icon: Heart, label: 'Heart Health', prompt: 'How can I improve my cardiovascular health?', color: 'from-red-500 to-pink-500' },
  { icon: Lightbulb, label: 'Longevity', prompt: 'What are evidence-based longevity strategies?', color: 'from-yellow-500 to-orange-500' },
];

export default function AICoachPage() {
  const { address } = useAccount();
  const { showToast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [healthContext, setHealthContext] = useState<any>(null);
  const [showContext, setShowContext] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (address) {
      loadHealthContext();
      loadConversationHistory();
      setMessages([
        {
          role: 'assistant',
          content:
            "Hello! I'm your AI Health Coach. I can help you with:\n\n• Interpreting lab results\n• Meal planning and nutrition\n• Exercise recommendations\n• Stress management\n• Longevity strategies\n• Answering health questions\n\nWhat would you like to know?",
        },
      ]);
    } else {
      setMessages([]);
      setConversationHistory([]);
    }
  }, [address]);

  const loadConversationHistory = async () => {
    if (!address) return;
    try {
      // In a real app, this would fetch from /api/coach/conversations
      // For now, we'll use localStorage
      const saved = localStorage.getItem(`coach_conversations_${address}`);
      if (saved) {
        const history = JSON.parse(saved);
        setConversationHistory(history);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const saveConversation = () => {
    if (!address || messages.length <= 1) return;
    const sessionId = activeSession || `session_${Date.now()}`;
    const session = {
      id: sessionId,
      title: messages.find((m) => m.role === 'user')?.content?.slice(0, 50) || 'New Conversation',
      messages,
      createdAt: new Date().toISOString(),
    };
    const updated = [...conversationHistory.filter((s) => s.id !== sessionId), session];
    setConversationHistory(updated);
    localStorage.setItem(`coach_conversations_${address}`, JSON.stringify(updated));
    setActiveSession(sessionId);
  };

  const exportConversation = () => {
    const text = messages
      .map((m) => `${m.role === 'user' ? 'You' : 'Coach'}: ${m.content}`)
      .join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coach-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearConversation = () => {
    if (confirm('Clear this conversation?')) {
      setMessages([
        {
          role: 'assistant',
          content:
            "Hello! I'm your AI Health Coach. How can I help you today?",
        },
      ]);
      setActiveSession(null);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHealthContext = async () => {
    try {
      const response = await fetch(`/api/health/context?userId=${address}`);
      const data = await response.json();
      setHealthContext(data);
    } catch (error) {
      console.error('Error loading health context:', error);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const message = messageText || input.trim();
    if (!message) {
      showToast({
        variant: 'error',
        title: 'Empty Message',
        description: 'Please enter a message before sending.',
      });
      return;
    }
    if (!address) {
      showToast({
        variant: 'error',
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to use the AI coach.',
      });
      return;
    }

    const userMessage = { role: 'user', content: message };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          message,
          history: messages,
          healthContext,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage = { role: 'assistant', content: data.response };
        setMessages((prev) => [...prev, assistantMessage]);
        // Auto-save after assistant response
        setTimeout(() => saveConversation(), 500);
      } else {
        const error = await response.json().catch(() => ({ error: 'Failed to get response' }));
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        }]);
        showToast({
          variant: 'error',
          title: 'Request Failed',
          description: error.error || 'Unable to get response from AI coach.',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }]);
      showToast({
        variant: 'error',
        title: 'Network Error',
        description: 'Unable to connect to the AI coach. Please check your connection.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action: any) => {
    if (!address) {
      showToast({
        variant: 'error',
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to use quick actions.',
      });
      return;
    }

    if (action.quickAction) {
      try {
        setLoading(true);
        const response = await fetch('/api/coach/quick-action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: address,
            action: action.quickAction,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setMessages((prev) => [...prev, {
            role: 'assistant',
            content: data.response || data.message || 'Quick action completed successfully.',
          }]);
        } else {
          const error = await response.json().catch(() => ({ error: 'Failed to process quick action' }));
          showToast({
            variant: 'error',
            title: 'Action Failed',
            description: error.error || 'Unable to process quick action. Please try again.',
          });
        }
      } catch (error) {
        console.error('Error:', error);
        showToast({
          variant: 'error',
          title: 'Network Error',
          description: 'Unable to connect to the server. Please check your connection.',
        });
      } finally {
        setLoading(false);
      }
    } else if (action.prompt) {
      await sendMessage(action.prompt);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen  p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
            >
              <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold gradient-text">
                  AI Health Coach
                </h1>
                <p className="text-text-secondary text-lg">
                  Your personalized wellness assistant powered by AI
                </p>
              </div>
            </div>
            </motion.div>
          </div>

          {!address && (
            <div className="max-w-3xl mb-8">
              <AnimatedCard className="text-center py-10">
                <p className="text-sm text-text-secondary mb-4">
                  Connect your wallet to unlock your personalized AI health coaching experience.
                </p>
                <p className="text-xs text-text-tertiary">
                  The coach tailors answers using your assessments, biomarker trends, and habits.
                </p>
              </AnimatedCard>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <motion.div
                initial="initial"
                animate="animate"
                variants={fadeInUp}
                transition={{ delay: 0.1 }}
              >
              <AnimatedCard>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent-primary" />
                    Quick Actions
                  </h2>
                  {conversationHistory.length > 0 && (
                    <button
                      onClick={() => {
                        // Toggle history view
                        const historyPanel = document.getElementById('history-panel');
                        if (historyPanel) {
                          historyPanel.classList.toggle('hidden');
                        }
                      }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                      title="Conversation history"
                    >
                      <History className="w-4 h-4 text-text-tertiary" />
                    </button>
                  )}
                </div>

                {/* Conversation History */}
                {conversationHistory.length > 0 && (
                  <div id="history-panel" className="mb-4 p-3 bg-gray-50 rounded-xl space-y-2 max-h-48 overflow-y-auto">
                    <div className="text-xs font-semibold text-text-secondary mb-2">Recent Conversations</div>
                    {conversationHistory.slice(-5).reverse().map((session) => (
                      <button
                        key={session.id}
                        onClick={() => {
                          setMessages(session.messages);
                          setActiveSession(session.id);
                        }}
                        className={`w-full text-left p-2 rounded-lg text-xs transition ${
                          activeSession === session.id
                            ? 'bg-accent-primary/10 text-accent-primary'
                            : 'hover:bg-gray-100 text-text-secondary'
                        }`}
                      >
                        <div className="font-medium truncate">{session.title}</div>
                        <div className="text-[10px] text-text-tertiary">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <div className="space-y-3">
                  {QUICK_ACTIONS.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <button
                          onClick={() => handleQuickAction(action)}
                          disabled={loading}
                          className={`w-full p-4 rounded-xl border-2 border-gray-200 hover:border-accent-primary/50 transition-all text-left group ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-semibold text-text-primary">{action.label}</span>
                        </div>
                      </button>
                      </motion.div>
                    );
                  })}
                </div>
              </AnimatedCard>
              </motion.div>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <motion.div
                initial="initial"
                animate="animate"
                variants={fadeInUp}
                transition={{ delay: 0.2 }}
              >
              <AnimatedCard className="flex flex-col h-[calc(100vh-200px)]">
                {/* Chat Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-text-primary">Conversation</h3>
                    {healthContext && (
                      <button
                        onClick={() => setShowContext(!showContext)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                        title="View health context"
                      >
                        <Info className="w-4 h-4 text-text-tertiary" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {messages.length > 1 && (
                      <>
                        <button
                          onClick={exportConversation}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                          title="Export conversation"
                        >
                          <Download className="w-4 h-4 text-text-tertiary" />
                        </button>
                        <button
                          onClick={clearConversation}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                          title="Clear conversation"
                        >
                          <Trash2 className="w-4 h-4 text-text-tertiary" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Health Context Panel */}
                {showContext && healthContext && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="mb-4 p-4 bg-accent-primary/5 rounded-xl border border-accent-primary/20">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-accent-primary" />
                      <span className="text-sm font-semibold text-text-primary">Health Context</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {healthContext.healthScore && (
                        <div>
                          <span className="text-text-secondary">Health Score:</span>
                          <span className="ml-2 font-semibold text-accent-primary">
                            {healthContext.healthScore.toFixed(1)}/100
                          </span>
                        </div>
                      )}
                      {healthContext.recentBiomarkers?.length > 0 && (
                        <div>
                          <span className="text-text-secondary">Recent Biomarkers:</span>
                          <span className="ml-2 font-semibold text-text-primary">
                            {healthContext.recentBiomarkers.length} recorded
                          </span>
                        </div>
                      )}
                    </div>
                    </div>
                  </motion.div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
                  {messages.length === 0 && address && !loading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-2xl p-4 bg-gray-100 text-text-primary text-sm leading-relaxed">
                        Ask your first question or choose a quick action on the left to get started.
                      </div>
                    </div>
                  )}

                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="max-w-[80%]">
                          {msg.role === 'assistant' && (
                            <div className="flex items-center gap-2 mb-1">
                              <Bot className="w-4 h-4 text-text-tertiary" />
                              <span className="text-xs text-text-tertiary">AI Coach</span>
                            </div>
                          )}
                          <div
                            className={`rounded-2xl p-4 ${
                              msg.role === 'user'
                                ? 'bg-gradient-primary text-white'
                                : 'bg-gray-100 text-text-primary'
                            }`}
                          >
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                              {msg.content}
                            </div>
                          </div>
                          {msg.role === 'assistant' && index === messages.length - 1 && messages.length > 2 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {['Tell me more', 'What else can I do?', 'Explain this further'].map((suggestion) => (
                                <button
                                  key={suggestion}
                                  onClick={() => sendMessage(suggestion)}
                                  className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-full hover:border-accent-primary hover:text-accent-primary transition"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-2xl p-4">
                        <div className="flex gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex gap-3"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything about your health..."
                    className="input-premium flex-1"
                    disabled={loading || !address}
                  />
                  <AnimatedButton type="submit" variant="primary" disabled={loading || !input.trim()}>
                    <Send className="w-4 h-4" />
                  </AnimatedButton>
                </form>
              </AnimatedCard>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
