"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, HelpCircle } from "lucide-react";
import { useApp } from "../context/app-context";
import { LevelProgression } from "../lib/level-progression";

const statusQuotes = [
  "You walk, I grow. Deal? 🚲",
  "Plant-based food makes me sprout! 🥗",
  "Unplugging standby electronics saves my leaves! 🔌",
  "Is that a streak I see? You're burning hot! 🔥",
  "Let's plant some real trees soon! 🌳",
  "Tap me to see me wiggle! ✨",
  "Every kg of CO2 saved waters me. Keep going! 💧",
];

export default function BuddyDome() {
  const { buddyLevel, buddyXp, equippedSkin } = useApp();
  const neededXp = LevelProgression.getXpForLevel(buddyLevel);
  const xpPercentage = LevelProgression.getXpProgressPercentage(buddyXp, buddyLevel);
  const [quote, setQuote] = useState(statusQuotes[0]);
  const [wiggle, setWiggle] = useState(false);
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * statusQuotes.length);
      setQuote(statusQuotes[idx]);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleBuddyClick = () => {
    setWiggle(true);
    const idx = Math.floor(Math.random() * statusQuotes.length);
    setQuote(statusQuotes[idx]);
    setTimeout(() => setWiggle(false), 600);
  };

  const getSkinPosition = () => {
    if (buddyLevel >= 4) return { x: 100, y: 52 };
    if (buddyLevel === 3) return { x: 100, y: 78 };
    if (buddyLevel === 2) return { x: 100, y: 98 };
    return { x: 100, y: 122 };
  };

  // Define SVG elements based on level
  const renderBuddySVG = () => {
    const isLevel1 = buddyLevel === 1;
    const isLevel2 = buddyLevel === 2;
    const isLevel3 = buddyLevel === 3;
    const isLevel4Plus = buddyLevel >= 4;

    return (
      <svg
        viewBox="0 0 200 200"
        className={`w-48 h-48 mx-auto transition-transform duration-500 cursor-pointer ${
          wiggle ? "animate-bounce" : "animate-breathe"
        }`}
        onClick={handleBuddyClick}
      >
        <defs>
          {/* Neon Glow Leaf Filter */}
          <filter id="leaf-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Soil Gradient */}
          <linearGradient id="soilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#452718" />
            <stop offset="100%" stopColor="#1e100a" />
          </linearGradient>
          {/* Stem/Trunk Gradient */}
          <linearGradient id="stemGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          {/* Leaf Gradient */}
          <linearGradient id="leafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#a3e635" />
          </linearGradient>
        </defs>

        {/* Terrarium Base / Soil */}
        <ellipse cx="100" cy="155" rx="65" ry="20" fill="url(#soilGrad)" />
        <ellipse cx="100" cy="150" rx="58" ry="12" fill="#5c3826" opacity="0.8" />

        {/* LEVEL 1: Tiny Sprout Seed */}
        {isLevel1 && (
          <g>
            {/* The Seed */}
            <path d="M90,150 C88,140 112,140 110,150 Z" fill="#8b5a2b" />
            {/* Small green dot sprout */}
            <path
              d="M100,143 C96,135 104,130 102,126 C105,130 104,138 100,143 Z"
              fill="url(#leafGrad)"
              filter="url(#leaf-glow)"
            />
          </g>
        )}

        {/* LEVEL 2: Small Sprout */}
        {isLevel2 && (
          <g>
            {/* Main stem */}
            <path
              d="M100,150 Q98,125 100,110"
              stroke="url(#stemGrad)"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            {/* One Leaf */}
            <path
              d="M100,110 C112,100 115,115 100,120 Z"
              fill="url(#leafGrad)"
              filter="url(#leaf-glow)"
            />
          </g>
        )}

        {/* LEVEL 3: Sapling */}
        {isLevel3 && (
          <g>
            {/* Main Stem */}
            <path
              d="M100,150 Q95,120 100,90"
              stroke="url(#stemGrad)"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />
            {/* Branch Left */}
            <path
              d="M97,125 Q82,115 80,105"
              stroke="url(#stemGrad)"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Branch Leaves */}
            <path
              d="M80,105 C70,95 85,95 90,105 Z"
              fill="url(#leafGrad)"
              filter="url(#leaf-glow)"
            />
            <path
              d="M100,90 C115,75 120,95 100,100 Z"
              fill="url(#leafGrad)"
              filter="url(#leaf-glow)"
            />
            {/* Small leaf on right stem */}
            <path
              d="M99,112 C108,110 112,120 100,122 Z"
              fill="url(#leafGrad)"
              opacity="0.8"
            />
          </g>
        )}

        {/* LEVEL 4+: Flowering Bonsai Tree */}
        {isLevel4Plus && (
          <g>
            {/* Thick Trunk */}
            <path
              d="M100,150 Q90,115 100,75"
              stroke="url(#stemGrad)"
              strokeWidth="11"
              strokeLinecap="round"
              fill="none"
            />
            {/* Left Branch */}
            <path
              d="M96,120 Q70,105 65,95"
              stroke="url(#stemGrad)"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />
            {/* Right Branch */}
            <path
              d="M101,105 Q125,95 130,85"
              stroke="url(#stemGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            {/* Foliage / Leaves Clusters */}
            {/* Left Cluster */}
            <ellipse cx="60" cy="90" rx="18" ry="12" fill="url(#leafGrad)" filter="url(#leaf-glow)" />
            <ellipse cx="70" cy="85" rx="14" ry="10" fill="url(#leafGrad)" opacity="0.9" />

            {/* Right Cluster */}
            <ellipse cx="130" cy="80" rx="16" ry="11" fill="url(#leafGrad)" filter="url(#leaf-glow)" />
            <ellipse cx="122" cy="76" rx="12" ry="8" fill="url(#leafGrad)" opacity="0.9" />

            {/* Top Cluster */}
            <ellipse cx="100" cy="65" rx="22" ry="15" fill="url(#leafGrad)" filter="url(#leaf-glow)" />
            <ellipse cx="90" cy="60" rx="16" ry="11" fill="url(#leafGrad)" opacity="0.9" />
            <ellipse cx="110" cy="62" rx="16" ry="11" fill="url(#leafGrad)" opacity="0.9" />

            {/* Glowing neon pink flowers */}
            <circle cx="95" cy="55" r="3" fill="#ec4899" filter="url(#leaf-glow)" />
            <circle cx="105" cy="68" r="3" fill="#ec4899" filter="url(#leaf-glow)" />
            <circle cx="65" cy="84" r="3" fill="#ec4899" filter="url(#leaf-glow)" />
            <circle cx="135" cy="75" r="3" fill="#ec4899" filter="url(#leaf-glow)" />
          </g>
        )}

        {/* Dynmically Equipped Cosmetic Skin */}
        {equippedSkin && equippedSkin !== "default" && (
          <text
            x={getSkinPosition().x}
            y={getSkinPosition().y}
            textAnchor="middle"
            fontSize={buddyLevel >= 4 ? "28" : "22"}
            className="select-none pointer-events-none transition-all duration-300"
          >
            {equippedSkin === "santa_hat" && "🎅"}
            {equippedSkin === "sunglasses" && "🕶️"}
            {equippedSkin === "crown" && "👑"}
          </text>
        )}
      </svg>
    );
  };

  return (
    <div className="relative glass-panel rounded-3xl p-6 flex flex-col items-center border border-brand-emerald/20 overflow-hidden group shadow-lg">
      {/* Decorative ambient glow behind the buddy */}
      <div className="absolute w-40 h-40 rounded-full bg-brand-emerald/10 blur-3xl -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />

      {/* Terrarium Glass Dome Overlay */}
      <div className="absolute inset-x-8 top-10 bottom-24 border border-white/5 rounded-t-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

      {/* Title Header */}
      <div className="w-full flex items-center justify-between mb-4 z-10">
        <div className="flex items-center gap-1.5 text-brand-emerald">
          <Sparkles className="w-4 h-4 text-brand-lime" />
          <span className="text-xs font-mono font-bold tracking-wider uppercase">Active Companion</span>
        </div>
        <button
          onClick={() => setShowTip(!showTip)}
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {showTip && (
        <div className="absolute top-12 left-4 right-4 bg-brand-forest/90 border border-brand-emerald/30 p-3 rounded-xl z-20 text-xs text-text-secondary shadow-xl transition-all duration-300">
          🌱 **Nurture your EcoBuddy:** Every time you log green deeds (like cycling or plant meals), you earn Carbon Points. 100 XP levels up your companion, revealing brand new leaves, flowers, and forms!
        </div>
      )}

      {/* Speech Bubble */}
      <div className="relative bg-brand-glass border border-brand-emerald/15 px-4 py-2 rounded-2xl mb-2 text-center text-xs font-semibold text-brand-lime tracking-wide shadow-md max-w-[90%] z-10 animate-pulse">
        {quote}
        <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-brand-emerald/15" />
      </div>

      {/* Buddy Vector Render */}
      <div className="relative z-10 flex items-center justify-center min-h-[200px]">
        {renderBuddySVG()}
      </div>

      {/* Level and XP Badge Bar */}
      <div className="w-full mt-4 z-10">
        <div className="flex justify-between items-baseline mb-1">
          <span className="font-display font-black text-lg text-text-primary">
            Level {buddyLevel} <span className="text-xs font-normal text-text-secondary">{buddyLevel === 1 ? "Seed" : buddyLevel === 2 ? "Sprout" : buddyLevel === 3 ? "Sapling" : "Flowering Bonsai"}</span>
          </span>
          <span className="text-xs font-mono text-brand-lime font-bold">{buddyXp}/{neededXp} XP</span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-2.5 bg-brand-forest/60 rounded-full overflow-hidden border border-brand-emerald/10">
          <div
            className="h-full bg-gradient-to-r from-brand-emerald to-brand-lime rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            style={{ width: `${xpPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
