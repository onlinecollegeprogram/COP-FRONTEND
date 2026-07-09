"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { IconArrowRight, IconX } from "@tabler/icons-react";

export interface CompareDrawerUniversity {
  _id: string;
  name: string;
  logo?: string;
}

interface CompareDrawerProps {
  selectedIds: string[];
  /** Pool used to resolve ids to names/logos. Ids absent from it are still compared. */
  universities: CompareDrawerUniversity[];
  onRemove?: (id: string) => void;
}

// Mirrors the sidebar's rule: the comparison table needs at least two universities.
const MIN_TO_COMPARE = 2;
const MAX_TO_COMPARE = 4;

export default function CompareDrawer({ selectedIds, universities, onRemove }: CompareDrawerProps) {
  const router = useRouter();

  // Keep the order the user picked in, and drop ids this page can't resolve
  // (selection is shared via localStorage, so it may hold ids from another page).
  const resolved = selectedIds
    .map((id) => universities.find((u) => u._id === id))
    .filter((u): u is CompareDrawerUniversity => Boolean(u));

  const unresolvedCount = selectedIds.length - resolved.length;
  const canCompare = selectedIds.length >= MIN_TO_COMPARE;

  return (
    <AnimatePresence>
      {selectedIds.length > 0 && (
        <motion.aside
          key="compare-drawer"
          initial={{ x: "110%" }}
          animate={{ x: 0 }}
          exit={{ x: "110%" }}
          transition={{ type: "spring", stiffness: 320, damping: 34 }}
          className="fixed right-0 top-20 z-40 w-[min(19rem,calc(100vw-1.5rem))] md:top-28"
          aria-label="Universities selected for comparison"
        >
          <div className="rounded-l-2xl border border-r-0 border-purple-100 bg-white/95 p-4 shadow-[0_20px_45px_-15px_rgba(76,29,149,0.35)] backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#0F172A]">Compare Universities</h2>
              <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-semibold text-[#7C3AED]">
                {selectedIds.length}/{MAX_TO_COMPARE}
              </span>
            </div>

            <ul className="mt-3 space-y-2">
              {resolved.map((uni) => (
                <li
                  key={uni._id}
                  className="flex items-center gap-2.5 rounded-xl border border-[#F1F5F9] bg-white px-2.5 py-2"
                >
                  {uni.logo ? (
                    <img src={uni.logo} alt="" className="h-6 w-6 shrink-0 object-contain" />
                  ) : (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-purple-50 text-[11px] font-bold text-[#7C3AED]">
                      {uni.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="truncate text-xs font-medium text-[#334155]">{uni.name}</span>
                  {onRemove && (
                    <button
                      type="button"
                      onClick={() => onRemove(uni._id)}
                      aria-label={`Remove ${uni.name} from comparison`}
                      className="ml-auto shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                    >
                      <IconX className="h-3.5 w-3.5" stroke={2.5} />
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {unresolvedCount > 0 && (
              <p className="mt-2 text-[11px] font-medium text-[#94A3B8]">
                +{unresolvedCount} selected on another page
              </p>
            )}

            <button
              type="button"
              onClick={() => router.push(`/compareUniversities?ids=${selectedIds.join(",")}`)}
              disabled={!canCompare}
              className={`mt-4 flex w-full items-center justify-center gap-2 rounded-[14px] py-3 text-sm font-bold transition-all ${
                canCompare
                  ? "bg-gradient-to-r from-[#7C3AED] to-[#9333EA] text-white shadow-lg shadow-purple-200 hover:scale-[1.02] cursor-pointer"
                  : "cursor-not-allowed border border-[#E2E8F0] bg-[#F1F5F9] text-[#94A3B8]"
              }`}
            >
              {canCompare ? (
                <>
                  Compare Now
                  <IconArrowRight className="h-4 w-4" stroke={2.5} />
                </>
              ) : (
                `Select ${MIN_TO_COMPARE - selectedIds.length} more to compare`
              )}
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
