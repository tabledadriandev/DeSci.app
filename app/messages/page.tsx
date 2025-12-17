'use client';

import { useEffect, useState, useRef } from 'react';
import { useAccount } from '@/hooks/useAccount';
import { motion } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import AnimatedButton from '@/components/ui/AnimatedButton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { fadeInUp } from '@/lib/animations/variants';
import { MessageCircle, Send, Wallet } from 'lucide-react';

type ThreadMessage = {
  id: string;
  fromViewer: boolean;
  content: string;
  createdAt: string;
};

export default function MessagesPage() {
  const { address } = useAccount();
  const [otherAddress, setOtherAddress] = useState('');
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!address || !otherAddress) return;
    setLoading(true);
    // Mock loading messages
    setTimeout(() => {
      setMessages([
        { id: '1', fromViewer: false, content: 'Hey, I saw your post on the longevity forum. Great insights!', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: '2', fromViewer: true, content: 'Thanks! Glad you found it useful. What are your current biohacking protocols?', createdAt: new Date(Date.now() - 3000000).toISOString() },
        { id: '3', fromViewer: false, content: 'Mainly focusing on metabolic health and sleep optimization. Thinking of trying NMN.', createdAt: new Date(Date.now() - 1800000).toISOString() },
      ]);
      setLoading(false);
    }, 1000);
  }, [address, otherAddress]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !otherAddress || !input.trim()) return;
    setSending(true);

    const newMessage: ThreadMessage = {
      id: String(messages.length + 1),
      fromViewer: true,
      content: input,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');

    // Mock API call
    setTimeout(() => {
      const botReply: ThreadMessage = {
        id: String(messages.length + 2),
        fromViewer: false,
        content: `Acknowledged: "${newMessage.content}". I'm a mock recipient, but a real person would reply soon!`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botReply]);
      setSending(false);
    }, 1500);
  };

  if (!address) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="glass-card max-w-md w-full text-center p-6">
            <Wallet className="w-16 h-16 text-accent-primary mx-auto mb-4" />
            <h1 className="text-xl font-bold text-text-primary mb-2">
              Connect your wallet to message
            </h1>
            <p className="text-sm text-text-secondary">
              Direct messaging is available to logged-in wallet users. Connect your wallet from the main navigation to begin.
            </p>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-crypto-gradient text-transparent bg-clip-text mb-2">
            Direct Messages
          </h1>
          <p className="text-base text-text-secondary">
            Encrypted 1-on-1 messaging between wallet addresses.
          </p>
        </motion.div>

        <motion.div className="glass-card p-6" variants={fadeInUp}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Recipient wallet address
              </label>
              <input
                type="text"
                value={otherAddress}
                onChange={(e) => setOtherAddress(e.target.value)}
                placeholder="0x…"
                className="w-full px-4 py-3 bg-bg-surface border border-border-medium rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
              />
            </div>

            <div className="glass-card p-4 h-96 overflow-y-auto flex flex-col justify-end">
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <LoadingSpinner text="Loading messages..." />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-text-secondary text-center">
                  No messages in this conversation yet. Send a message to start!
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.fromViewer ? 'justify-end' : 'justify-start'}`}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`max-w-[80%] px-4 py-3 rounded-xl ${
                          m.fromViewer
                            ? 'bg-accent-primary text-white'
                            : 'glass-card text-text-primary'
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                        <p className="mt-1 text-xs opacity-80">
                          {new Date(m.createdAt).toLocaleTimeString()}
                        </p>
                      </motion.div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a private message…"
                className="flex-1 px-4 py-3 bg-bg-surface border border-border-medium rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
              />
              <AnimatedButton type="submit" disabled={sending || !input.trim()} icon={<Send className="w-5 h-5" />}>
                Send
              </AnimatedButton>
            </form>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}


