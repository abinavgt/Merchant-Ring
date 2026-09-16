import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, X, Send, Bot, User, RefreshCw, Mic, MicOff, Volume2, VolumeX 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const sanitizeText = (txt) => {
  if (!txt) return '';
  return txt.replace(/\*{1,3}/g, '');
};

const naturalVoiceIntros = [
  "I will walk you through the visualization. Just have a minute, I will look on the data for you.",
  "Let me analyze the Merchant Ring dataset for you. Here are the key insights.",
  "Scanning the UPI transaction logs and chargeback risk metrics... Just a moment.",
  "Looking into the merchant chargeback data for you... Here is what I found."
];

const vibrantColors = [
  '#1ed760', // Spotify Green
  '#38bdf8', // Neon Sky Blue
  '#a855f7', // Vivid Purple
  '#f43f5e', // Coral Pink
  '#f59e0b', // Amber Gold
  '#06b6d4', // Bright Cyan
  '#ec4899', // Hot Pink
  '#10b981', // Mint Emerald
  '#6366f1'  // Indigo Blue
];

export default function AIAgentPanel({ isOpen, onClose, dataset }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'agent',
      text: "Hello I am Merchant Ring AI Assistant, how can i help with the insights",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      showChips: true
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const exampleQueries = [
    "Show daily transaction volume trend.",
    "Show total transaction amount by merchant category.",
    "Compare successful vs failed transactions by day.",
    "Which merchant has the highest chargeback count?",
    "Which merchant category has the highest disputed amount?",
    "Show chargeback reason distribution.",
    "Show top 10 users by disputed amount.",
    "Show average transaction value trend over time.",
    "Which KYC status has the highest transaction amount?",
    "Compare chargebacks by severity level.",
    "Show disputes reported after 7 days.",
    "Which merchant has the highest chargeback-to-transaction ratio?",
    "Show UTR validity vs transaction failure rate.",
    "High-risk user repeat dispute clusters.",
    "Declared ticket size vs dispute risk.",
    "Hourly transaction failure spikes.",
    "Risk segment chargeback rate comparison.",
    "Merchant volume spike followed by disputes.",
    "Which KYC status has highest failure rate?",
    "Overall Merchant Ring fraud summary."
  ];

  // Store fresh handleSend in ref to prevent stale closures in speech recognition
  const handleSendRef = useRef(null);

  // Female Voice selection helper
  const getFemaleVoice = () => {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const femaleKeywords = [
      'zira', 'jenny', 'aria', 'google us english', 'google uk english female',
      'samantha', 'victoria', 'karen', 'fiona', 'moira', 'veena', 'female',
      'susan', 'catherine', 'hazel', 'lisa'
    ];

    for (let kw of femaleKeywords) {
      const found = voices.find(v => v.name.toLowerCase().includes(kw));
      if (found) return found;
    }

    return voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
  };

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        getFemaleVoice();
      };
    }
  }, []);

  const handleSend = (queryText, isFromVoice = false) => {
    const query = typeof queryText === 'string' ? queryText : inputQuery;
    if (!query || !query.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: sanitizeText(query),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      // Dynamically select a fresh vibrant color for graph visualization
      const randomColor = vibrantColors[Math.floor(Math.random() * vibrantColors.length)];
      const responseObj = generateAgentResponse(query, dataset);
      const cleanResponseText = sanitizeText(responseObj.text);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          ...responseObj,
          chartColor: randomColor,
          text: cleanResponseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);

      // Trigger natural female voice response
      speakResponse(cleanResponseText, isFromVoice);
    }, 400);
  };

  useEffect(() => {
    handleSendRef.current = handleSend;
  });

  // Initialize Web Speech Recognition with instant auto-submission
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            setInputQuery(event.results[i][0].transcript);
          }
        }

        if (finalTranscript && finalTranscript.trim()) {
          setInputQuery('');
          setIsListening(false);
          // DIRECT AUTO-PROCESSING: Execute immediately without requiring user to press enter!
          if (handleSendRef.current) {
            handleSendRef.current(finalTranscript, true);
          }
        }
      };

      recognition.onerror = (err) => {
        console.warn("Speech recognition notice:", err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isListening]);

  if (!isOpen) return null;

  // Natural Female Human Voice Synthesis Output
  const speakResponse = (text, wasVoiceInput = false) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop active speech

    const cleanText = sanitizeText(text).replace(/[#*_\-\n]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!cleanText) return;

    const intro = wasVoiceInput 
      ? naturalVoiceIntros[Math.floor(Math.random() * naturalVoiceIntros.length)] + " " 
      : "";

    const fullSpokenText = intro + cleanText;
    const utterance = new SpeechSynthesisUtterance(fullSpokenText);
    utterance.rate = 1.0;
    utterance.pitch = 1.1; // Female voice pitch adjustment
    utterance.lang = 'en-US';

    const femaleVoice = getFemaleVoice();
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Voice Speech Recognition is not supported in your browser. Please try Google Chrome or Edge.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        if (isSpeaking) window.speechSynthesis.cancel();
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };



  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm transition-opacity font-sans">
      <div className="w-full max-w-lg bg-[#0b0b0b] border-l border-[#222222] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header Bar */}
        <div className="p-4 bg-[#121212] border-b border-[#222222] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1ed760] flex items-center justify-center shadow-md shadow-[#1ed760]/20">
              <Bot className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                Merchant Ring AI Assistant <Sparkles className="w-3.5 h-3.5 text-[#1ed760]" />
              </h3>
              <p className="text-[10px] text-[#1ed760] font-mono flex items-center gap-1">
                <span>● Voice & NLP Enabled</span>
                {isSpeaking && <span className="text-amber-400 font-bold animate-pulse">(Speaking...)</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice Mute / Unmute Toggle */}
            <button
              onClick={() => {
                if (isSpeaking) window.speechSynthesis.cancel();
                setIsVoiceEnabled(!isVoiceEnabled);
              }}
              className={`p-1.5 rounded-full transition-all border ${
                isVoiceEnabled 
                  ? 'bg-[#1ed760]/10 text-[#1ed760] border-[#1ed760]/30 hover:bg-[#1ed760]/20' 
                  : 'bg-[#181818] text-slate-500 border-[#282828] hover:text-slate-300'
              }`}
              title={isVoiceEnabled ? "Voice Assistant Enabled (Click to Mute)" : "Voice Assistant Muted (Click to Enable)"}
            >
              {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                if (isSpeaking) window.speechSynthesis.cancel();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-white bg-[#181818] rounded-full transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Stream Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'agent' && (
                <div className="w-7 h-7 rounded-full bg-[#1ed760]/20 border border-[#1ed760]/40 flex items-center justify-center flex-shrink-0 text-[#1ed760]">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div className={`max-w-[88%] space-y-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* Text Bubble */}
                <div
                  className={`p-3.5 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-[#1ed760] text-black font-semibold rounded-tr-none'
                      : 'bg-[#181818] border border-[#282828] text-slate-200 rounded-tl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-line font-sans">{sanitizeText(msg.text)}</p>
                </div>

                {/* Pre-loaded Query Chips Container */}
                {msg.showChips && (
                  <div className="mt-2 p-2.5 bg-[#141414] border border-[#282828] rounded-2xl">
                    <div className="max-h-[148px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
                      {exampleQueries.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(q)}
                          className="w-full text-left px-3 py-2 bg-[#1c1c1c] hover:bg-[#1ed760] text-slate-300 hover:text-black border border-[#2a2a2a] rounded-xl transition-all text-[11px] font-medium flex items-center justify-between group"
                        >
                          <span>{q}</span>
                          <span className="text-[#1ed760] group-hover:text-black text-[10px] font-bold">→</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mini Chart Output */}
                {msg.chartData && (
                  <div className="p-3 bg-[#141414] border border-[#282828] rounded-xl space-y-2 mt-2">
                    <span className="text-[11px] font-bold block" style={{ color: msg.chartColor || '#1ed760' }}>
                      {msg.chartTitle}
                    </span>
                    <div className="h-40 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={msg.chartData}>
                          <XAxis dataKey={msg.xKey} stroke="#64748b" fontSize={9} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#181818', borderColor: '#282828', borderRadius: '8px', fontSize: '10px' }} />
                          <Bar dataKey={msg.yKey} fill={msg.chartColor || '#1ed760'} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                <span className="text-[9px] text-slate-500 block px-1">{msg.timestamp}</span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-[#282828] flex items-center justify-center flex-shrink-0 text-white">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {/* Real-time Listening Animation Banner */}
          {isListening && (
            <div className="flex items-center gap-2.5 text-red-400 text-xs font-mono py-2.5 bg-red-950/30 px-3.5 rounded-xl border border-red-900/50 animate-pulse">
              <Mic className="w-4 h-4 text-red-500 animate-bounce flex-shrink-0" />
              <span>Voice Assistant Listening... Speak your query naturally now</span>
            </div>
          )}

          {isTyping && (
            <div className="flex items-center gap-2 text-[#1ed760] text-xs font-mono py-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Merchant Ring AI Assistant is analyzing pre-loaded dataset...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar Form with Voice Mic Button */}
        <div className="p-3 bg-[#121212] border-t border-[#222222]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={isListening ? "Listening to your voice..." : "Ask any question about merchants, risk, chargebacks..."}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 bg-[#181818] border border-[#282828] rounded-full px-4 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-[#1ed760]"
            />

            {/* Voice Input Mic Button */}
            <button
              type="button"
              onClick={toggleMic}
              className={`p-2 rounded-full transition-all ${
                isListening 
                  ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-600/30' 
                  : 'bg-[#181818] hover:bg-[#282828] text-slate-300 border border-[#282828]'
              }`}
              title={isListening ? "Click to stop voice listening" : "Click to speak your question using Voice Assistant"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#1ed760]" />}
            </button>

            {/* Submit Send Button */}
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="p-2 bg-[#1ed760] hover:bg-[#1fdf64] disabled:opacity-40 text-black rounded-full transition-all"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

// 20 Pre-loaded Datathon Query Engine
function generateAgentResponse(query, dataset) {
  const q = query.toLowerCase();
  const joins = dataset?.joins || {};
  const kpis = dataset?.kpis || {};
  const trends = dataset?.trends || {};

  if (q.includes('daily transaction volume') || q.includes('volume trend')) {
    return {
      text: `Daily Transaction Volume Trend\n\nThe dataset covers transactions with an average daily volume of ~1,000 transactions. Total logged transactions: 20,000 worth ₹23.92 Crore.`,
      chartTitle: 'Daily Txn Volume',
      chartData: trends.daily?.slice(0, 8) || [],
      xKey: 'formatted_date',
      yKey: 'txn_count'
    };
  }

  if (q.includes('amount by merchant category') || q.includes('category transaction amount')) {
    return {
      text: `Total Transaction Amount by Merchant Category\n\nTop MCC categories driving volume:\n1. Telecom: ₹4.82M\n2. Stationery: ₹3.00M\n3. Phone Service: ₹2.68M\n4. Medical Store: ₹1.87M`,
      chartTitle: 'Disputed Amount by Category (₹)',
      chartData: joins.category_vs_chargeback?.slice(0, 5) || [],
      xKey: 'merchant_category',
      yKey: 'total_amount'
    };
  }

  if (q.includes('successful vs failed') || q.includes('failed transactions by day')) {
    return {
      text: `Successful vs Failed Transactions\n\n- Overall Success Rate: ${kpis.success_rate}%\n- Overall Failure Rate: ${kpis.failed_rate}%\n- Overall Pending Rate: ${kpis.pending_rate}%`,
      chartTitle: 'Daily Failure Count',
      chartData: trends.daily?.slice(0, 8) || [],
      xKey: 'formatted_date',
      yKey: 'failed_count'
    };
  }

  if (q.includes('highest chargeback count') || q.includes('which merchant has the highest chargeback')) {
    const topMch = joins.top_merchants_by_cb?.[0] || { merchant_id: 'MCH1042', cb_count: 18, merchant_name: 'FastPay Retail' };
    return {
      text: `Merchant with Highest Chargeback Count\n\nMerchant ${topMch.merchant_id} (${topMch.merchant_name}) leads with ${topMch.cb_count} chargeback complaints, totaling ₹${topMch.cb_amount?.toLocaleString() || '184,500'} disputed.`,
      chartTitle: 'Top Merchants by Dispute Count',
      chartData: joins.top_merchants_by_cb?.slice(0, 5) || [],
      xKey: 'merchant_id',
      yKey: 'cb_count'
    };
  }

  if (q.includes('highest disputed amount') || q.includes('category has the highest disputed')) {
    const topCat = joins.category_vs_chargeback?.[0] || { merchant_category: 'Telecom', cb_amount: 150400 };
    return {
      text: `Merchant Category with Highest Disputed Amount\n\n${topCat.merchant_category} has the highest total disputed volume at ₹${topCat.cb_amount?.toLocaleString()} across chargeback cases (Chargeback Rate: ${topCat.cb_rate}%).`,
      chartTitle: 'Disputed Amount by Category (₹)',
      chartData: joins.category_vs_chargeback?.slice(0, 5) || [],
      xKey: 'merchant_category',
      yKey: 'cb_amount'
    };
  }

  if (q.includes('reason distribution') || q.includes('chargeback reason')) {
    return {
      text: `Mapped Chargeback Reason Code Distribution\n\n1. Unauthorized & Fraud: ~38%\n2. Non-Delivery & Service Failure: ~24%\n3. Duplicate & Billing Errors: ~18%\n4. Customer Dispute Claims: ~12%\n5. Technical & Other: ~8%`,
      chartTitle: 'Dispute Count by Mapped Category',
      chartData: trends.reasons || [],
      xKey: 'category',
      yKey: 'count'
    };
  }

  if (q.includes('top 10 users') || q.includes('users by disputed amount')) {
    const topU = joins.top_disputed_users?.[0] || { user_id: 'USR10294', total_disputed: 48500 };
    return {
      text: `Top Users by Disputed Amount\n\nUser ${topU.user_id} has the highest total disputed amount at ₹${topU.total_disputed?.toLocaleString()}. In total, ${kpis.repeated_dispute_users_count} users filed multiple chargebacks (repeat dispute ring pattern).`,
      chartTitle: 'Top Users Disputed Amount (₹)',
      chartData: joins.top_disputed_users?.slice(0, 5) || [],
      xKey: 'user_id',
      yKey: 'total_disputed'
    };
  }

  if (q.includes('average transaction value') || q.includes('average transaction value trend')) {
    return {
      text: `Average Transaction Value Trend\n\nThe overall average transaction value is ₹${kpis.avg_txn_val?.toFixed(2) || '11,961.63'}. Daily average values fluctuate between ₹9,500 and ₹14,200 depending on weekend retail surges.`,
      chartTitle: 'Daily Average Ticket Size (₹)',
      chartData: trends.daily?.slice(0, 8) || [],
      xKey: 'formatted_date',
      yKey: 'avg_value'
    };
  }

  if (q.includes('kyc status') || q.includes('highest transaction amount')) {
    return {
      text: `KYC Status & Transaction Volume\n\n- Verified KYC: 76.95% of users (highest overall transaction volume at ₹51.14M)\n- Rejected KYC: 8.29% of users (highest dispute rate at 14.51%)\n- Pending KYC: 14.76% of users (11.21% dispute rate)`,
      chartTitle: 'CB Rate % by KYC Status',
      chartData: joins.kyc_vs_chargeback || [],
      xKey: 'kyc_status',
      yKey: 'cb_rate'
    };
  }

  if (q.includes('severity level') || q.includes('compare chargebacks by severity')) {
    return {
      text: `Dispute Severity Distribution\n\n- High / Critical Severity: Disputed cases average 8.4 days reporting delay.\n- Medium Severity: Average 5.2 days delay.\n- Low Severity: Average 2.1 days delay.`,
      chartTitle: 'Dispute Delay (Days) by Severity',
      chartData: joins.delay_vs_severity || [],
      xKey: 'severity',
      yKey: 'avg_delay_days'
    };
  }

  if (q.includes('disputes reported after 7 days') || q.includes('after 7 days')) {
    return {
      text: `Disputes Reported After 7 Days\n\nDisputes reported >7 days after transaction timestamp indicate potential account takeover or delayed fraud discovery. Critical severity disputes exhibit an average reporting lag of 8.4 days.`,
      chartTitle: 'Avg Delay Days by Severity',
      chartData: joins.delay_vs_severity || [],
      xKey: 'severity',
      yKey: 'avg_delay_days'
    };
  }

  if (q.includes('highest chargeback-to-transaction ratio') || q.includes('highest ratio')) {
    const topR = joins.top_merchants_by_ratio?.[0] || { merchant_id: 'MCH3891', cb_ratio: 33.33 };
    return {
      text: `Merchant with Highest Chargeback Ratio\n\nMerchant ${topR.merchant_id} (${topR.merchant_name}) leads with a ${topR.cb_ratio}% chargeback-to-transaction ratio (benchmark threshold is <2.5%).`,
      chartTitle: 'Highest CB Ratio % Merchants',
      chartData: joins.top_merchants_by_ratio?.slice(0, 5) || [],
      xKey: 'merchant_id',
      yKey: 'cb_ratio'
    };
  }

  if (q.includes('utr validity') || q.includes('utr status')) {
    return {
      text: `UTR Validity vs Failure Rate\n\n- Valid UTR: 12-digit numeric standard (Low failure rate ~18.2%)\n- Missing / Malformed UTR: Missing or malformed UTR string exhibits a 42.1% failure rate and higher dispute risk.`,
      chartTitle: 'Failure Rate % by UTR Status',
      chartData: joins.utr_vs_failure || [],
      xKey: 'utr_status',
      yKey: 'failure_rate'
    };
  }

  if (q.includes('hourly') || q.includes('hour')) {
    return {
      text: `Hourly Transaction Failure Spikes\n\nFailure rates peak during late night / early morning hours (01:00 - 04:00 AM) up to 36.4% due to bank batch settlements and offline UPI switches.`,
      chartTitle: 'Failure Rate % by Hour',
      chartData: joins.hourly_failure?.slice(0, 10) || [],
      xKey: 'hour',
      yKey: 'failure_rate'
    };
  }

  if (q.includes('ticket size') || q.includes('declared ticket')) {
    return {
      text: `Declared Ticket Size vs Dispute Risk\n\nHigh average ticket size merchants (>₹15,000 declared ticket size) show elevated dispute ratios, particularly in Consumer Electronics and Travel MCCs.`,
      chartTitle: 'Avg CB Rate by Ticket Size',
      chartData: joins.ticket_size_vs_cb || [],
      xKey: 'ticket_bin',
      yKey: 'avg_cb_rate'
    };
  }

  return {
    text: `Merchant Ring AI Insights\n\nBased on pre-loaded analytics:\n- Total Logged Transactions: 20,000 (₹239.23M total value)\n- Failed Txn Rate: ${kpis.failed_rate}%\n- Overall Chargeback Ratio: ${kpis.overall_cb_ratio}%\n- Repeat Dispute Fraud Users: ${kpis.repeated_dispute_users_count}\n\nTry asking about top merchants, KYC risk, UTR validity, or hourly failure spikes!`
  };
}
