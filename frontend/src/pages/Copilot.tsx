import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PageWrapper from '../components/layout/PageWrapper';
import { post } from '../services/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  details?: {
    threat_level: string;
    reasons: string[];
    actions: string[];
  };
}

const QUICK_PROMPTS = [
  { text: "Is this email attachment safe?", icon: "✉️" },
  { text: "Check my password strength", icon: "🔑" },
  { text: "Should I trust this unrecognized login?", icon: "🌐" },
  { text: "How can I secure my laptop?", icon: "💻" },
];

export default function Copilot({ role }: { role: 'user' | 'admin' }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello ${user?.name || 'there'}! I am your SENTINEL AI Security Assistant. Ask me about suspicious links, emails, password leaks, or file downloads, and I will analyze their threat risk.`,
      timestamp: new Date(),
      details: {
        threat_level: 'none',
        reasons: ["Initial welcoming security sync"],
        actions: [
          "Connect sources in the Connection Center.",
          "Check active dashboard metrics.",
          "Ask a question to begin a threat scan."
        ]
      }
    }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string>('welcome');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeMessage = messages.find(m => m.id === selectedMessageId) || messages[messages.length - 1];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || sending) return;
    setSending(true);
    setInput('');

    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `assistant-${Date.now()}`;

    // 1. Add user message
    const userMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setSelectedMessageId(userMsgId);

    try {
      // 2. Fetch AI response
      const res = await post<any>('/copilot/chat', { message: text });
      
      const assistantMsg: Message = {
        id: assistantMsgId,
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date(),
        details: {
          threat_level: res.threat_level,
          reasons: res.reasons,
          actions: res.actions,
        }
      };

      setMessages(prev => [...prev, assistantMsg]);
      setSelectedMessageId(assistantMsgId);
    } catch (e) {
      console.error("AI Assistant query failed:", e);
      const errorMsg: Message = {
        id: assistantMsgId,
        sender: 'assistant',
        text: "I encountered an error querying the risk classification database. Please ensure the backend server is running and try again.",
        timestamp: new Date(),
        details: {
          threat_level: 'none',
          reasons: ["API connection timeout / crash"],
          actions: ["Check uvicorn backend server port 8000."]
        }
      };
      setMessages(prev => [...prev, errorMsg]);
      setSelectedMessageId(assistantMsgId);
    } finally {
      setSending(false);
    }
  };

  const getThreatPill = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/25">CRITICAL RISK</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/25">HIGH RISK</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/25">MEDIUM RISK</span>;
      case 'low':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/25">LOW RISK</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">NO THREAT</span>;
    }
  };

  return (
    <PageWrapper role={role} title="AI Security Copilot" subtitle="Intelligent cyber assistant companion">
      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-10rem)] animate-fade-in pr-2">
        
        {/* Chat Conversation Column */}
        <div className="lg:col-span-2 flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md overflow-hidden">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">🤖</span>
              <div>
                <h2 className="font-bold text-white text-sm">AI Security Copilot</h2>
                <p className="text-[10px] text-slate-400">Threat assessment companion · Online</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Conversation flow */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages.map(m => {
              const isUser = m.sender === 'user';
              const isSelected = m.id === selectedMessageId;
              return (
                <div 
                  key={m.id} 
                  onClick={() => m.details && setSelectedMessageId(m.id)}
                  className={`flex gap-3 max-w-[85%] cursor-pointer ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  {!isUser && <span className="text-lg shrink-0 pt-1">🤖</span>}
                  <div 
                    className={`p-3 rounded-2xl border transition-all text-xs md:text-sm ${
                      isUser 
                        ? 'bg-blue-600 border-blue-500 text-white rounded-tr-none' 
                        : `rounded-tl-none ${
                            isSelected 
                              ? 'bg-slate-800 border-slate-700 text-slate-100 shadow-md shadow-blue-500/5' 
                              : 'bg-slate-900/40 border-slate-850 hover:bg-slate-900/60 text-slate-300'
                          }`
                    }`}
                  >
                    <p className="leading-relaxed">{m.text}</p>
                    <div className="mt-1 flex items-center justify-between gap-4 text-[9px] text-slate-400">
                      <span>
                        {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!isUser && m.details && (
                        <span className="text-[9px] text-blue-400 hover:underline">
                          {isSelected ? 'Viewing details' : 'Click to inspect risk'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="p-3 border-t border-slate-800/40 bg-slate-950/20 grid grid-cols-2 gap-2">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp.text)}
                className="p-2 text-left rounded-xl border border-slate-850 hover:border-slate-800 bg-slate-900/35 hover:bg-slate-900/60 transition-colors text-[10px] text-slate-400 flex items-center gap-2 truncate"
              >
                <span>{qp.icon}</span>
                <span className="truncate">{qp.text}</span>
              </button>
            ))}
          </div>

          {/* Input box */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="p-3 border-t border-slate-800/80 bg-slate-900/60 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a security concern or paste email headers..."
              className="flex-1 px-4 py-2 text-xs md:text-sm bg-slate-950 border border-slate-850 focus:border-blue-500 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
              disabled={sending}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 transition-colors text-white shadow-md shadow-blue-500/10"
              disabled={sending}
            >
              {sending ? 'Analyzing...' : 'Send'}
            </button>
          </form>
        </div>

        {/* Dynamic Security Details Inspector Column */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 md:p-6 space-y-6 backdrop-blur-md overflow-y-auto">
          <div className="space-y-1 border-b border-slate-800/60 pb-4">
            <h3 className="font-bold text-white text-base">AI Threat Inspector</h3>
            <p className="text-slate-400 text-[10px]">Real-time XAI explainability metrics</p>
          </div>

          {activeMessage && activeMessage.details ? (
            <div className="space-y-6">
              
              {/* Risk Category Header */}
              <div className="space-y-2">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assessment Status</h5>
                <div className="flex items-center gap-3">
                  {getThreatPill(activeMessage.details.threat_level)}
                </div>
              </div>

              {/* Analysis details */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Identified Risk Factors</h5>
                <ul className="space-y-2">
                  {activeMessage.details.reasons.map((r, i) => (
                    <li key={i} className="flex gap-2 text-xs text-slate-300 leading-relaxed">
                      <span className="text-rose-500/80">⚠️</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions list */}
              <div className="space-y-3 pt-2 border-t border-slate-800/60">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recommended Security Actions</h5>
                <ol className="space-y-3">
                  {activeMessage.details.actions.map((act, i) => (
                    <li key={i} className="flex gap-3 text-xs text-slate-300 leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {i + 1}
                      </span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ol>
              </div>

            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-4">
              <p className="text-xs text-slate-500 italic">
                Select an AI reply in the conversation history to inspect its threat details here.
              </p>
            </div>
          )}
        </div>

      </div>
    </PageWrapper>
  );
}
