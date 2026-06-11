"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useApp } from "../context/app-context";
import Navigation from "../components/navigation";
import ClientDateTime from "../components/client-date-time";

interface ChatMessage {
  id: string;
  sender: "user" | "buddy";
  text: string;
  timestamp: Date;
  receipt?: {
    category: "Transport" | "Food" | "Energy" | "Waste" | "None";
    co2SavedKg: number;
    carbonPoints: number;
    explanation: string;
  };
}

const quickChips = [
  { label: "🚲 Rode my bike 3 miles", text: "I rode my bike for 3 miles instead of driving." },
  { label: "🥗 Ate a vegan lunch", text: "I had a plant-based salad for lunch today." },
  { label: "🔌 Unplugged power strips", text: "I turned off standby appliances and unplugged power strips overnight." },
  { label: "♻️ Recycled waste", text: "I sorted and recycled paper, plastic, and metal waste today." }
];

const generateUniqueId = (prefix: string) => {
  return `msg-${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
};

export default function ChatPage() {
  const { addLog } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "buddy-init",
      sender: "buddy",
      text: "Hey there! I'm EcoBuddy. Tell me what green choices you made today (e.g. commuted, ate veggie, recycled) and I'll calculate your carbon points and level up our garden! 🌱",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Client-side NLP simulation engine
  const parseActionInClient = (text: string) => {
    const textLower = text.toLowerCase();
    
    // Check category: Transport
    if (textLower.includes("walk") || textLower.includes("bike") || textLower.includes("cycle") || textLower.includes("run") || textLower.includes("bus") || textLower.includes("train") || textLower.includes("metro") || textLower.includes("transit") || textLower.includes("scooty") || textLower.includes("scooter") || textLower.includes("motorcycle") || textLower.includes("hybrid") || textLower.includes("electric car") || textLower.includes("ev ") || textLower.endsWith("ev") || textLower.includes("electric vehicle")) {
      // Look for a number
      const numMatch = textLower.match(/\b\d+(\.\d+)?\b/);
      const dist = numMatch ? parseFloat(numMatch[0]) : 2; // default 2
      const isKm = textLower.includes("km") || textLower.includes("kilometer");
      const miles = isKm ? dist * 0.621 : dist;

      let mode: "walking" | "cycling" | "bus" | "train" | "scooter" | "electric_scooter" | "hybrid" | "ev" = "walking";
      if (textLower.includes("bus")) mode = "bus";
      else if (textLower.includes("train") || textLower.includes("metro") || textLower.includes("transit")) mode = "train";
      else if (textLower.includes("bike") || textLower.includes("cycle")) mode = "cycling";
      else if (textLower.includes("scooty") || textLower.includes("scooter") || textLower.includes("motorcycle")) {
        mode = textLower.includes("electric") ? "electric_scooter" : "scooter";
      } else if (textLower.includes("hybrid")) mode = "hybrid";
      else if (textLower.includes("ev") || textLower.includes("electric car") || textLower.includes("electric vehicle")) mode = "ev";

      // We import or can call CarbonCalculationEngine directly (it is imported in context, but here we can calculate it)
      // car baseline = 0.368, bus = 0.089, train = 0.041, walk/cycle = 0, scooter = 0.100, electric_scooter = 0.015, hybrid = 0.200, ev = 0.100
      const baseline = 0.368 * miles;
      let alt = 0;
      if (mode === "bus") alt = 0.089 * miles;
      else if (mode === "train") alt = 0.041 * miles;
      else if (mode === "scooter") alt = 0.100 * miles;
      else if (mode === "electric_scooter") alt = 0.015 * miles;
      else if (mode === "hybrid") alt = 0.200 * miles;
      else if (mode === "ev") alt = 0.100 * miles;

      const saved = parseFloat(Math.max(0, baseline - alt).toFixed(2));
      const points = Math.max(1, Math.round(saved * 10));

      if (saved <= 0) {
        return {
          category: "None" as const,
          co2SavedKg: 0,
          carbonPoints: 0,
          explanation: `Riding/driving ${mode} did not result in carbon savings compared to standard passenger vehicle baseline.`
        };
      }

      return {
        category: "Transport" as const,
        co2SavedKg: saved,
        carbonPoints: points,
        explanation: `Substituted passenger car ride with ${dist} ${isKm ? "km" : "miles"} of ${mode === "electric_scooter" ? "electric scooty" : mode === "scooter" ? "scooty" : mode}. Saved ${saved}kg CO2.`
      };
    }

    // Check category: Food
    if (textLower.includes("vegan") || textLower.includes("veg") || textLower.includes("plant-based") || textLower.includes("meatless") || textLower.includes("salad") || textLower.includes("burrito") || textLower.includes("oat") || textLower.includes("tofu")) {
      const saved = 1.50;
      const points = 15;
      return {
        category: "Food" as const,
        co2SavedKg: saved,
        carbonPoints: points,
        explanation: "Swapped standard meat-heavy meal for fully plant-based alternative."
      };
    }

    // Check category: Energy
    if (textLower.includes("unplug") || textLower.includes("appliance") || textLower.includes("power") || textLower.includes("electricity") || textLower.includes("light") || textLower.includes("bulb") || textLower.includes("standby") || textLower.includes("heater") || textLower.includes("ac")) {
      const saved = 0.20;
      const points = 2;
      return {
        category: "Energy" as const,
        co2SavedKg: saved,
        carbonPoints: points,
        explanation: "Unplugged phantom load electronics, reducing passive standby grid draw."
      };
    }

    // Check category: Waste
    if (textLower.includes("recycle") || textLower.includes("compost") || textLower.includes("bottle") || textLower.includes("can") || textLower.includes("bag") || textLower.includes("waste") || textLower.includes("zero waste")) {
      const saved = 0.10;
      const points = 1;
      return {
        category: "Waste" as const,
        co2SavedKg: saved,
        carbonPoints: points,
        explanation: "Diverted landfill waste to recycling/composting loop (saving raw extraction footprint)."
      };
    }

    // Default Fallback
    return {
      category: "None" as const,
      co2SavedKg: 0,
      carbonPoints: 0,
      explanation: "This activity does not represent a recognized carbon-saving action."
    };
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: generateUniqueId("user"),
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!res.ok) {
        throw new Error("API call returned non-200 response");
      }

      const analysis = await res.json();
      
      const isSavingAction = analysis.category !== "None" && analysis.co2SavedKg > 0;

      // Add activity log to context global state (only if it is actually a carbon saving action)
      if (isSavingAction) {
        addLog(textToSend, analysis.category, analysis.co2SavedKg);
      }

      const buddyMsg: ChatMessage = {
        id: generateUniqueId("buddy"),
        sender: "buddy",
        text: !isSavingAction
          ? `I couldn't verify this as a carbon-saving action. EcoBuddy only logs positive actions (like using public transit, hybrid/EV driving, walking/biking, plant-based food, recycling, or saving energy) that reduce carbon compared to average baselines.`
          : (analysis.fallback 
            ? `Got it! I calculated the carbon footprint reduction. Here is your digital Carbon Receipt:`
            : `Awesome! EcoBuddy parsed your activity and returned your verified carbon receipt:`),
        timestamp: new Date(),
        receipt: isSavingAction ? {
          category: analysis.category,
          co2SavedKg: analysis.co2SavedKg,
          carbonPoints: analysis.carbonPoints,
          explanation: analysis.explanation
        } : undefined
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, buddyMsg]);

    } catch (error) {
      console.warn("Backend API route failed. Using local client parser fallback.", error);
      
      const analysis = parseActionInClient(textToSend);
      const isSavingAction = analysis.category !== "None" && analysis.co2SavedKg > 0;
      
      // Add activity log to context global state
      if (isSavingAction) {
        addLog(textToSend, analysis.category, analysis.co2SavedKg);
      }

      const buddyMsg: ChatMessage = {
        id: generateUniqueId("buddy"),
        sender: "buddy",
        text: !isSavingAction
          ? `I couldn't verify this as a carbon-saving action. EcoBuddy only logs positive actions (like using public transit, hybrid/EV driving, walking/biking, plant-based food, recycling, or saving energy) that reduce carbon compared to average baselines.`
          : `Got it! [Offline Mode] I calculated the carbon footprint reduction. Here is your digital Carbon Receipt:`,
        timestamp: new Date(),
        receipt: isSavingAction ? analysis : undefined
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, buddyMsg]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage(inputValue);
    }
  };

  return (
    <Navigation>
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/"
          id="chat-back-btn"
          className="p-2 bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald rounded-xl hover:bg-brand-emerald/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display font-black text-2xl tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-brand-emerald animate-pulse" />
            EcoBuddy Chat Assistant
          </h1>
          <p className="text-xs text-text-secondary">
            AI extracts carbon coefficients from your everyday messages.
          </p>
        </div>
      </div>

      {/* Free Tier Quota Alert Banner */}
      <div className="mb-4 p-3.5 bg-brand-emerald/5 border border-brand-emerald/15 rounded-2xl flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-brand-lime mt-0.5 shrink-0 animate-pulse" />
        <div className="text-[11px] text-text-secondary leading-relaxed">
          <span className="font-bold text-brand-lime">Free Tier AI Notice:</span> EcoBuddy’s AI extraction service operates on a free-tier quota. If you notice a <span className="font-mono bg-brand-forest/60 px-1 py-0.5 rounded text-brand-lime text-[10px]">[Offline Mode]</span> tag, the rate limit has temporarily been hit, and EcoBuddy has gracefully switched to local rule-based calculations so you can keep logging your activities offline.
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 glass-panel rounded-3xl border border-brand-emerald/15 flex flex-col h-[calc(100vh-220px)] md:h-[calc(100vh-200px)] overflow-hidden relative">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-lg ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-brand-emerald/80 to-brand-lime/80 text-brand-forest font-semibold"
                    : "bg-brand-glass border border-brand-emerald/25 text-text-primary"
                }`}
              >
                {/* Text body */}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {/* Carbon Receipt display */}
                {msg.receipt && (
                  <div className="mt-4 p-4 bg-brand-forest/70 border border-brand-emerald/30 rounded-xl space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1.5 bg-brand-lime/10 rounded-bl-xl border-l border-b border-brand-lime/20 flex items-center gap-1 font-mono text-[9px] font-bold text-brand-lime">
                      <Sparkles className="w-3 h-3 text-brand-lime" />
                      CO2 Receipt
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-emerald/25 text-brand-lime uppercase tracking-wider text-[10px]">
                        {msg.receipt.category}
                      </span>
                      <span className="text-text-secondary text-[10px] font-mono">
                        <ClientDateTime dateString={msg.timestamp} showDate={false} />
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-y border-brand-emerald/10 py-2">
                      <div>
                        <p className="text-[10px] text-text-secondary font-mono uppercase">Emissions Avoided</p>
                        <p className="text-lg font-display font-black text-brand-lime">+{msg.receipt.co2SavedKg} kg</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-text-secondary font-mono uppercase">Points Credited</p>
                        <p className="text-lg font-display font-black text-brand-lime">+{msg.receipt.carbonPoints} Pts</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] text-text-secondary font-mono uppercase">AI Method Justification</p>
                      <p className="text-xs text-text-secondary mt-0.5 leading-snug">{msg.receipt.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-brand-glass border border-brand-emerald/15 rounded-2xl px-4 py-3 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips / Typing controls */}
        <div className="p-4 border-t border-brand-emerald/15 bg-brand-forest/65 backdrop-blur-md">
          {/* Quick-reply chip list */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                id={`chat-chip-${idx}`}
                onClick={() => handleSendMessage(chip.text)}
                className="whitespace-nowrap px-3.5 py-1.5 text-xs rounded-full border border-brand-emerald/15 bg-brand-emerald/5 text-text-primary hover:bg-brand-emerald/20 hover:border-brand-lime/30 transition-all font-semibold cursor-pointer shrink-0"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Text area inputs */}
          <div className="flex items-center gap-2 bg-brand-glass border border-brand-emerald/25 rounded-2xl px-4 py-2 shadow-inner">
            <input
              type="text"
              id="chat-input-field"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="e.g. 'I walked 3 miles to get coffee instead of driving'"
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-text-secondary text-text-primary"
            />
            <button
              onClick={() => handleSendMessage(inputValue)}
              id="chat-send-btn"
              disabled={!inputValue.trim()}
              className="p-2 bg-gradient-to-r from-brand-emerald to-brand-lime text-brand-forest rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 cursor-pointer shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Navigation>
  );
}
