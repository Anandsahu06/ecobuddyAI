"use client";

import React from "react";
import Link from "next/link";
import { Plus, CheckCircle, Calendar, Flame, ChevronRight, Leaf, ArrowUpRight, Award, Trash2 } from "lucide-react";
import { useApp } from "./context/app-context";
import Navigation from "./components/navigation";
import BuddyDome from "./components/buddy-dome";
import ClientDateTime from "./components/client-date-time";
import CarbonHeatmap from "./components/heatmap";
import AnimatedQuestCard from "./components/animated-quest-card";
import { EPAVisualizer } from "./lib/epa-equivalencies";

export default function DashboardPage() {
  const { carbonScore, streak, logs, quests, resetState, completeQuest } = useApp();

  // Get recent 3 logs
  const recentLogs = logs.slice(0, 3);

  // Compute EPA Equivalents based on total carbonScore saved
  const epaEquivs = EPAVisualizer.getEquivalents(carbonScore);

  // Category Colors helper
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Transport":
        return "text-amber-400 bg-amber-500/10 border-amber-500/25";
      case "Food":
        return "text-red-400 bg-red-500/10 border-red-500/25";
      case "Energy":
        return "text-blue-400 bg-blue-500/10 border-blue-500/25";
      case "Waste":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/25";
      default:
        return "text-text-secondary bg-gray-500/10 border-gray-500/25";
    }
  };

  return (
    <Navigation>
      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-black text-3xl md:text-4xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-text-primary to-text-secondary">
            Good morning, Eco Hero! 🌱
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Your daily choices shape the future. Let&apos;s make today count.
          </p>
        </div>

        {/* Dashboard CTA */}
        <Link
          href="/chat"
          id="dashboard-log-cta"
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl glow-btn text-sm cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Log Green Action</span>
        </Link>
      </div>

      {/* Grid Layout: Companion + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Column Left: AI Buddy Terrarium (5 cols) */}
        <div className="lg:col-span-5">
          <BuddyDome />
        </div>

        {/* Column Right: Metrics, Equivalencies & Quests (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Carbon Saved Card */}
            <div className="glass-panel rounded-2xl p-5 border border-brand-emerald/15 flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-brand-emerald/5 blur-2xl group-hover:bg-brand-emerald/10 transition-colors pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Carbon Avoided</span>
                <Leaf className="w-5 h-5 text-brand-emerald" />
              </div>
              <div>
                <p className="font-display font-black text-3xl md:text-4xl text-brand-lime">
                  {carbonScore} <span className="text-sm font-normal text-text-secondary">kg CO2e</span>
                </p>
                <div className="flex items-center gap-1 mt-1 text-[11px] text-text-secondary">
                  <span>Carbon neutral roadmap</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-brand-lime" />
                </div>
              </div>
            </div>

            {/* Streak Tracker Card */}
            <div className="glass-panel rounded-2xl p-5 border border-brand-emerald/15 flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-streak-orange/5 blur-2xl group-hover:bg-streak-orange/10 transition-colors pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Active Streak</span>
                <Flame className="w-5 h-5 text-streak-orange animate-pulse" />
              </div>
              <div>
                <p className="font-display font-black text-3xl md:text-4xl text-streak-orange">
                  {streak} <span className="text-sm font-normal text-text-secondary">Days</span>
                </p>
                <div className="flex items-center gap-1 mt-1 text-[11px] text-text-secondary">
                  <span>Streak Shields active</span>
                  <CheckCircle className="w-3.5 h-3.5 text-brand-emerald" />
                </div>
              </div>
            </div>
          </div>

          {/* Real-World Impact Equivalents Widget */}
          <div className="glass-panel rounded-2xl p-5 border border-brand-emerald/15">
            <h3 className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Real-World Impact Equivalents</span>
              <span className="text-[10px] text-brand-lime font-mono lowercase">avoided emissions equivalents</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-brand-forest/40 border border-white/5 rounded-xl text-center">
                <span className="text-lg">📱</span>
                <p className="text-[9px] text-text-secondary mt-1 font-mono uppercase tracking-tight">Phones Charged</p>
                <p className="text-sm font-bold text-brand-lime mt-0.5">{epaEquivs.smartphoneCharges}</p>
              </div>
              <div className="p-3 bg-brand-forest/40 border border-white/5 rounded-xl text-center">
                <span className="text-lg">🚗</span>
                <p className="text-[9px] text-text-secondary mt-1 font-mono uppercase tracking-tight">Gas Miles Saved</p>
                <p className="text-sm font-bold text-brand-lime mt-0.5">{epaEquivs.gasMilesDriven}</p>
              </div>
              <div className="p-3 bg-brand-forest/40 border border-white/5 rounded-xl text-center">
                <span className="text-lg">🌲</span>
                <p className="text-[9px] text-text-secondary mt-1 font-mono uppercase tracking-tight">Tree Growth Yrs</p>
                <p className="text-sm font-bold text-brand-lime mt-0.5">{epaEquivs.seedlingGrowthYears}</p>
              </div>
              <div className="p-3 bg-brand-forest/40 border border-white/5 rounded-xl text-center">
                <span className="text-lg">🗑️</span>
                <p className="text-[9px] text-text-secondary mt-1 font-mono uppercase tracking-tight">Bags Recycled</p>
                <p className="text-sm font-bold text-brand-lime mt-0.5">{epaEquivs.trashBagsDiverted}</p>
              </div>
            </div>
          </div>

          {/* Active Quests */}
          <div className="glass-panel rounded-2xl p-5 border border-brand-emerald/15">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg text-text-primary flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-lime" />
                Active Eco Quests
              </h2>
              <span className="text-xs text-text-secondary bg-brand-emerald/10 px-2 py-0.5 rounded-full border border-brand-emerald/20">
                Daily Focus
              </span>
            </div>

            <div className="space-y-3">
              {quests.map((quest) => (
                <AnimatedQuestCard
                  key={quest.id}
                  title={quest.title}
                  description={quest.description}
                  progress={quest.progress}
                  target={quest.targetCo2}
                  completed={quest.completed}
                  onComplete={() => completeQuest(quest.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Lower Row: Recent Activity, Heatmap & Callout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
        {/* Recent Activity Logs (8 cols) */}
        <div className="md:col-span-8 glass-panel rounded-2xl p-5 border border-brand-emerald/15">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-text-primary flex items-center gap-2">
              <Leaf className="w-5 h-5 text-brand-emerald" />
              Recent Logs
            </h2>
            <Link
              href="/chat"
              className="text-xs text-brand-lime hover:underline flex items-center gap-0.5 font-bold"
            >
              <span>View all logs</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentLogs.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-brand-emerald/10 rounded-xl">
                <p className="text-xs text-text-secondary">No carbon actions logged yet.</p>
                <Link href="/chat" className="text-xs text-brand-lime font-bold hover:underline mt-1 block">
                  Log your first action via Chat!
                </Link>
              </div>
            ) : (
              recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3.5 bg-brand-forest/40 border border-white/5 rounded-xl hover:border-brand-emerald/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full border font-mono font-bold ${getCategoryColor(
                        log.category
                      )}`}
                    >
                      {log.category}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-text-primary line-clamp-1">{log.rawInput}</p>
                      <p className="text-[10px] text-text-secondary mt-0.5 font-mono">
                        <ClientDateTime dateString={log.loggedAt} />
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-brand-lime text-sm font-bold">+{log.carbonPoints} Pts</p>
                    <p className="text-text-secondary text-xs mt-0.5">-{log.co2SavedKg} kg CO2</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Level & Milestone Callout + Heatmap Calendar (4 cols) */}
        <div className="md:col-span-4 flex flex-col gap-4">
          {/* Carbon Heatmap Grid */}
          <CarbonHeatmap logs={logs} />

          {/* Quick Stats Overview */}
          <div className="glass-panel rounded-2xl p-5 border border-brand-emerald/15 flex flex-col justify-between min-h-[160px]">
            <div>
              <div className="p-2.5 bg-brand-lime/10 border border-brand-lime/20 rounded-xl w-fit mb-3">
                <Award className="w-5 h-5 text-brand-lime animate-pulse" />
              </div>
              <h3 className="font-display font-bold text-md text-text-primary">
                Next Milestone Goal
              </h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                Reach **100 kg CO2 avoided** to plant a real mangrove tree in Madagascar. You are currently at **{carbonScore} kg**.
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-brand-emerald/10 flex items-center justify-between">
              <span className="text-xs text-text-secondary font-mono">Offset Partner: Patch API</span>
              <span className="text-xs font-bold text-brand-lime">
                {Math.min(100, Math.round((carbonScore / 100) * 100))}% Completed
              </span>
            </div>
          </div>

          {/* Reset System State Card */}
          <button
            onClick={() => {
              if (confirm("Reset application data to default start state?")) {
                resetState();
              }
            }}
            id="dashboard-reset-db-btn"
            className="flex items-center justify-center gap-2 p-3 bg-red-950/20 border border-red-900/30 hover:bg-red-950/45 text-red-400 hover:text-red-300 rounded-xl text-xs cursor-pointer transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset App Profile Database</span>
          </button>
        </div>
      </div>
    </Navigation>
  );
}
