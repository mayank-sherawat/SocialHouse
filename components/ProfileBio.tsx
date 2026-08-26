"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import EditBioModal from "./EditBioModal";
import { Edit3 } from "lucide-react";

export default function ProfileBio({
  bio,
  isOwner,
}: {
  bio: string | null;
  isOwner: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [currentBio, setCurrentBio] = useState(bio);
  const router = useRouter();

  const handleSaveBio = async (newBio: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/profile/bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: newBio }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Failed to update bio");
        return false;
      }

      setCurrentBio(newBio);
      setOpen(false);
      toast.success("Bio updated successfully.");
      router.refresh();
      return true;
    } catch {
      toast.error("Something went wrong saving your bio.");
      return false;
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-mono leading-relaxed text-[#3A3834] whitespace-pre-wrap">
        {currentBio || "No creator bio written yet."}
      </p>

      {isOwner && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1 text-[11px] font-mono text-[#6C6860] hover:text-[#181716] uppercase tracking-wider font-semibold underline underline-offset-4 transition-colors"
        >
          <Edit3 className="w-3 h-3" />
          <span>Edit Bio</span>
        </button>
      )}

      {open && (
        <EditBioModal
          bio={currentBio}
          onClose={() => setOpen(false)}
          onSaved={handleSaveBio}
        />
      )}
    </div>
  );
}
