"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

export default function EditBioModal({
  bio,
  onClose,
  onSaved,
}: {
  bio: string | null;
  onClose: () => void;
  onSaved: (bio: string) => Promise<boolean> | void;
}) {
  const [value, setValue] = useState(bio ?? "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSaved(value);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF9F6] border border-[#DCD8CE] p-6 w-full max-w-md shadow-2xl space-y-4 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {loading && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#EAE7DF] overflow-hidden">
            <div className="h-full bg-[#181716] animate-[pulse_1s_ease-in-out_infinite] w-full" />
          </div>
        )}

        <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8C8880]">
              PROFILE BIO
            </div>
            <h2 className="text-lg font-bold tracking-tight text-[#181716]">
              Edit Creator Bio
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 text-[#8C8880] hover:text-[#181716] transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1.5">
          <textarea
            value={value}
            maxLength={150}
            rows={4}
            disabled={loading}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Share your focus, gear, location, or visual vision..."
            className="w-full bg-white border border-[#D4D0C6] p-3 text-xs font-mono text-[#181716] placeholder:text-[#9A968E] focus:outline-none focus:border-[#181716] resize-none disabled:opacity-50 transition-colors"
          />
          <div className="flex justify-between items-center text-[10px] font-mono text-[#8C8880]">
            <span>MAX 150 CHARACTERS</span>
            <span className="tabular-nums">{value.length} / 150</span>
          </div>
        </div>

        <div className="flex justify-end items-center gap-2 pt-2 border-t border-[#EAE7DF]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-[#6C6860] hover:text-[#181716] transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="bg-[#181716] hover:bg-[#2C2A28] active:scale-95 disabled:opacity-50 text-[#FAF9F6] px-5 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>SAVING...</span>
              </>
            ) : (
              <span>UPDATE BIO</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
