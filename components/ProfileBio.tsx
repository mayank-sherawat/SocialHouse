"use client";

import { useState } from "react";
import EditBioModal from "./EditBioModal";

export default function ProfileBio({
  bio,
  isOwner,
}: {
  bio: string | null;
  isOwner: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [currentBio, setCurrentBio] = useState(bio);

  return (
    <div className="mt-3">
      <p className="text-sm text-gray-700 whitespace-pre-wrap">
        {currentBio || "No bio yet"}
      </p>

      {isOwner && (
        <button
          onClick={() => setOpen(true)}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          Edit bio
        </button>
      )}

      {open && (
        <EditBioModal
          bio={currentBio}
          onClose={() => setOpen(false)}
          onSaved={(newBio) => {
            setCurrentBio(newBio);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
