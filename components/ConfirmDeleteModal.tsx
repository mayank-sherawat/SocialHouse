"use client";

import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmDeleteModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDeleteModal({
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#FAF9F6] border border-[#DCD8CE] w-full max-w-sm p-6 shadow-2xl space-y-4 relative overflow-hidden">
        {/* Animated Progress Bar when deleting */}
        {loading && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#FEE2E2] overflow-hidden">
            <div className="h-full bg-[#DC2626] animate-[pulse_1s_ease-in-out_infinite] w-full" />
          </div>
        )}

        <div className="flex items-center gap-3 border-b border-[#EAE7DF] pb-3">
          <div className="p-2 bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8C8880]">
              DESTRUCTION CONFIRMATION
            </div>
            <h2 className="text-base font-bold tracking-tight text-[#181716]">
              Remove Photograph?
            </h2>
          </div>
        </div>

        <p className="text-xs font-mono text-[#6C6860] leading-relaxed">
          This print will be permanently removed from your gallery and cannot be recovered.
        </p>

        <div className="flex justify-end gap-2 pt-2 border-t border-[#EAE7DF]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#6C6860] hover:text-[#181716] transition"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] active:scale-95 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-70 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>REMOVING...</span>
              </>
            ) : (
              <span>CONFIRM DELETE</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
