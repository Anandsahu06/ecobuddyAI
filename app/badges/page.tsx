"use client";

import React, { useState } from "react";
import { Award, Sparkles, Trophy, Lock, Info, Leaf } from "lucide-react";
import { useApp } from "../context/app-context";
import Navigation from "../components/navigation";

export default function BadgesPage() {
  const { badges } = useApp();
  const [selectedBadge, setSelectedBadge] = useState<typeof badges[0] | null>(null);

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <Navigation>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-brand-lime" />
            Achievements Gallery
          </h1>
          <p className="text-xs text-text-secondary">
            Earn premium badge skins and real-world points by hitting sustainability targets.
          </p>
        </div>

        {/* Counter Summary */}
        <div className="px-4 py-2 bg-brand-emerald/10 border border-brand-emerald/20 rounded-2xl flex items-center gap-3 w-fit">
          <Trophy className="w-5 h-5 text-brand-lime" />
          <div>
            <p className="text-[10px] text-text-secondary font-mono leading-none">UNLOCKED</p>
            <p className="text-sm font-bold text-brand-lime mt-1">
              {unlockedCount} / {badges.length} Badges
            </p>
          </div>
        </div>
      </div>

      {/* Grid Layout: Badges (Left) & Selection Detail (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Badges Grid (8 cols on desktop) */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-5 border border-brand-emerald/15">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`relative p-5 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
                  badge.unlocked
                    ? "bg-brand-emerald/5 border-brand-emerald/25 hover:border-brand-lime/40 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    : "bg-brand-forest/20 border-white/5 opacity-55 hover:opacity-80"
                } ${selectedBadge?.id === badge.id ? "ring-2 ring-brand-lime ring-offset-2 ring-offset-brand-forest" : ""}`}
              >
                {/* Unlock status absolute icon */}
                {!badge.unlocked && (
                  <div className="absolute top-2 right-2 text-text-secondary">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                )}
                {badge.unlocked && (
                  <div className="absolute top-2 right-2 text-brand-lime">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                )}

                {/* Large Emoji icon */}
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl mb-3 ${
                    badge.unlocked ? "bg-brand-emerald/15 animate-float" : "bg-toxic-grey/40"
                  }`}
                  style={{ animationDelay: `${parseInt(badge.id) * 300}ms` }}
                >
                  <span className={badge.unlocked ? "" : "grayscale"}>{badge.icon}</span>
                </div>

                <h3 className={`text-sm font-bold ${badge.unlocked ? "text-brand-lime" : "text-text-secondary"}`}>
                  {badge.title}
                </h3>
                <p className="text-[10px] text-text-secondary mt-1">{badge.category}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Badge detail panel (4 cols on desktop) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel rounded-3xl p-6 border border-brand-emerald/15 min-h-[300px] flex flex-col justify-between relative overflow-hidden">
            {selectedBadge ? (
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-brand-emerald tracking-wide uppercase">
                      Badge Details
                    </span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                        selectedBadge.unlocked
                          ? "text-brand-lime bg-brand-emerald/15 border-brand-emerald/20"
                          : "text-text-secondary bg-toxic-grey/40 border-white/5"
                      }`}
                    >
                      {selectedBadge.unlocked ? "Unlocked" : "Locked"}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="w-20 h-20 rounded-full bg-brand-emerald/15 border border-brand-emerald/20 flex items-center justify-center text-5xl mx-auto my-6 shadow-xl">
                    <span className={selectedBadge.unlocked ? "" : "grayscale"}>{selectedBadge.icon}</span>
                  </div>

                  <h3 className="font-display font-black text-xl text-center text-text-primary">
                    {selectedBadge.title}
                  </h3>

                  <p className="text-sm text-text-secondary text-center mt-2 px-4 leading-relaxed">
                    {selectedBadge.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-brand-emerald/10 text-center text-xs text-text-secondary">
                  {selectedBadge.unlocked ? (
                    <p className="text-brand-lime font-bold flex items-center justify-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Checked & active on your profile!
                    </p>
                  ) : (
                    <p className="flex items-center justify-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Keep logging actions in {selectedBadge.category} to unlock!
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-text-secondary">
                <Info className="w-8 h-8 text-brand-emerald mb-3 animate-pulse" />
                <p className="text-sm font-semibold">Select a badge from the gallery grid to view unlock requirements and rewards.</p>
              </div>
            )}
          </div>

          {/* Quick Quiz Callout */}
          <div className="glass-panel rounded-3xl p-5 border border-brand-emerald/15 bg-gradient-to-br from-brand-emerald/5 to-transparent relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-brand-lime/5 blur-xl pointer-events-none" />
            <h3 className="font-display font-bold text-sm text-text-primary flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-brand-lime" />
              Bonus Reward!
            </h3>
            <p className="text-xs text-text-secondary mt-1.5 leading-snug">
              Complete the weekly sustainability trivia test in the quests panel to instantly earn **Streak Shields** and experience points.
            </p>
            <button className="text-[10px] text-brand-lime font-bold hover:underline mt-3 block w-fit">
              Take Weekly Trivia Quiz &rarr;
            </button>
          </div>
        </div>
      </div>
    </Navigation>
  );
}
