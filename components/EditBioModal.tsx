"use client";

import { useState } from "react";

export default function EditBioModal({
  bio,
  onClose,
  onSaved,
}: {
  bio: string | null;
  onClose: () => void;
  onSaved: (bio: string) => void;
}) {
  const [value, setValue] = useState(bio ?? "");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-5 w-full max-w-sm">
        <h2 className="font-semibold mb-2">Edit bio</h2>

        <textarea
          value={value}
          maxLength={150}
          onChange={(e) => setValue(e.target.value)}
          className="w-full border rounded p-2 text-sm"
        />

        <p className="text-xs text-gray-500 mt-1">
          {value.length}/150
        </p>

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="text-sm">
            Cancel
          </button>
          <button
            onClick={() => onSaved(value)}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
