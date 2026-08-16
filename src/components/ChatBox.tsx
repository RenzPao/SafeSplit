import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Send, MessageSquare } from 'lucide-react';

interface ChatMessage {
  id: string;
  escrow_id: string;
  sender_address: string;
  content: string;
  created_at: string;
}

interface ChatBoxProps {
  escrowId: string;
  currentWalletAddress: string;
  clientAddress: string;
  freelancerAddress: string;
  arbiterAddress?: string;
}

export default function ChatBox({
  escrowId,
  currentWalletAddress,
  clientAddress,
  freelancerAddress,
  arbiterAddress
}: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial messages and subscribe
  useEffect(() => {
    let isMounted = true;

    const fetchMessages = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('Message')
        .select('*')
        .eq('escrow_id', escrowId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else if (isMounted && data) {
        setMessages(data as ChatMessage[]);
      }
      if (isMounted) setIsLoading(false);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-${escrowId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'Message', filter: `escrow_id=eq.${escrowId}` },
        (payload) => {
          if (isMounted) {
            setMessages((prev) => {
              // prevent duplicates if realtime arrives after optimistic UI update
              if (prev.some(m => m.id === payload.new.id)) return prev;
              return [...prev, payload.new as ChatMessage];
            });
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [escrowId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentWalletAddress) return;

    const content = newMessage.trim();
    setNewMessage('');

    // Generate a temporary ID for optimistic UI
    const tempId = crypto.randomUUID();
    const tempMsg: ChatMessage = {
      id: tempId,
      escrow_id: escrowId,
      sender_address: currentWalletAddress,
      content,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, tempMsg]);

    const { error } = await supabase
      .from('Message')
      .insert({
        id: tempId,
        escrow_id: escrowId,
        sender_address: currentWalletAddress,
        content
      });

    if (error) {
      console.error('Failed to send message:', error);
      // Revert optimistic update
      setMessages((prev) => prev.filter(m => m.id !== tempId));
      alert('Failed to send message.');
    }
  };

  const getRoleBadge = (address: string) => {
    if (address === clientAddress) return <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded ml-2">Client</span>;
    if (address === freelancerAddress) return <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded ml-2">Freelancer</span>;
    if (arbiterAddress && address === arbiterAddress) return <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded ml-2">Arbiter</span>;
    return null;
  };

  const truncateAddress = (addr: string) => `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`;

  return (
    <div className="flex flex-col h-[500px] bg-zinc-900/40 border border-zinc-800/80 rounded-2xl overflow-hidden mt-6 shadow-xl">
      <div className="flex items-center gap-2 p-4 border-b border-zinc-800 bg-zinc-950/50">
        <MessageSquare className="w-4 h-4 text-zinc-400" />
        <h3 className="text-sm font-semibold text-zinc-200">Escrow Chat</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2">
            <MessageSquare className="w-8 h-8 opacity-20" />
            <p className="text-xs">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_address === currentWalletAddress;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-1 mb-1">
                  {!isMe && <span className="text-[10px] font-mono text-zinc-500">{truncateAddress(msg.sender_address)}</span>}
                  {getRoleBadge(msg.sender_address)}
                </div>
                <div 
                  className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                    isMe 
                      ? 'bg-white text-black rounded-tr-sm' 
                      : 'bg-zinc-800 text-zinc-200 rounded-tl-sm'
                  }`}
                  style={{ wordBreak: 'break-word' }}
                >
                  {msg.content}
                </div>
                <span className="text-[9px] text-zinc-600 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-3 border-t border-zinc-800 bg-zinc-950/50 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-zinc-700"
          disabled={!currentWalletAddress}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || !currentWalletAddress}
          className="bg-white text-black p-2 rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
