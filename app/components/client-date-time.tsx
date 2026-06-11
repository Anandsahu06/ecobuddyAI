"use client";

import React, { useState, useEffect } from "react";

interface ClientDateTimeProps {
  dateString: string | Date;
  showTime?: boolean;
  showDate?: boolean;
}

export default function ClientDateTime({
  dateString,
  showTime = true,
  showDate = true,
}: ClientDateTimeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    // Render an invisible skeleton string matching the layout size during SSR
    return <span className="opacity-0">00:00 AM • Jan 00</span>;
  }

  let timeStr = "";
  let dateStr = "";
  let errorOccurred = false;

  try {
    const date = new Date(dateString);
    timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    dateStr = date.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch (error) {
    console.error("ClientDateTime error formatting date:", error);
    errorOccurred = true;
  }

  if (errorOccurred) {
    return <span>--:--</span>;
  }

  return (
    <span>
      {showTime && timeStr}
      {showTime && showDate && " • "}
      {showDate && dateStr}
    </span>
  );
}
