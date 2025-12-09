// app/maintenance/page.tsx
"use client";         // <<< add this

import React from "react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold mb-4">Site Under Maintenance</h1>
        <p className="text-gray-600 mb-6">
          We’re doing a quick update. We’ll be back shortly — thanks for your patience.
        </p>
      </div>
      {/* If you used styled-jsx here before, keep it. */}
    </div>
  );
}
