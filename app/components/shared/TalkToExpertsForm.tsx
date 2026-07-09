'use client';

import { useState, useEffect, useCallback } from "react";
import NextImage from "next/image";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Phone, Mail, Clock, ChevronDown, Shield, X, Check, GraduationCap } from "lucide-react";
import toast from "react-hot-toast";

const ACK_AUTO_CLOSE_MS = 10_000;

interface TalkToExpertsFormProps {
  source: string;
  initialMessage?: string;
  programs?: string[];
  isHomePage?: boolean;
  hideHeader?: boolean;
}

const DEFAULT_PROGRAMS = ["MBA & Management Programs", "Tech & Data Science", "International Programs"];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  border: "1px solid #D1D5DB",
  borderRadius: "8px",
  fontFamily: "Inter",
  fontSize: "14px",
  color: "#374151",
  outline: "none",
  boxSizing: "border-box",
  backgroundColor: "#FFFFFF",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "Inter",
  fontSize: "14px",
  fontWeight: 500,
  color: "#101828",
  marginBottom: "6px",
};

// Declared at module scope so its identity is stable across renders — defining it
// inside the form remounts the dropdown on every keystroke and drops input focus.
function CustomSelect({
  label,
  value,
  options,
  onChange,
  placeholder,
  required = false,
  id,
  icon: Icon,
  activeDropdown,
  setActiveDropdown,
  searchTerm,
  setSearchTerm,
}: {
  label: string,
  value: string,
  options: string[],
  onChange: (val: string) => void,
  placeholder: string,
  required?: boolean,
  id: string,
  icon?: any,
  activeDropdown: string | null,
  setActiveDropdown: (id: string | null) => void,
  searchTerm: string,
  setSearchTerm: (term: string) => void,
}) {
  const isOpen = activeDropdown === id;
  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="custom-select-container" style={{ position: "relative" }}>
      <label style={labelStyle}>{label} {required && <span style={{ color: "#EF4444" }}>*</span>}</label>
      <div
        onClick={() => {
          if (isOpen) {
            setActiveDropdown(null);
          } else {
            setActiveDropdown(id);
            setSearchTerm("");
          }
        }}
        style={{
          ...inputStyle,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: Icon ? "38px" : "16px",
          borderColor: isOpen ? "#9810FA" : "#D1D5DB",
          boxShadow: isOpen ? "0 0 0 2px rgba(152, 16, 250, 0.1)" : "none"
        }}
      >
        {Icon && <Icon size={16} style={{ position: "absolute", left: "12px", color: "#9CA3AF" }} />}
        <span style={{ color: value ? "#374151" : "#6B7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {value || placeholder}
        </span>
        <ChevronDown size={16} style={{ color: "#6B7280", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "none" }} />
      </div>

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 4px)",
          left: 0,
          right: 0,
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: "8px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          zIndex: 50,
          maxHeight: "280px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}>
          {options.length > 8 && (
            <div style={{ padding: "8px", borderBottom: "1px solid #F3F4F6" }}>
              <input
                type="text"
                placeholder="Search..."
                aria-label="Search options"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #E5E7EB",
                  fontSize: "13px",
                  outline: "none",
                  fontFamily: "Inter"
                }}
              />
            </div>
          )}
          {/* data-lenis-prevent: Lenis otherwise swallows the wheel event and scrolls the page instead */}
          <div data-lenis-prevent style={{ overflowY: "auto", overscrollBehavior: "contain", minHeight: 0, flex: 1 }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, i) => (
                <div
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(opt);
                    setActiveDropdown(null);
                  }}
                  style={{
                    padding: "10px 16px",
                    fontSize: "14px",
                    color: "#374151",
                    cursor: "pointer",
                    backgroundColor: value === opt ? "#F9FAFB" : "transparent",
                    fontWeight: value === opt ? 600 : 400,
                    transition: "background-color 0.1s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F3F4F6"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = value === opt ? "#F9FAFB" : "transparent"}
                >
                  {opt}
                </div>
              ))
            ) : (
              <div style={{ padding: "12px 16px", fontSize: "14px", color: "#9CA3AF", textAlign: "center" }}>
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface AckDetails {
  name: string;
  email: string;
  program: string;
  preferredTime: string;
}

function SubmissionAcknowledgement({ details, onClose }: { details: AckDetails; onClose: () => void }) {
  const [secondsLeft, setSecondsLeft] = useState(Math.round(ACK_AUTO_CLOSE_MS / 1000));
  const firstName = details.name.trim().split(/\s+/)[0] || "there";

  useEffect(() => {
    const timeout = setTimeout(onClose, ACK_AUTO_CLOSE_MS);
    const interval = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [onClose]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const nextSteps = [
    "A counsellor reviews your profile and shortlists programs that match it.",
    details.preferredTime
      ? `We call you back during your ${details.preferredTime} slot.`
      : "We call you back within 24 hours on the number you shared.",
    "You get personalised guidance on fees, eligibility and admission timelines.",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[9999] overflow-y-auto overscroll-contain bg-gradient-to-b from-white via-[#FBF8FF] to-white"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ack-title"
      data-lenis-prevent
    >
      {/* Auto-close progress — pinned to the top edge of the viewport */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: ACK_AUTO_CLOSE_MS / 1000, ease: "linear" }}
        className="fixed left-0 top-0 h-1 bg-[#9810FA]"
      />

      <button
        type="button"
        onClick={onClose}
        autoFocus
        aria-label="Close confirmation"
        className="fixed right-4 top-6 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#E5E7EB] bg-white/80 text-gray-500 shadow-sm backdrop-blur transition-colors hover:bg-gray-100 hover:text-gray-900 cursor-pointer sm:right-8"
      >
        <X size={20} />
      </button>

      <div className="flex min-h-full items-center justify-center px-5 py-20 sm:py-24 lg:px-10">
        {/* Single centered column on mobile; two columns from lg so the screen doesn't
            leave a 560px ribbon of content stranded in the middle of a wide viewport. */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="grid w-full max-w-[560px] lg:max-w-[1040px] lg:grid-cols-2 lg:items-center lg:gap-x-20"
        >
          {/* Confirmation */}
          <div>
            {/* logoDark is the light-background variant; the default logo.webp wordmark is white */}
            <NextImage
              src="/logoDark.svg"
              alt="CollegeProgram"
              width={811}
              height={260}
              className="mx-auto mb-8 h-16 w-auto sm:h-20 lg:mx-0 lg:h-24"
            />

            <div className="mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 ring-[12px] ring-emerald-50/50 lg:mx-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 shadow-[0_10px_25px_-5px_rgba(5,150,105,0.5)]">
                <Check size={36} color="#FFFFFF" strokeWidth={3} />
              </div>
            </div>

            <h1 id="ack-title" className="text-center text-[28px] font-bold leading-tight text-[#101828] sm:text-[36px] lg:text-left lg:text-[40px]">
              Request received
            </h1>
            <p className="mx-auto mt-3 max-w-[440px] text-center text-[15px] leading-relaxed text-[#6A7282] sm:text-base lg:mx-0 lg:text-left">
              Thank you, {firstName}. Your details are with our admissions team
              {details.email ? <> at <span className="font-medium text-[#374151]">{details.email}</span></> : null}.
            </p>

            <div className="mx-auto mt-8 max-w-[440px] border-t border-[#E5E7EB] pt-6 lg:mx-0">
              <p className="text-center text-[13px] leading-relaxed text-[#6A7282] lg:text-left">
                <span className="font-semibold text-[#101828]">CollegeProgram</span> is an online
                education discovery platform. We help you compare UG, PG, MBA and certification
                programs from accredited Indian and global universities on fees, rankings and
                admissions — and pair you with a counsellor who guides you through the process.
              </p>
            </div>
          </div>

          {/* Specifics and actions */}
          <div>
            {(details.program || details.preferredTime) && (
              <div className="mt-9 space-y-4 rounded-2xl border border-[#E5E7EB] bg-white/70 p-5 shadow-sm sm:p-6 lg:first:mt-0">
                {details.program && (
                  <div className="flex items-center gap-3">
                    <GraduationCap size={18} className="shrink-0 text-[#9810FA]" />
                    <span className="text-[13px] text-[#6A7282]">Program</span>
                    <span className="ml-auto text-right text-sm font-semibold text-[#101828]">{details.program}</span>
                  </div>
                )}
                {details.preferredTime && (
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="shrink-0 text-[#9810FA]" />
                    <span className="text-[13px] text-[#6A7282]">Preferred call time</span>
                    <span className="ml-auto text-right text-sm font-semibold text-[#101828]">{details.preferredTime}</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-9 lg:first:mt-0">
              <h2 className="text-center text-[13px] font-semibold uppercase tracking-wide text-[#101828] lg:text-left">What happens next</h2>
              <ol className="mx-auto mt-5 max-w-[460px] space-y-4 lg:mx-0 lg:max-w-none">
                {nextSteps.map((step, i) => (
                  <li key={i} className="flex gap-3.5">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-50 text-xs font-bold text-[#9810FA]">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed text-[#6A7282]">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-9 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-white/25 bg-gradient-to-r from-emerald-700/75 via-emerald-600/75 to-emerald-800/75 shadow-[0_4px_16px_rgba(4,120,87,0.3)] backdrop-blur-md">
              <Shield size={14} color="#FFFFFF" />
              <span className="text-[13px] font-medium text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]">No Spam Calls</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-7 flex h-[52px] w-full items-center justify-center rounded-[10px] bg-[#9810FA] text-[15px] font-semibold text-white shadow-[0_10px_15px_-3px_rgba(173,70,255,0.3)] transition-all hover:opacity-90 cursor-pointer"
            >
              Done
            </button>

            <p className="mt-4 text-center text-xs text-[#9CA3AF] lg:text-left" aria-live="off">
              This closes automatically in {secondsLeft}s
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function TalkToExpertsForm({
  source,
  initialMessage = "Talk to Experts Request",
  programs = DEFAULT_PROGRAMS,
  isHomePage = false,
  hideHeader = false
}: TalkToExpertsFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    programOfInterest: "",
    preferredTime: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const [courseOptions, setCourseOptions] = useState<string[]>(programs);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/provider-courses/home-summary`);
        if (response.ok) {
          const data = await response.json();
          // Extract names from grouped courses
          const allCourses = data.flatMap((group: any) => group.courses?.map((c: any) => c.name) || []);
          const uniqueCourses = Array.from(new Set(allCourses)).filter(Boolean) as string[];

          if (uniqueCourses.length > 0) {
            setCourseOptions([...uniqueCourses, "Others"]);
          } else {
            // If API returns nothing, use prop and add Others
            setCourseOptions([...programs, "Others"]);
          }
        } else {
          setCourseOptions([...programs, "Others"]);
        }
      } catch (err) {
        console.error("Failed to fetch programs for selector", err);
        setCourseOptions([...programs, "Others"]);
      }
    };
    fetchPrograms();
  }, [programs]);

  // Click outside handler for custom selects
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element).closest(".custom-select-container")) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [ack, setAck] = useState<AckDetails | null>(null);
  const closeAck = useCallback(() => setAck(null), []);

  // Portals need the DOM; this component also renders on the server via /talk-to-experts.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        if (!token) return;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/student/profile`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({
            ...prev,
            fullName: data.name || (data.firstName ? `${data.firstName} ${data.lastName || ''}`.trim() : prev.fullName),
            email: data.email || prev.email,
            phoneNumber: data.phone || prev.phoneNumber,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch profile for pre-filling form", err);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('studentToken') || ''}`,
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phoneNumber,
          courseOfInterest: formData.programOfInterest,
          source: source,
          message: formData.message || initialMessage,
          preferredTime: formData.preferredTime,
        }),
      });
      if (response.ok) {
        setAck({
          name: formData.fullName,
          email: formData.email,
          program: formData.programOfInterest,
          preferredTime: formData.preferredTime,
        });
        setFormData({ fullName: "", email: "", phoneNumber: "", programOfInterest: "", preferredTime: "", message: "" });
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to send request. Please try again later.");
      }
    } catch (err) {
      console.error("Lead submission error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: "100%",
      maxWidth: "500px",
      flexShrink: 0,
      borderRadius: "16px",
      border: isHomePage ? "1px solid #E5E7EB" : "1px solid #E5E7EB",
      backgroundColor: "#FFFFFF",
      padding: "33px",
      position: "relative",
      boxShadow: "0px 8px 10px -6px rgba(0,0,0,0.10), 0px 20px 25px -5px rgba(0,0,0,0.10)",
      margin: isHomePage ? "0 auto lg:margin-0" : "0",
    }}>
      {(!isHomePage && !hideHeader) && <h3 style={{ fontFamily: "Inter", fontSize: "22px", fontWeight: 700, color: "#101828", marginBottom: "20px" }}>Get In Touch</h3>}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Full Name */}
        <div>
          <label style={labelStyle}>Full Name <span style={{ color: "#EF4444" }}>*</span></label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            style={inputStyle}
            required
          />
        </div>

        {/* Email */}
        <div>
          <label style={labelStyle}>Email Address <span style={{ color: "#EF4444" }}>*</span></label>
          <div style={{ position: "relative" }}>
            {!isHomePage && <Mail size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />}
            <input
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{ ...inputStyle, paddingLeft: !isHomePage ? "34px" : "16px" }}
              required
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label style={labelStyle}>Phone Number <span style={{ color: "#EF4444" }}>*</span></label>
          <div style={{ position: "relative" }}>
            <Phone size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", pointerEvents: "none" }} />
            <input
              type="tel"
              inputMode="numeric"
              placeholder="98765 43210"
              value={formData.phoneNumber}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                setFormData({ ...formData, phoneNumber: digits });
              }}
              style={{ ...inputStyle, paddingLeft: "42px" }}
              required
              minLength={10}
              maxLength={10}
              pattern="\d{10}"
              title="Phone number must be exactly 10 digits"
            />
          </div>
        </div>

        {/* Program of Interest */}
        <CustomSelect
          id="program"
          label="Program of Interest"
          placeholder="Select Program"
          value={formData.programOfInterest}
          options={courseOptions}
          onChange={(val) => setFormData({ ...formData, programOfInterest: val })}
          required
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Preferred Time to Call */}
        <CustomSelect
          id="time"
          label="Preferred Time to Call"
          placeholder="Select time slot"
          value={formData.preferredTime}
          options={["9 AM – 11 AM", "11 AM – 1 PM", "2 PM – 4 PM", "4 PM – 6 PM", "6 PM – 8 PM"]}
          onChange={(val) => setFormData({ ...formData, preferredTime: val })}
          icon={Clock}
          activeDropdown={activeDropdown}
          setActiveDropdown={setActiveDropdown}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Message */}
        <div>
          <label style={labelStyle}>Your Message (Optional)</label>
          <textarea
            placeholder="Tell us about your career goals..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={3}
            style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }}
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="hover:opacity-90 hover:scale-[1.01] transition-all duration-200"
          style={{
            width: "100%",
            height: "52px",
            borderRadius: "10px",
            backgroundColor: "#9810FA",
            color: "#FFFFFF",
            fontFamily: "Inter",
            fontSize: "16px",
            fontWeight: 600,
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginTop: "4px",
            boxShadow: "0px 4px 6px -4px rgba(173,70,255,0.30), 0px 10px 15px -3px rgba(173,70,255,0.30)",
          }}
        >
          {loading ? "Sending…" : (
            <>
              Send
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </button>

        {/* No Spam Calls badge */}
        <div style={{
          height: "32px",
          borderRadius: "8px",
          background: "linear-gradient(90deg, rgba(4, 120, 87, 0.75) 0%, rgba(5, 150, 105, 0.75) 55%, rgba(6, 95, 70, 0.75) 100%)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          boxShadow: "0 4px 16px rgba(4, 120, 87, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px"
        }}>
          <Shield size={14} color="#FFFFFF" />
          <span style={{ fontFamily: "Inter", fontSize: "13px", fontWeight: 500, color: "#FFFFFF", textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}>No Spam Calls</span>
        </div>

        {/* Terms text */}
        <p style={{ fontFamily: "Inter", fontSize: "12px", lineHeight: "19.5px", color: "#6A7282", textAlign: "center", width: "100%", maxWidth: "398px", margin: "0 auto", paddingBottom: "20px" }}>
          By submitting, you agree to our{" "}
          <a href="#" style={{ color: "#9810FA", textDecoration: "underline" }}>Terms & Conditions</a>
          {" "}and{" "}
          <a href="#" style={{ color: "#9810FA", textDecoration: "underline" }}>Privacy Policy</a>
        </p>
      </form>

      {mounted && createPortal(
        <AnimatePresence>
          {ack && <SubmissionAcknowledgement key="ack" details={ack} onClose={closeAck} />}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
