"use client";

import { Wrench } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] text-[#181716] p-6 antialiased">
      <div className="max-w-md w-full bg-[#FAF9F6] border border-[#DCD8CE] p-8 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 bg-[#F2EFE9] border border-[#DCD8CE] mx-auto flex items-center justify-center text-[#181716]">
          <Wrench className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8C8880]">
            MAINTENANCE INTERVAL
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#181716]">
            System Calibration in Progress
          </h1>
        </div>
        <p className="text-xs font-mono text-[#6C6860] leading-relaxed">
          The archive servers are performing routine maintenance. Services will resume shortly.
        </p>
        <div className="pt-4 border-t border-[#EAE7DF] text-[10px] font-mono text-[#8C8880]">
          EST. 2025 &bull; SOCIALHOUSE ARCHIVE
        </div>
      </div>
    </div>
  );
}
