"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface QuestProps {
  title: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
  onComplete: () => void;
}

export default function AnimatedQuestCard({
  title,
  description,
  progress,
  target,
  completed,
  onComplete
}: QuestProps) {
  return (
    <motion.div
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.015 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`p-3.5 rounded-2xl border cursor-pointer transition-colors duration-300 ${
        completed
          ? "bg-brand-emerald/10 border-brand-lime/45 shadow-[0_0_12px_rgba(163,230,53,0.08)]"
          : "bg-brand-forest/40 border-white/5 hover:border-brand-emerald/20"
      }`}
      onClick={onComplete}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p
            className={`text-sm font-bold leading-tight ${
              completed ? "line-through text-brand-lime opacity-75" : "text-text-primary"
            }`}
          >
            {title}
          </p>
          <p className="text-xs text-text-secondary mt-1 leading-snug">{description}</p>
        </div>

        <motion.div
          animate={{ scale: completed ? [1, 1.25, 1] : 1 }}
          className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
            completed
              ? "bg-brand-lime border-brand-lime text-brand-forest"
              : "border-text-secondary hover:border-brand-emerald"
          }`}
        >
          {completed ? (
            <CheckCircle className="w-4 h-4 stroke-[3]" />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-transparent" />
          )}
        </motion.div>
      </div>

      {!completed && (
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-text-secondary mb-1">
            <span>Avoidance Target</span>
            <span>{progress} / {target} kg</span>
          </div>
          <div className="w-full h-1.5 bg-brand-forest/60 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (progress / target) * 100)}%` }}
              className="h-full bg-brand-emerald rounded-full"
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
