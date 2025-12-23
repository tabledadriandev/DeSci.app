'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

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

  useEffect(() => {
    if (!address || !otherAddress) return;
    void loadThread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, otherAddress]);

  const loadThread = async () => {
    if (!address || !otherAddress) return;
    setLoading(true);
    try {
      const res = await fetch('/api/messages/thread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          viewerAddress: address,
          otherPartyAddress: otherAddress,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Error loading messages', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !otherAddress || !input.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderAddress: address,
          recipientAddress: otherAddress,
          content: input,
        }),
      });
      if (res.ok) {
        setInput('');
        await loadThread();
      }
    } catch (err) {
      console.error('Error sending message', err);
    } finally {
      setSending(false);
    }
  };

  if (!address) {
    return (
      <div className="min-h-screen  p-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-md p-6 text-center">
          <h1 className="text-xl font-display mb-2 text-text-primary">
            Connect your wallet to message
          </h1>
          <p className="text-sm text-text-secondary">
            Direct messaging is available to logged-in wallet users. Connect your wallet
            from the main navigation to begin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-display text-accent-primary">
            Direct Messages
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Encrypted 1-on-1 messaging between wallet addresses. Share protocols, links,
            and wellness insights privately.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-text-primary">
              Recipient wallet address
            </label>
            <input
              type="text"
              value={otherAddress}
              onChange={(e) => setOtherAddress(e.target.value)}
              placeholder="0x…"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          <div className="border border-border-light rounded-lg h-64 overflow-y-auto bg-gray-50 px-3 py-2 text-xs sm:text-sm">
            {loading ? (
              <div className="text-center text-text-secondary mt-4">Loading…</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-text-secondary mt-4">
                No messages in this conversation yet.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[80%] px-3 py-2 rounded-lg ${
                      m.fromViewer
                        ? 'self-end bg-accent-primary text-white'
                        : 'self-start bg-white text-text-primary border border-border-light'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>
                    <div className="mt-1 text-[10px] opacity-80">
                      {new Date(m.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a private message…"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="bg-accent-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-accent-primary/90 transition-colors disabled:opacity-60"
            >
              {sending ? 'Sending…' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


