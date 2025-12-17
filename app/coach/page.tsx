'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from '@/hooks/useAccount';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import AnimatedButton from '@/components/ui/AnimatedButton';
import PageTransition from '@/components/ui/PageTransition';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Send, Sparkles, Lightbulb, Activity, Utensils, Heart, Brain, Moon, Beaker, Bot, Trash2, Download, History, Info, TrendingUp, CheckCircle, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

const QUICK_ACTIONS = [
  { icon: Utensils, label: 'Analyze Last Meal', action: 'quick_action', quickAction: 'analyze_last_meal' },
  { icon: Calendar, label: '7-Day Meal Plan', action: 'quick_action', quickAction: 'design_7_day_meal_plan' },
  { icon: Activity, label: 'Workout Today', action: 'quick_action', quickAction: 'generate_workout_today' },
  { icon: Moon, label: 'Improve Sleep', action: 'quick_action', quickAction: 'improve_sleep_tonight' },
  { icon: Brain, label: 'Reduce Stress Now', action: 'quick_action', quickAction: 'reduce_stress_now' },
  { icon: Beaker, label: 'Interpret Labs', action: 'quick_action', quickAction: 'interpret_latest_labs' },
  { icon: Heart, label: 'Heart Health', prompt: 'How can I improve my cardiovascular health?' },
  { icon: Lightbulb, label: 'Longevity', prompt: 'What are evidence-based longevity strategies?' },
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
            "Hello! I'm your AI Health Intelligence. I can help you with:\n\n• Interpreting lab results\n• Meal planning and nutrition\n• Exercise recommendations\n• Stress management\n• Longevity strategies\n• Answering health questions\n\nWhat would you like to know?",
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
            "Hello! I'm your AI Health Intelligence. How can I help you today?",
        },
      ]);
      setActiveSession(null);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHealthContext = async () => {
    // Mock health context
    setHealthContext({
      healthScore: 85,
      recentBiomarkers: [{ name: 'Glucose', value: 90 }, { name: 'Vitamin D', value: 45 }],
      activeChallenges: ['7-Day Hydration'],
    });
  };

  const sendMessage = async (messageText?: string) => {
    const message = messageText || input.trim();
    if (!message) {
      showToast({ variant: 'error', title: 'Empty Message', description: 'Please enter a message before sending.' });
      return;
    }
    if (!address) {
      showToast({ variant: 'error', title: 'Wallet Not Connected', description: 'Please connect your wallet to use the AI coach.' });
      return;
    }

    const userMessage = { role: 'user', content: message };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Mock API call
    setTimeout(() => {
      const assistantMessage = { role: 'assistant', content: `Echo: "${message}". I'm still under development, but I received your message!` };
      setMessages((prev) => [...prev, assistantMessage]);
      setLoading(false);
      setTimeout(() => saveConversation(), 500);
    }, 1500);
  };

  const handleQuickAction = async (action: any) => {
    if (!address) {
      showToast({ variant: 'error', title: 'Wallet Not Connected', description: 'Please connect your wallet to use quick actions.' });
      return;
    }

    if (action.quickAction) {
      setMessages((prev) => [...prev, { role: 'user', content: `Quick Action: ${action.label}` }]);
      setLoading(true);
      // Mock API call
      setTimeout(() => {
        const assistantMessage = { role: 'assistant', content: `Initiating ${action.label}. This feature is coming soon!` };
        setMessages((prev) => [...prev, assistantMessage]);
        setLoading(false);
        setTimeout(() => saveConversation(), 500);
      }, 1500);
    } else if (action.prompt) {
      await sendMessage(action.prompt);
    }
  };

  return (
    <PageTransition>
      <div className="page-container">
        {/* Header */}
        <motion.div initial="initial" animate="animate" variants={fadeInUp} className="page-header">
          <div className="flex items-center gap-4">
            <div className="icon-box-lg bg-accent-primary">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="page-title">AI Health Intelligence</h1>
              <p className="page-subtitle">
                Evidence-based longevity insights tailored to your biomarkers
              </p>
            </div>
          </div>
        </motion.div>

        {!address && (
          <motion.div 
            className="glass-card text-center py-10 mb-8"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            <p className="text-base text-text-secondary mb-4">
              Connect your wallet to unlock your personalized AI health coaching experience.
            </p>
            <p className="text-sm text-text-tertiary">
              The coach tailors answers using your assessments, biomarker trends, and habits.
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <motion.div className="lg:col-span-1 glass-card p-6" variants={fadeInUp} initial="hidden" animate="visible">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border-medium">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-accent-primary" />
                Quick Actions
              </h2>
              {conversationHistory.length > 0 && (
                <button
                  onClick={() => {}} // This needs to open a modal or similar
                  className="p-1.5 rounded-full hover:bg-bg-elevated transition"
                  title="Conversation history"
                >
                  <History className="w-5 h-5 text-text-tertiary" />
                </button>
              )}
            </div>
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
              {QUICK_ACTIONS.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div key={index} variants={fadeInUp}>
                    <AnimatedButton
                      onClick={() => handleQuickAction(action)}
                      disabled={loading}
                      variant="secondary"
                      className="w-full justify-start py-4"
                      icon={<Icon className="w-5 h-5" />}
                    >
                      <span className="font-semibold text-text-primary">{action.label}</span>
                    </AnimatedButton>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Chat Interface */}
          <motion.div className="lg:col-span-2 glass-card p-6 flex flex-col h-[calc(100vh-200px)]" variants={fadeInUp} initial="hidden" animate="visible">
            {/* Chat Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border-medium">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-text-primary">Conversation</h3>
                {healthContext && (
                  <button
                    onClick={() => setShowContext(!showContext)}
                    className="p-1.5 rounded-full hover:bg-bg-elevated transition"
                    title="View health context"
                  >
                    <Info className="w-5 h-5 text-text-tertiary" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 1 && (
                  <>
                    <AnimatedButton onClick={exportConversation} variant="ghost" size="sm" icon={<Download className="w-4 h-4" />} />
                    <AnimatedButton onClick={clearConversation} variant="ghost" size="sm" icon={<Trash2 className="w-4 h-4" />} />
                  </>
                )}
              </div>
            </div>

            {/* Health Context Panel */}
            <AnimatePresence>
              {showContext && healthContext && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-4 p-4 glass-card border border-border-light">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-5 h-5 text-accent-primary" />
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
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
              {messages.length === 0 && address && !loading && (
                <div className="flex justify-start">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-[80%] glass-card p-4 text-sm leading-relaxed">
                    Ask your first question or choose a quick action on the left to get started.
                  </motion.div>
                </div>
              )}

              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="max-w-[80%]">
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-1">
                          <Bot className="w-4 h-4 text-text-tertiary" />
                          <span className="text-xs text-text-tertiary">AI Coach</span>
                        </div>
                      )}
                      <div className={`glass-card p-4 ${msg.role === 'user' ? 'bg-accent-primary text-white' : 'bg-bg-elevated'}`}>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {msg.content}
                        </div>
                      </div>
                      {msg.role === 'assistant' && index === messages.length - 1 && messages.length > 2 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {['Tell me more', 'What else can I do?', 'Explain this further'].map((suggestion) => (
                            <AnimatedButton
                              key={suggestion}
                              onClick={() => sendMessage(suggestion)}
                              variant="secondary"
                              size="sm"
                            >
                              {suggestion}
                            </AnimatedButton>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="glass-card p-4">
                    <LoadingSpinner size="sm" />
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
                className="form-input flex-1"
                disabled={loading || !address}
              />
              <AnimatedButton type="submit" variant="primary" disabled={loading || !input.trim()}>
                <Send className="w-5 h-5" />
              </AnimatedButton>
            </form>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
