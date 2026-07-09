"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Breadcrumbs } from '../../Breadcrumbs';
import HeroSection from './HeroSection';
import UniversitySelection from './UniversitySelection';
import ComparisonTable from './ComparisonTable';
import StatsSection from './StatsSection';
import TalkToCounselor from '../../talkToCounselor';
import Footer from '../../layout/Footer';

import { University } from './universityData';
import { ArrowLeft, ArrowRight, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Matches the rule enforced by UniversitySelection and the compare drawer.
const MIN_TO_COMPARE = 2;

export default function CompareUniversitiesPage() {
    const searchParams = useSearchParams();
    const tableRef = useRef<HTMLDivElement>(null);
    const [universityList, setUniversityList] = useState<University[]>([]);
    const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
    const [isTableOpen, setIsTableOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const ids = searchParams.get('ids');
        if (ids) {
            const idList = ids.split(',').filter(id => id.trim() !== '');
            if (idList.length > 0) {
                setSelectedUniversities(idList);
                localStorage.setItem('selectedToCompare', JSON.stringify(idList));
                setIsTableOpen(true);

                // Scroll to comparison table
                setTimeout(() => {
                    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 500);
            }
        } else {
            const saved = localStorage.getItem('selectedToCompare');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setSelectedUniversities(parsed);
                        // Optional: automatically open table if returning with saved selection
                        // setIsTableOpen(true);
                    }
                } catch (e) {
                    console.error("Failed to parse selectedToCompare from localStorage", e);
                }
            }
        }
    }, [searchParams]);

    useEffect(() => {
        const fetchUniversities = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/public/providers`);
                const data = await response.json();

                const mappedData: University[] = data.map((provider: any) => {
                    const comp = provider.comparison || {};
                    return {
                        id: provider._id,
                        name: provider.name,
                        location: comp.location || "N/A",
                        programType: "Online Degree",
                        duration: comp.duration || "N/A",
                        fee: comp.feesStartingFrom ? `₹${comp.feesStartingFrom.toLocaleString()}` : "N/A",
                        feeDescription: "Starting Fees",
                        logo: provider.logo || "/placeholder-logo.png",
                        intakePeriod: comp.intakePeriod || "N/A",
                        timeCommitment: comp.timeCommitment || "N/A",
                        totalSeats: comp.totalSeatsAvailable ? comp.totalSeatsAvailable.toString() : "N/A",
                        studentRating: comp.overallRating || provider.averageRating || 0,
                        nationalRanking: "N/A",
                        accreditation: comp.accreditation || "N/A",
                        placements: {
                            rate: comp.placementRate ? `${comp.placementRate}%` : "N/A",
                            average: comp.averageSalary ? `${comp.averageSalary} LPA` : "N/A",
                        },
                        minRequirements: comp.minimumRequirements || comp.eligibility || "N/A",
                        learningMode: "Online",
                        specializations: "Multiple",
                        totalStudents: "10,000+",
                        keyHighlights: provider.shortExcerpt ? [provider.shortExcerpt] : ["Expert Faculty", "Global Recognition"],
                        emiOption: comp.emiOption || "Available",
                        bestROI: provider.bestROI || false
                    };
                });
                setUniversityList(mappedData);
            } catch (error) {
                console.error("Failed to fetch universities:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUniversities();
    }, []);

    const toggleUniversity = (id: string) => {
        let newList: string[];
        if (selectedUniversities.includes(id)) {
            newList = selectedUniversities.filter(uId => uId !== id);
        } else {
            if (selectedUniversities.length < 4) {
                newList = [...selectedUniversities, id];
            } else {
                return;
            }
        }
        setSelectedUniversities(newList);
        localStorage.setItem('selectedToCompare', JSON.stringify(newList));

        // Dropping below the minimum invalidates an open table. Collapse it so it does
        // not spring back open by itself on the next selection — reopening is deliberate.
        if (newList.length < MIN_TO_COMPARE) {
            setIsTableOpen(false);
        }
    };

    const selectedData = universityList.filter(u => selectedUniversities.includes(u.id));
    const canCompare = selectedUniversities.length >= MIN_TO_COMPARE;

    const handleToggleTable = () => {
        const nextState = !isTableOpen;
        setIsTableOpen(nextState);
        if (nextState) {
            setTimeout(() => {
                tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFF] font-['Nunito'] overflow-hidden lg:pt-7">
            <div className="px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                {/* back to universities */}
                <div className="mb-4 sm:mb-6 mt-4 md:mt-0">
                    <Link
                        href="/universities"
                        className="text-[#9810FA] hover:underline flex items-center gap-1 font-bold text-lg sm:text-xl"
                    >
                        <ArrowLeft size={18} strokeWidth={2.5} />
                        Back to Universities
                    </Link>
                </div>

                {/* Page Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mb-1 sm:mb-2">Compare Universities</h1>
                    <p className="text-gray-500 font-medium text-sm sm:text-base">Select and compare the best universities and select the right choice</p>
                </div>

                <HeroSection />

                <div ref={tableRef}>
                    {isTableOpen && canCompare ? (
                        <ComparisonTable
                            selectedData={selectedData}
                            onRemove={(id) => toggleUniversity(id)}
                        />
                    ) : (
                        <div className="mb-8 sm:mb-12 rounded-xl border border-dashed border-[#E5E7EB] bg-white px-6 py-12 sm:py-16 text-center shadow-sm">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#7C3AED]">
                                <LayoutGrid size={26} strokeWidth={2} />
                            </div>
                            <h2 className="text-lg sm:text-xl font-extrabold text-[#111827]">
                                Your comparison will appear here
                            </h2>
                            <p className="mx-auto mt-2 max-w-md text-sm font-medium text-gray-500">
                                {canCompare
                                    ? `${selectedUniversities.length} universities selected. Open the table to see them side by side.`
                                    : `Pick at least ${MIN_TO_COMPARE} universities below to compare them side by side.`}
                            </p>
                            <button
                                onClick={handleToggleTable}
                                disabled={!canCompare}
                                className={`mx-auto mt-6 flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-6 py-3 sm:py-4 text-base font-bold text-white shadow-md transition-all duration-300 ${canCompare
                                    ? 'bg-[#803AF2] hover:bg-[#6D28D9] hover:scale-[1.01] cursor-pointer'
                                    : 'bg-gray-300 cursor-not-allowed'
                                    }`}
                            >
                                Open Comparison Table
                                <ArrowRight size={20} strokeWidth={2.5} />
                            </button>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#803AF2]"></div>
                    </div>
                ) : (
                    <UniversitySelection
                        universities={universityList}
                        selectedUniversities={selectedUniversities}
                        onToggle={toggleUniversity}
                        onCompare={handleToggleTable}
                        isTableOpen={isTableOpen}
                    />
                )}

                <StatsSection />

                <TalkToCounselor />
            </div>
        </div>
    );
}
