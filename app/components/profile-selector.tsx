"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Plus, Flame, Leaf, Trash2, Cloud, Database, Sparkles, ChevronRight, ArrowRight } from "lucide-react";
import { useApp } from "../context/app-context";

interface ProfileSelectorProps {
  isCloudActive: boolean;
}

export default function ProfileSelector({ isCloudActive }: ProfileSelectorProps) {
  const { profiles, createProfile, switchProfile, deleteProfile } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter a profile name");
      return;
    }

    if (profiles.some((p) => p.name.toLowerCase() === name.trim().toLowerCase())) {
      setError("A profile with this name already exists");
      return;
    }

    createProfile(name.trim());
    setName("");
    setIsCreating(false);
  };

  const getBuddyEmojiFromLevel = (level: number) => {
    if (level >= 4) return "🌳";
    if (level === 3) return "🌿";
    return "🌱";
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-forest p-4 md:p-8 overflow-y-auto">
      {/* Decorative background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-emerald/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-lime/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10">
        {/* Status Indicator Badge */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono border glass-panel">
            {isCloudActive ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-brand-lime animate-pulse" />
                <span className="text-brand-lime uppercase tracking-wider">Cloud Database Active</span>
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400 uppercase tracking-wider">Local Sandbox Mode</span>
              </>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="inline-flex p-4 bg-brand-emerald/15 rounded-3xl border border-brand-emerald/25 mb-4"
          >
            <Leaf className="w-10 h-10 text-brand-emerald animate-breathe" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display font-black text-4xl md:text-5xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-text-primary to-text-secondary"
          >
            EcoBuddy AI
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-text-secondary text-sm md:text-md mt-2 max-w-md mx-auto"
          >
            Your gamified carbon tracker companion. Select or create an eco profile to continue.
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {!isCreating ? (
            <motion.div
              key="selection"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
            >
              {/* Profile Cards */}
              {profiles.map((p) => {
                const level = p.buddyLevel || 1;
                const carbonScore = p.carbonScore || 0;
                const streak = p.streak || 0;
                
                return (
                  <motion.div
                    key={p.id}
                    variants={itemVariants}
                    className="glass-panel rounded-3xl p-6 relative flex flex-col justify-between h-[220px] border border-brand-emerald/15 hover:border-brand-lime/40 transition-all duration-300 group cursor-pointer"
                    onClick={() => switchProfile(p.id)}
                  >
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 rounded-3xl bg-brand-lime/5 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 pointer-events-none" />

                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl p-2.5 bg-brand-emerald/10 rounded-2xl border border-brand-emerald/20">
                          {getBuddyEmojiFromLevel(level)}
                        </div>
                        <div>
                          <h3 className="font-display font-black text-lg text-text-primary group-hover:text-brand-lime transition-colors">
                            {p.name}
                          </h3>
                          <span className="text-[10px] font-mono font-bold text-text-secondary uppercase">
                            Level {level} Buddy
                          </span>
                        </div>
                      </div>

                      {/* Delete profile option */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Are you sure you want to delete profile "${p.name}"?`)) {
                            deleteProfile(p.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-toxic-grey hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors z-10"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-2 gap-4 border-t border-brand-emerald/10 pt-4 mt-4">
                      <div>
                        <p className="text-[9px] text-text-secondary font-mono uppercase tracking-wider leading-none">Avoided CO2</p>
                        <p className="text-sm font-bold text-brand-lime mt-1 font-display">
                          {carbonScore} <span className="text-[10px] font-normal text-text-secondary">kg</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-text-secondary font-mono uppercase tracking-wider leading-none">Active Streak</p>
                        <p className="text-sm font-bold text-streak-orange mt-1 font-display flex items-center gap-1">
                          <Flame className="w-4 h-4" />
                          {streak} <span className="text-[10px] font-normal text-text-secondary">Days</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-end text-xs text-brand-lime font-bold gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Enter Dashboard</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </motion.div>
                );
              })}

              {/* Create New Profile Button Card */}
              <motion.div
                variants={itemVariants}
                onClick={() => setIsCreating(true)}
                className="glass-panel rounded-3xl p-6 border border-dashed border-brand-emerald/30 hover:border-brand-lime flex flex-col items-center justify-center text-center h-[220px] group cursor-pointer transition-all duration-300"
              >
                <div className="p-4 bg-brand-emerald/10 border border-brand-emerald/20 group-hover:border-brand-lime rounded-2xl mb-3 group-hover:scale-105 transition-all">
                  <Plus className="w-6 h-6 text-brand-emerald group-hover:text-brand-lime" />
                </div>
                <h3 className="font-display font-bold text-md text-text-primary group-hover:text-brand-lime transition-colors">
                  Create Profile
                </h3>
                <p className="text-xs text-text-secondary mt-1">Add a new eco avatar to sync</p>
              </motion.div>
            </motion.div>
          ) : (
            /* Creation Form */
            <motion.div
              key="creation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto glass-panel rounded-3xl p-6 md:p-8 border border-brand-emerald/20"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-brand-lime animate-pulse" />
                <h2 className="font-display font-black text-xl text-text-primary">
                  Create Eco Profile
                </h2>
              </div>
              <p className="text-xs text-text-secondary mb-6 leading-relaxed">
                Choose a unique name for your new profile. Your buddy companion will start as a seed 🌱 and evolve as you log green habits to Firestore.
              </p>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label htmlFor="profile-name-input" className="block text-xs font-semibold text-text-primary mb-1.5 uppercase tracking-wider font-mono">
                    Profile Name
                  </label>
                  <input
                    type="text"
                    id="profile-name-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Eco Hero, Green Warrior..."
                    maxLength={25}
                    className="w-full bg-brand-forest/60 border border-brand-emerald/25 text-sm text-text-primary rounded-xl px-4 py-3 focus:outline-none focus:border-brand-lime font-bold placeholder:text-text-secondary/40"
                    autoFocus
                  />
                  {error && <p className="text-xs text-red-400 mt-1.5 font-semibold">{error}</p>}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setError("");
                      setName("");
                    }}
                    className="flex-1 py-3 border border-white/5 bg-brand-forest/50 hover:bg-brand-forest text-text-secondary rounded-xl text-xs font-bold cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 glow-btn rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Create Profile</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
