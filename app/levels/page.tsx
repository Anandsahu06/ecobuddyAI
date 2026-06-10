"use client";

import React from "react";
import { Shield, Sparkles, Lock, CheckCircle, Flame, Star, Leaf, Award } from "lucide-react";
import { useApp } from "../context/app-context";
import Navigation from "../components/navigation";
import { LevelProgression } from "../lib/level-progression";

interface LevelMilestone {
  level: number;
  name: string;
  xpRequired: number;
  icon: string;
  reward: string;
  description: string;
}

const levelMilestones: LevelMilestone[] = [
  { level: 1, name: "Tiny Seed", xpRequired: 0, icon: "🌱", reward: "Default Companion Skin", description: "Your green journey starts here. Plant your first sustainable choices." },
  { level: 2, name: "Green Sprout", xpRequired: 100, icon: "🌱", reward: "Santa Hat accessory unlocked", description: "A small root extends! Your choices are starting to save carbon." },
  { level: 3, name: "Sapling", xpRequired: 200, icon: "🌿", reward: "Cool Shades accessory unlocked", description: "A sturdier stem with leaves. Active transit and recycling are habits now." },
  { level: 4, name: "Flowering Bonsai", xpRequired: 300, icon: "🌳", reward: "Royal Crown accessory unlocked", description: "Vibrant neon pink flowers bloom! You are an active carbon hero." },
  { level: 5, name: "Planet Guardian", xpRequired: 400, icon: "👑", reward: "Reforestation Certificate (Madagascar)", description: "Ultimate eco-mastery. A real mangrove tree is planted in your name!" },
  { level: 6, name: "Forest Steward", xpRequired: 500, icon: "🌲", reward: "150 Green Points bonus", description: "Your lifestyle saves emissions equivalent to keeping 10 trash bags out of landfills." },
  { level: 7, name: "Eco Champion", xpRequired: 600, icon: "🛡️", reward: "Eco Champion Profile Badge", description: "A sturdy oak trunk forms. You are in the top tier of regional carbon savers." },
  { level: 8, name: "Climate Sage", xpRequired: 700, icon: "🧙‍♂️", reward: "250 Green Points bonus", description: "Providing a green canopy. Your energy choices are fully optimized." },
  { level: 9, name: "Ancient Redwood", xpRequired: 800, icon: "🌴", reward: "Reforestation Certificate (Canada)", description: "A giant of the forest. Massive carbon offset volume achieved!" },
  { level: 10, name: "Eco Legend", xpRequired: 900, icon: "✨", reward: "Eco Legend profile skin", description: "Complete carbon neutrality achieved. Empowering a global community." }
];

