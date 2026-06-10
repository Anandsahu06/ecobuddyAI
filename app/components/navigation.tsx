"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Shield, Award, User, Leaf } from "lucide-react";
import { useApp } from "../context/app-context";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: Home },
  { label: "Eco Chat", href: "/chat", icon: MessageSquare },
  { label: "Levels", href: "/levels", icon: Shield },
  { label: "Badges", href: "/badges", icon: Award },
  { label: "Profile", href: "/profile", icon: User },
];

export default function Navigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { 
    streak, 
    profiles, 
    currentProfileId, 
    switchProfile, 
    createProfile 
  } = useApp();

  const handleProfileChange = (val: string) => {
    if (val === "switch" || val === "new") {
      switchProfile("");
    } else {
      switchProfile(val);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-forest text-text-primary">
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-brand-emerald/15 p-6 h-screen sticky top-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-brand-emerald/20 rounded-xl">
            <Leaf className="w-6 h-6 text-brand-emerald animate-pulse" />
          </div>
          <span className="font-display font-extrabold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-brand-emerald to-brand-lime">
            ECOBUDDY AI
          </span>
        </div>

        {/* Profile Selector Dropdown */}
        <div className="mb-4">
          <label className="block text-[9px] font-mono font-bold text-text-secondary uppercase tracking-wider mb-1">
            Active Profile
          </label>
          <select
            value={currentProfileId}
            onChange={(e) => handleProfileChange(e.target.value)}
            className="w-full bg-brand-forest/60 border border-brand-emerald/25 text-xs text-brand-lime rounded-xl px-2 py-2 focus:outline-none cursor-pointer font-bold"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id} className="bg-brand-forest text-text-primary">
                👤 {p.name}
              </option>
            ))}
            <option value="switch" className="bg-brand-forest text-brand-lime font-bold">
              🔄 Switch Profile...
            </option>
          </select>
        </div>

        {/* User Info Quick View */}
        <div className="mb-6 p-3 rounded-xl bg-brand-emerald/5 border border-brand-emerald/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <div>
              <p className="text-xs text-text-secondary font-semibold font-mono leading-none uppercase">Streak</p>
              <p className="text-sm font-bold text-brand-lime mt-1">{streak} Days</p>
            </div>
          </div>
          <div className="h-2 w-2 rounded-full bg-brand-lime animate-ping" />
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-semibold group ${
                  isActive
                    ? "bg-brand-emerald/20 text-brand-lime border-l-4 border-brand-lime pl-3"
                    : "text-text-secondary hover:bg-brand-emerald/5 hover:text-text-primary"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? "text-brand-lime" : "text-text-secondary group-hover:text-brand-emerald"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-brand-emerald/10 text-center">
          <p className="text-[10px] text-text-secondary font-mono">
            EcoBuddy v1.0.0
          </p>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between p-4 glass-panel border-b border-brand-emerald/10 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-brand-emerald animate-pulse shrink-0" />
          <select
            value={currentProfileId}
            onChange={(e) => handleProfileChange(e.target.value)}
            className="bg-transparent border-none text-xs font-bold text-brand-lime focus:outline-none cursor-pointer"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id} className="bg-brand-forest text-text-primary">
                {p.name}
              </option>
            ))}
            <option value="switch" className="bg-brand-forest text-brand-lime font-bold">
              🔄 Switch Profile...
            </option>
          </select>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-brand-emerald/10 rounded-full border border-brand-emerald/20">
          <span className="text-xs">🔥</span>
          <span className="text-xs font-bold text-brand-lime">{streak}d</span>
        </div>
      </header>

      {/* Main Page Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto pb-24 md:pb-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 h-16 glass-panel rounded-2xl flex items-center justify-around px-2 border border-brand-emerald/20 shadow-2xl z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-brand-emerald/15 text-brand-lime"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-brand-lime" : "text-text-secondary"}`} />
              <span className="text-[9px] mt-1 font-bold tracking-tight">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
