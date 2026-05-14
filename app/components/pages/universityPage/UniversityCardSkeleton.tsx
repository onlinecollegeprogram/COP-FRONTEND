import React from "react";

export default function UniversityCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xl shadow-purple-900/5 border border-purple-50 animate-pulse">
      {/* Banner */}
      <div className="relative h-48 sm:h-40 bg-gradient-to-br from-gray-200 to-gray-100">
        <div className="absolute top-4 left-4 w-8 h-8 rounded-xl bg-gray-300/80" />
        <div className="absolute top-4 right-0 h-6 w-28 rounded-l-full bg-gray-300/80" />
        <div className="absolute bottom-4 left-4 w-14 h-14 rounded-2xl bg-white border border-gray-100" />
        <div className="absolute bottom-4 right-4 h-6 w-20 rounded-xl bg-gray-300/70" />
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="h-5 w-3/4 bg-gray-200 rounded mb-3" />
        <div className="h-4 w-1/2 bg-gray-200 rounded mb-4" />

        {/* Rating chip */}
        <div className="h-8 w-40 bg-amber-50 border border-amber-100 rounded-lg mb-4" />

        {/* Highlights */}
        <div className="space-y-2.5 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-100" />
            <div className="h-4 flex-1 bg-gray-200 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-100" />
            <div className="h-4 w-5/6 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <div className="h-11 w-full bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-10 bg-gray-200 rounded-xl" />
            <div className="h-10 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
