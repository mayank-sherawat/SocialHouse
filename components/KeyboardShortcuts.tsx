"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { X, Command, Keyboard } from "lucide-react";

/**
 * Global Keyboard Shortcut Controller for Desktop Navigation:
 * - [J] : Scroll down to next post
 * - [K] : Scroll up to previous post
 * - [L] : Like currently focused post in view
 * - [/] : Focus search
 * - [?] : Toggle shortcut guide modal
 * - [Esc] : Close dialogs / guides
 */
export default function KeyboardShortcuts() {
  const [showHUD, setShowHUD] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when user is actively typing in inputs or textareas
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable ||
          target.getAttribute("role") === "textbox" ||
          target.getAttribute("role") === "combobox");

      // Allow Escape even from inputs to blur or close
      if (e.key === "Escape") {
        if (showHUD) {
          setShowHUD(false);
          return;
        }
        if (isInput) {
          target.blur();
          return;
        }
      }

      if (isInput) return;

      // Toggle HUD on '?'
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowHUD((prev) => !prev);
        return;
      }

      // Close HUD on 'Escape'
      if (e.key === "Escape" && showHUD) {
        setShowHUD(false);
        return;
      }

      // Quick Search on '/'
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        if (pathname !== "/search") {
          router.push("/search");
        } else {
          const searchInput = document.querySelector<HTMLInputElement>("input[type='text']");
          searchInput?.focus();
        }
        return;
      }

      // Feed Navigation on 'J' (Next Post) / 'K' (Previous Post) / 'L' (Like Active)
      const posts = Array.from(document.querySelectorAll<HTMLElement>("[data-feed-post]"));
      if (posts.length === 0) return;

      const viewportCenter = window.innerHeight / 2;
      let currentIndex = -1;
      let minDistance = Infinity;

      posts.forEach((post, i) => {
        const rect = post.getBoundingClientRect();
        const postCenter = rect.top + rect.height / 2;
        const dist = Math.abs(postCenter - viewportCenter);
        if (dist < minDistance) {
          minDistance = dist;
          currentIndex = i;
        }
      });

      if (e.key === "j" || e.key === "J") {
        e.preventDefault();
        const nextIndex = Math.min(posts.length - 1, currentIndex + 1);
        posts[nextIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        const prevIndex = Math.max(0, currentIndex - 1);
        posts[prevIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        const activePost = posts[currentIndex];
        if (activePost) {
          const photoId = activePost.getAttribute("data-post-id");
          const likeBtn = activePost.querySelector<HTMLButtonElement>(`[data-like-btn="${photoId}"]`);
          likeBtn?.click();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pathname, router, showHUD]);

  return (
    <>
      {/* Keyboard Shortcut HUD Modal */}
      {showHUD && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setShowHUD(false)}
        >
          <div
            className="bg-[#FAF9F6] border border-[#DCD8CE] shadow-2xl max-w-md w-full p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-3">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-[#181716]" />
                <h3 className="font-mono text-xs uppercase tracking-widest font-bold text-[#181716]">
                  KEYBOARD SHORTCUTS
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHUD(false)}
                className="text-[#8C8880] hover:text-[#181716] transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <ShortcutRow keys={["J"]} label="Scroll to next photo" />
              <ShortcutRow keys={["K"]} label="Scroll to previous photo" />
              <ShortcutRow keys={["L"]} label="Like active photo" />
              <ShortcutRow keys={["/"]} label="Focus creator search" />
              <ShortcutRow keys={["Esc"]} label="Close modals / Lightbox" />
              <ShortcutRow keys={["?"]} label="Toggle shortcuts guide" />
            </div>

            <div className="pt-2 border-t border-[#EAE7DF] flex items-center justify-between text-[10px] font-mono text-[#8C8880]">
              <span>DESKTOP NAVIGATION</span>
              <span className="flex items-center gap-1">
                <Command className="w-3 h-3 text-[#181716]" />
                <span>ACTIVE</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ShortcutRow({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-[#EAE7DF]/60 last:border-b-0">
      <span className="text-[#5A564E]">{label}</span>
      <div className="flex items-center gap-1">
        {keys.map((k) => (
          <kbd
            key={k}
            className="px-2 py-0.5 bg-[#F2EFE9] border border-[#DCD8CE] rounded-none text-[#181716] font-bold text-[11px] shadow-xs"
          >
            {k}
          </kbd>
        ))}
      </div>
    </div>
  );
}