export default function LevelsPage() {
  const { buddyLevel, buddyXp, streak, greenPoints } = useApp();

  // Calculate cumulative XP: 100 XP per level + current level's XP
  const cumulativeXp = (buddyLevel - 1) * 100 + buddyXp;

  return (
    <Navigation>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-brand-lime" />
            Levels & Progression
          </h1>
          <p className="text-xs text-text-secondary">
            Level up your companion by saving carbon. Unlock unique badges, skins, and plant real-world trees.
          </p>
        </div>

        {/* Counter Summary */}
        <div className="px-4 py-2 bg-brand-emerald/10 border border-brand-emerald/20 rounded-2xl flex items-center gap-3 w-fit">
          <Star className="w-5 h-5 text-brand-lime animate-spin-slow" />
          <div>
            <p className="text-[10px] text-text-secondary font-mono leading-none">TOTAL SCORE</p>
            <p className="text-sm font-bold text-brand-lime mt-1">
              {cumulativeXp} XP
            </p>
          </div>
        </div>
      </div>

      {/* Main Level Progress Summary Card */}
      <div className="glass-panel rounded-3xl p-6 border border-brand-emerald/25 bg-gradient-to-br from-brand-emerald/5 to-transparent mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-brand-lime/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-emerald/15 border border-brand-emerald/20 flex items-center justify-center text-4xl shadow-md">
              {buddyLevel >= 4 ? "🌳" : buddyLevel === 3 ? "🌿" : "🌱"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black text-xl text-text-primary">
                  Level {buddyLevel}: {levelMilestones.find(m => m.level === buddyLevel)?.name || "Eco Buddy"}
                </h2>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full border border-brand-lime/30 text-brand-lime bg-brand-emerald/10 font-bold uppercase animate-pulse">
                  Active
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-1">
                You are currently in the **{buddyLevel >= 4 ? "Flowering Bonsai" : buddyLevel === 3 ? "Sapling" : "Seedling"}** evolution stage.
              </p>
            </div>
          </div>

          <div className="w-full md:w-80 space-y-2">
            <div className="flex justify-between items-baseline text-xs font-mono">
              <span className="text-text-secondary">Level progress</span>
              <span className="text-brand-lime font-bold">{buddyXp} / {LevelProgression.getXpForLevel(buddyLevel)} XP</span>
            </div>
            <div className="w-full h-3 bg-brand-forest/65 rounded-full overflow-hidden border border-brand-emerald/10 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-brand-emerald to-brand-lime rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(163,230,53,0.5)]"
                style={{ width: `${LevelProgression.getXpProgressPercentage(buddyXp, buddyLevel)}%` }}
              />
            </div>
            <p className="text-[10px] text-text-secondary text-right">
              {LevelProgression.getXpForLevel(buddyLevel) - buddyXp} XP to Level {buddyLevel + 1}
            </p>
          </div>
        </div>
      </div>

      {/* Levels Timeline Map */}
      <div className="glass-panel rounded-3xl border border-brand-emerald/15 p-5 md:p-8 max-w-3xl mx-auto space-y-6 relative">
        <h3 className="font-display font-bold text-sm text-text-secondary uppercase tracking-wider mb-6 flex items-center gap-1.5 border-b border-brand-emerald/10 pb-3">
          <Award className="w-4.5 h-4.5 text-brand-emerald" />
          EcoBuddy Level Roadmap
        </h3>

        {/* Timeline track */}
        <div className="relative pl-8 border-l border-brand-emerald/20 space-y-6">
          {levelMilestones.map((milestone) => {
            const isCurrent = buddyLevel === milestone.level;
            const isUnlocked = buddyLevel >= milestone.level;
            
            return (
              <div key={milestone.level} className="relative group">
                {/* Timeline node circle */}
                <div
                  className={`absolute left-[-41px] top-0.5 w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-all duration-300 z-10 ${
                    isCurrent
                      ? "bg-brand-lime border-brand-lime text-brand-forest shadow-[0_0_12px_rgba(163,230,53,0.6)] animate-pulse"
                      : isUnlocked
                      ? "bg-brand-emerald border-brand-emerald text-text-primary"
                      : "bg-brand-forest border-toxic-grey text-text-secondary"
                  }`}
                >
                  {isUnlocked ? (
                    <CheckCircle className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <Lock className="w-3 h-3" />
                  )}
                </div>

                {/* Level Card */}
                <div
                  className={`p-4 rounded-2xl border transition-all duration-300 ${
                    isCurrent
                      ? "bg-brand-emerald/10 border-brand-lime shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                      : isUnlocked
                      ? "bg-brand-forest/40 border-brand-emerald/15 opacity-80"
                      : "bg-brand-forest/20 border-white/5 opacity-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl bg-brand-emerald/5 p-1 rounded-lg border border-brand-emerald/10">
                          {milestone.icon}
                        </span>
                        <h4 className={`font-display font-bold text-sm ${isCurrent ? "text-brand-lime" : "text-text-primary"}`}>
                          Level {milestone.level}: {milestone.name}
                        </h4>
                        <span className="text-[10px] font-mono text-text-secondary font-bold">
                          ({milestone.xpRequired} XP required)
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1.5 leading-snug">
                        {milestone.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-[9px] text-text-secondary font-mono leading-none uppercase">Level Reward</p>
                      <p className={`text-xs font-bold mt-1 ${isCurrent ? "text-brand-lime" : "text-brand-emerald"}`}>
                        {milestone.reward}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Navigation>
  );
}
