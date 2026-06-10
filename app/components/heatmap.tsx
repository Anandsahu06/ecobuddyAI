import React from "react";

interface LogItem {
  id: string;
  loggedAt: any; // Allow string, Date, or Firestore Timestamp object
  co2SavedKg: number;
}

interface HeatmapProps {
  logs: LogItem[];
}

export default function CarbonHeatmap({ logs }: HeatmapProps) {
  // Robust date parser to get YYYY-MM-DD in the local timezone
  const getLocalDateString = (dateInput: any) => {
    if (!dateInput) return "";
    
    let date: Date;
    
    // Handle Firestore Timestamp objects
    if (dateInput && typeof dateInput.toDate === "function") {
      date = dateInput.toDate();
    } else {
      date = new Date(dateInput);
    }
    
    if (isNaN(date.getTime())) return "";
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Generate past 28 days array in chronological order (oldest to newest)
  const days = Array.from({ length: 28 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (27 - i));
    return getLocalDateString(date);
  });

  const getIntensityClass = (dateStr: string) => {
    const dayLogs = logs.filter(l => getLocalDateString(l.loggedAt) === dateStr);
    const totalSaved = dayLogs.reduce((sum, current) => sum + (current.co2SavedKg || 0), 0);
    
    if (totalSaved === 0) {
      return "bg-brand-emerald/5 border-white/5";
    }
    if (totalSaved < 1.0) {
      return "bg-brand-emerald/20 border-brand-emerald/30 shadow-[0_0_4px_rgba(16,185,129,0.1)]";
    }
    if (totalSaved < 3.0) {
      return "bg-brand-emerald/50 border-brand-emerald/60 shadow-[0_0_6px_rgba(16,185,129,0.2)]";
    }
    return "bg-brand-lime text-brand-forest border-brand-lime shadow-[0_0_10px_rgba(163,230,53,0.4)]";
  };

  const getTooltipContent = (dateStr: string) => {
    const dayLogs = logs.filter(l => getLocalDateString(l.loggedAt) === dateStr);
    const totalSaved = dayLogs.reduce((sum, current) => sum + (current.co2SavedKg || 0), 0);
    if (totalSaved === 0) return `${dateStr}: No carbon actions logged.`;
    return `${dateStr}: Saved ${totalSaved.toFixed(2)} kg CO2e (${dayLogs.length} action${dayLogs.length > 1 ? "s" : ""})`;
  };

  return (
    <div className="glass-panel p-5 rounded-3xl border border-brand-emerald/15">
      <h3 className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider mb-4 flex items-center justify-between">
        <span>Carbon Logging Grid</span>
        <span className="text-[10px] text-brand-lime normal-case">Consistency Calendar</span>
      </h3>
      <div className="grid grid-cols-7 gap-2">
        {days.map((dayStr) => (
          <div
            key={dayStr}
            title={getTooltipContent(dayStr)}
            className={`aspect-square rounded-lg border transition-all duration-300 hover:scale-110 cursor-pointer ${getIntensityClass(
              dayStr
            )}`}
          />
        ))}
      </div>
      <div className="flex justify-between items-center text-[10px] text-text-secondary mt-4">
        <span>Less savings</span>
        <div className="flex gap-1.5 items-center">
          <span className="w-2.5 h-2.5 rounded bg-brand-emerald/5 border border-white/5" title="0 kg saved" />
          <span className="w-2.5 h-2.5 rounded bg-brand-emerald/20 border border-brand-emerald/30" title="< 1 kg saved" />
          <span className="w-2.5 h-2.5 rounded bg-brand-emerald/50 border border-brand-emerald/60" title="1 - 3 kg saved" />
          <span className="w-2.5 h-2.5 rounded bg-brand-lime border-brand-lime" title="> 3 kg saved" />
        </div>
        <span>More savings</span>
      </div>
    </div>
  );
}
