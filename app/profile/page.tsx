"use client";

import React, { useState } from "react";
import { User, Shield, Compass, Sliders, ExternalLink, Leaf, TreeDeciduous, ShoppingBag, Calculator, CheckCircle } from "lucide-react";
import { useApp } from "../context/app-context";
import Navigation from "../components/navigation";

interface Certificate {
  id: string;
  species: string;
  location: string;
  coordinates: string;
  plantedAt: string;
  offsetAmt: number;
}

const mockCertificates: Certificate[] = [
  {
    id: "CERT-MAD-092",
    species: "Mangrove Sapling",
    location: "Mahajanga Province, Madagascar",
    coordinates: "-15.783, 46.338",
    plantedAt: "2026-05-12",
    offsetAmt: 50
  },
  {
    id: "CERT-CAN-114",
    species: "Douglas Fir",
    location: "British Columbia, Canada",
    coordinates: "54.511, -128.609",
    plantedAt: "2026-06-01",
    offsetAmt: 35
  }
];

export default function ProfilePage() {
  const { 
    currentProfile,
    buddyLevel, 
    greenPoints, 
    equippedSkin, 
    unlockedSkins, 
    skinsCatalog, 
    buySkin, 
    equipSkin,
    streakShields,
    buyStreakShield
  } = useApp();
  
  const initials = currentProfile?.name
    ? currentProfile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "EH";
  
  // App local settings (simulated)
  const [diet, setDiet] = useState("flexitarian");
  const [commute, setCommute] = useState("transit");
  const [smartHome, setSmartHome] = useState(false);
  
  // B2B Pricing Calculator state
  const [employees, setEmployees] = useState(150);

  // Calculate B2B rates
  const getB2bRate = (count: number) => {
    if (count >= 500) return 2.0;
    if (count >= 100) return 3.0;
    return 4.0;
  };

  const b2bRate = getB2bRate(employees);
  const monthlyCost = employees * b2bRate;
  const annualSavingsTons = parseFloat(((employees * 48.0 * 12) / 1000).toFixed(1));

  const handleRequestQuote = () => {
    alert(`Thank you! A corporate wellness proposal for ${employees} seats ($${monthlyCost}/mo) has been generated and sent to your email. Our team will contact you shortly!`);
  };

  return (
    <Navigation>
      {/* Title */}
      <div className="mb-6">
        <h1 className="font-display font-black text-2xl tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-brand-emerald" />
          Profile & Settings
        </h1>
        <p className="text-xs text-text-secondary">
          Manage preferences, customize your virtual buddy, and calculate corporate plans.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Profile Card, Preferences, Buddy Shop (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main User Card */}
          <div className="glass-panel rounded-3xl p-5 border border-brand-emerald/15 flex items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-brand-emerald/5 blur-2xl pointer-events-none" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-emerald to-brand-lime flex items-center justify-center text-3xl shadow-lg border border-brand-emerald/10 font-bold text-brand-forest shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black text-lg text-text-primary">{currentProfile?.name || "Eco Hero"}</h2>
                <span className="text-[9px] font-mono px-2.5 py-0.5 rounded-full border border-brand-lime/30 text-brand-lime bg-brand-emerald/10 font-bold uppercase">
                  Level {buddyLevel} Hero
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">Member since June 2026 • Cohort Alpha</p>
              <p className="text-[10px] text-brand-lime font-semibold mt-1.5 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Scope 3 Verified carbon profile active.
              </p>
            </div>
          </div>

          {/* User Preferences Form */}
          <div className="glass-panel rounded-3xl p-5 border border-brand-emerald/15">
            <h3 className="font-display font-bold text-sm text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-lime" />
              Sustainability Preferences
            </h3>

            <div className="space-y-4">
              {/* Diet setting */}
              <div>
                <span className="block text-xs font-semibold text-text-primary mb-1.5 uppercase tracking-wide font-mono">
                  Base Dietary Preference
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {["omnivore", "flexitarian", "vegetarian", "vegan"].map((opt) => (
                    <button
                      key={opt}
                      id={`profile-diet-opt-${opt}`}
                      onClick={() => setDiet(opt)}
                      className={`py-2 px-1 text-[10px] sm:text-xs font-bold rounded-xl border capitalize transition-all cursor-pointer ${
                        diet === opt
                          ? "bg-brand-emerald/15 border-brand-lime text-brand-lime"
                          : "bg-brand-forest/30 border-white/5 text-text-secondary hover:border-brand-emerald/20"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Commute setting */}
              <div>
                <span className="block text-xs font-semibold text-text-primary mb-1.5 uppercase tracking-wide font-mono">
                  Primary Commute Mode
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "drive", label: "🚘 Passenger Car" },
                    { key: "transit", label: "🚌 Public Transit" },
                    { key: "active", label: "🚲 Bike / Walk" }
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      id={`profile-commute-opt-${opt.key}`}
                      onClick={() => setCommute(opt.key)}
                      className={`py-2 px-2 text-[10px] sm:text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        commute === opt.key
                          ? "bg-brand-emerald/15 border-brand-lime text-brand-lime"
                          : "bg-brand-forest/30 border-white/5 text-text-secondary hover:border-brand-emerald/20"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Smart home toggle */}
              <div className="pt-2 flex items-center justify-between border-t border-brand-emerald/10">
                <div>
                  <p className="text-xs font-bold text-text-primary">Connect Utility API</p>
                  <p className="text-[10px] text-text-secondary mt-0.5">
                    Sync electric meters automatically (WattTime / SmartThings).
                  </p>
                </div>
                <button
                  onClick={() => setSmartHome(!smartHome)}
                  id="profile-utility-toggle"
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    smartHome ? "bg-brand-emerald" : "bg-toxic-grey"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-brand-forest shadow ring-0 transition duration-200 ease-in-out ${
                      smartHome ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Buddy Upgrade Shop */}
          <div className="glass-panel rounded-3xl p-5 border border-brand-emerald/15">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-sm text-text-primary flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-brand-lime" />
                Buddy Shop & Upgrades
              </h3>
              <span className="text-xs font-mono font-bold text-brand-lime bg-brand-emerald/10 px-2.5 py-1 rounded-xl border border-brand-emerald/20">
                💰 {greenPoints} GP
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Streak Freeze Upgrade Item */}
              <div className="p-4 rounded-2xl border border-brand-emerald/15 bg-brand-forest/40 flex flex-col items-center justify-between text-center transition-all duration-300">
                <div className="text-4xl my-2 flex items-center justify-center min-h-[50px] relative w-12 h-12 bg-brand-emerald/5 rounded-xl border border-brand-emerald/10">
                  🛡️
                  <span className="absolute top-[-5px] right-[-5px] bg-brand-lime text-brand-forest font-black text-[9px] px-1.5 py-0.5 rounded-full border border-brand-forest">
                    {streakShields}
                  </span>
                </div>

                <p className="text-xs font-bold text-text-primary mt-1">Streak Shield</p>
                <p className="text-[10px] text-text-secondary mt-0.5">Cost: 150 Green Points</p>

                <div className="w-full mt-3">
                  <button
                    onClick={() => {
                      if (greenPoints >= 150) {
                        buyStreakShield();
                      } else {
                        alert(`Oops! You need ${150 - greenPoints} more GP. Log actions to buy shields.`);
                      }
                    }}
                    id="profile-buy-shield-btn"
                    className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      greenPoints >= 150
                        ? "bg-brand-lime text-brand-forest hover:scale-[1.02] shadow-[0_0_8px_rgba(163,230,53,0.3)]"
                        : "bg-toxic-grey/40 border border-white/5 text-text-secondary cursor-not-allowed"
                    }`}
                  >
                    Buy Shield
                  </button>
                </div>
              </div>

              {/* Skins catalog loop */}
              {skinsCatalog.map((skin) => {
                const isUnlocked = unlockedSkins.includes(skin.id);
                const isEquipped = equippedSkin === skin.id;
                
                return (
                  <div
                    key={skin.id}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-between text-center transition-all duration-300 ${
                      isEquipped
                        ? "bg-brand-emerald/10 border-brand-lime"
                        : "bg-brand-forest/40 border-white/5 hover:border-brand-emerald/10"
                    }`}
                  >
                    <div className="text-4xl my-2 flex items-center justify-center min-h-[50px] relative w-12 h-12 bg-brand-emerald/5 rounded-xl border border-brand-emerald/10">
                      🌱
                      {skin.emoji && (
                        <span className="absolute top-[-5px] text-xl animate-bounce" style={{ animationDelay: "200ms" }}>
                          {skin.emoji}
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-text-primary mt-1">{skin.name}</p>
                    <p className="text-[10px] text-text-secondary mt-0.5">
                      {skin.cost === 0 ? "Free Default" : `${skin.cost} Green Points`}
                    </p>

                    {/* Action buttons */}
                    <div className="w-full mt-3">
                      {isEquipped ? (
                        <button
                          disabled
                          id={`profile-skin-equip-${skin.id}`}
                          className="w-full py-1.5 px-3 bg-brand-emerald/15 border border-brand-emerald/20 text-brand-lime rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Equipped
                        </button>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => equipSkin(skin.id)}
                          id={`profile-skin-equip-${skin.id}`}
                          className="w-full py-1.5 px-3 bg-brand-emerald/25 border border-brand-emerald/30 hover:border-brand-lime text-text-primary hover:text-brand-lime rounded-xl text-xs font-bold cursor-pointer transition-all"
                        >
                          Equip Skin
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (greenPoints >= skin.cost) {
                              buySkin(skin.id, skin.cost);
                            } else {
                              alert(`Oops! You need ${skin.cost - greenPoints} more GP. Log actions in Chat to earn more!`);
                            }
                          }}
                          id={`profile-skin-buy-${skin.id}`}
                          className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            greenPoints >= skin.cost
                              ? "bg-brand-lime text-brand-forest hover:scale-[1.02] shadow-[0_0_8px_rgba(163,230,53,0.3)]"
                              : "bg-toxic-grey/40 border border-white/5 text-text-secondary cursor-not-allowed"
                          }`}
                        >
                          Buy Skin
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Reforestation Certificates & B2B Calculator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* B2B Pricing Calculator */}
          <div className="glass-panel rounded-3xl p-5 border border-brand-emerald/15 bg-gradient-to-b from-brand-emerald/5 to-transparent">
            <h3 className="font-display font-bold text-sm text-brand-lime flex items-center gap-2 mb-2">
              <Calculator className="w-4.5 h-4.5" />
              Corporate Seat Calculator
            </h3>
            <p className="text-xs text-text-secondary leading-snug mb-4">
              Determine Scope 3 corporate wellness rates for your enterprise workforce.
            </p>

            <div className="space-y-4">
              {/* Seat input slider */}
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[10px] text-text-secondary font-mono uppercase font-bold">Total Seats</span>
                  <span className="text-sm font-bold text-brand-lime">{employees} employees</span>
                </div>
                <input
                  type="range"
                  id="profile-b2b-seats-slider"
                  aria-label="Total corporate seats"
                  min="10"
                  max="1000"
                  step="10"
                  value={employees}
                  onChange={(e) => setEmployees(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-brand-forest rounded-lg appearance-none cursor-pointer accent-brand-lime"
                />
              </div>

              {/* Calculated grid stats */}
              <div className="grid grid-cols-2 gap-2 border-y border-brand-emerald/10 py-3">
                <div>
                  <p className="text-[9px] text-text-secondary font-mono uppercase leading-none">Seat License Rate</p>
                  <p className="text-md font-display font-black text-text-primary mt-1">
                    ${b2bRate.toFixed(2)} <span className="text-[9px] font-normal text-text-secondary">/mo</span>
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-text-secondary font-mono uppercase leading-none">Avoided Scope 3</p>
                  <p className="text-md font-display font-black text-brand-lime mt-1">
                    ~{annualSavingsTons} <span className="text-[9px] font-normal text-text-secondary">Tons/yr</span>
                  </p>
                </div>
              </div>

              {/* Total Summary */}
              <div className="flex justify-between items-center bg-brand-forest/60 p-3 rounded-xl border border-brand-emerald/10">
                <div>
                  <p className="text-[9px] text-text-secondary font-mono uppercase leading-none">Wellness Cost</p>
                  <p className="text-lg font-display font-black text-brand-lime mt-1">${monthlyCost} <span className="text-xs font-normal text-text-secondary">/month</span></p>
                </div>
                <button
                  onClick={handleRequestQuote}
                  id="profile-b2b-quote-btn"
                  className="px-3.5 py-2 text-xs glow-btn rounded-xl font-bold cursor-pointer"
                >
                  Generate Quote
                </button>
              </div>

              {/* Tier guide badges */}
              <div className="flex items-center justify-between text-[8px] text-text-secondary font-mono">
                <span>Tier 1 (10-99): $4/mo</span>
                <span>Tier 2 (100-499): $3/mo</span>
                <span>Tier 3 (500+): $2/mo</span>
              </div>
            </div>
          </div>

          {/* Reforestation Tree Certificates */}
          <div className="glass-panel rounded-3xl p-5 border border-brand-emerald/15">
            <h3 className="font-display font-bold text-sm text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
              <TreeDeciduous className="w-4.5 h-4.5 text-brand-emerald" />
              Reforestation Certificates
            </h3>

            <p className="text-xs text-text-secondary leading-snug mb-4">
              Your carbon points are backed up by planting real trees. Each badge represents validated sequestration.
            </p>

            <div className="space-y-3.5">
              {mockCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-3.5 bg-brand-forest/40 border border-brand-emerald/20 rounded-2xl relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-brand-lime flex items-center gap-1.5">
                        <Leaf className="w-3.5 h-3.5" />
                        {cert.species}
                      </p>
                      <p className="text-[10px] text-text-secondary mt-0.5">{cert.location}</p>
                    </div>
                    <span className="text-[8px] font-mono px-1.5 py-0.5 rounded border border-white/5 text-text-secondary bg-brand-forest/60">
                      {cert.id}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-brand-emerald/10 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-text-secondary font-mono leading-none">GPS LAT / LON</p>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${cert.coordinates}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-mono text-brand-emerald hover:underline flex items-center gap-0.5 mt-1 font-bold"
                      >
                        {cert.coordinates} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-text-secondary font-mono leading-none">OFFSET CAPACITY</p>
                      <p className="text-xs font-bold text-brand-lime mt-1">- {cert.offsetAmt} kg CO2 / yr</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-2.5 bg-brand-emerald/5 border border-brand-emerald/10 rounded-xl flex items-center gap-2">
              <Compass className="w-4 h-4 text-brand-lime shrink-0" />
              <p className="text-[10px] text-text-secondary leading-snug">
                Tree planting is audited and verified by Eden Projects NGO. Geolocation data is publicly queryable on-chain.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Navigation>
  );
}
