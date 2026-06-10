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
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render an invisible skeleton string matching the layout size during SSR
    return <span className="opacity-0">00:00 AM • Jan 00</span>;
  }

  try {
    const date = new Date(dateString);
    const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric" });

    return (
      <span>
        {showTime && timeStr}
        {showTime && showDate && " • "}
        {showDate && dateStr}
      </span>
    );
  } catch (error) {
    console.error("ClientDateTime error formatting date:", error);
    return <span>--:--</span>;
  }
}
