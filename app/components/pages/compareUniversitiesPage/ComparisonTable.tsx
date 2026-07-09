import React from 'react';
import { IconArrowLeft, IconStar, IconMapPin, IconCertificate, IconClock, IconCurrencyRupee, IconLayoutGrid, IconUsers, IconCheck } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { University } from './universityData';

interface ComparisonTableProps {
    selectedData: University[];
    onRemove: (id: string) => void;
}

const ComparisonTable = ({ selectedData, onRemove }: ComparisonTableProps) => {
    const router = useRouter();

    const handleDetailedComparison = () => {
        const ids = selectedData.map(u => u.id).join(',');
        const destination = `/compareUniversities/detailed?ids=${ids}`;

        const token = localStorage.getItem('studentToken');
        if (!token) {
            // Hand the destination to the login page so it can send the user back here.
            router.push(`/login?message=comparison&redirect=${encodeURIComponent(destination)}`);
            return;
        }
        router.push(destination);
    };

    const features = [
        { label: "University Courses", key: "name" },
        { label: "Rating", key: "studentRating", isRating: true },
        { label: "Location", key: "location", icon: <IconMapPin size={16} /> },
        { label: "Accreditation", key: "accreditation", icon: <IconCertificate size={16} /> },
        { label: "Duration", key: "duration", icon: <IconClock size={16} /> },
        { label: "Total Fees", key: "fee", icon: <IconCurrencyRupee size={16} /> },
        { label: "Learning Mode", key: "learningMode" },
        { label: "Specializations", key: "specializations", icon: <IconLayoutGrid size={16} /> },
        { label: "Total Students", key: "totalStudents", icon: <IconUsers size={16} /> },
        { label: "Placement Rate", key: "placementRate" },
        { label: "Key Highlights", key: "keyHighlights", isList: true },
        { label: "Actions", key: "actions", isActions: true }
    ];

    return (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#111827]">
                    Comparison
                </h2>
                <button
                    onClick={handleDetailedComparison}
                    className="w-full sm:w-auto bg-[#803AF2] hover:bg-[#6D28D9] text-white px-6 sm:px-8 py-3 rounded-xl font-black text-sm shadow-lg shadow-purple-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                    View Detailed Comparison
                </button>
            </div>

            <div className="bg-[#FFFFFF] rounded-xl border border-[#E5E7EB] shadow overflow-hidden mb-12 w-full">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="p-4 sm:p-6 bg-[#C4B5FD] text-[#4C1D95] font-black text-xs sm:text-sm uppercase tracking-wider min-w-[140px] sm:w-[240px] sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                    Features
                                </th>
                                {selectedData.map((uni, idx) => (
                                    <th key={uni.id} className="p-4 sm:p-6 bg-white min-w-[260px] sm:min-w-[300px] border-b border-gray-100 relative">
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <h3 className="font-extrabold text-[#803AF2] text-lg sm:text-xl leading-tight px-2 sm:px-4">{uni.name}</h3>
                                            <button
                                                onClick={() => onRemove(uni.id)}
                                                className="absolute top-2 sm:top-6 right-2 sm:right-6 text-gray-400 hover:text-red-500 transition-colors cursor-pointer bg-gray-50 sm:bg-transparent rounded-full p-1.5 sm:p-0"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {features.map((feature) => (
                                <tr key={feature.label}>
                                    <td className="p-4 sm:p-6 font-bold text-gray-700 bg-[#FDFDFF] divide-y divide-gray-100 border-r border-gray-50 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-xs sm:text-base">
                                        {feature.label}
                                    </td>
                                    {selectedData.map((uni) => (
                                        <td key={uni.id} className="p-4 sm:p-6 text-gray-600 font-medium text-sm sm:text-base">
                                            {feature.isRating ? (
                                                <div className="flex items-center gap-1">
                                                    <IconStar size={16} className="fill-yellow-400 text-yellow-400" />
                                                    <span className="font-bold text-[#111827]">{uni.studentRating}</span>
                                                </div>
                                            ) : feature.isList ? (
                                                <ul className="space-y-2">
                                                    {uni.keyHighlights.map((hl, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm">
                                                            <IconCheck size={14} className="text-green-500 mt-1 flex-shrink-0" />
                                                            <span>{hl}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : feature.isActions ? (
                                                <button
                                                    onClick={handleDetailedComparison}
                                                    className="w-full py-2 border-2 border-[#803AF2] text-[#803AF2] rounded-xl font-bold hover:bg-purple-50 transition-colors cursor-pointer">
                                                    View Details
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    {feature.icon && <span className="text-gray-400">{feature.icon}</span>}
                                                    <span className={feature.label === 'Total Fees' ? 'font-black text-[#111827]' : ''}>
                                                        {feature.label === 'Placement Rate' ? uni.placements.rate : (uni as any)[feature.key!]}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ComparisonTable;
