'use client';

import { useState, useEffect } from "react";
import { Phone, Mail, Clock, ChevronDown, Shield } from "lucide-react";
import toast from "react-hot-toast";

interface TalkToExpertsFormProps {
  source: string;
  initialMessage?: string;
  programs?: string[];
  isHomePage?: boolean;
  hideHeader?: boolean;
}

export default function TalkToExpertsForm({
  source,
  initialMessage = "Talk to Experts Request",
  programs = ["MBA & Management Programs", "Tech & Data Science", "International Programs"],
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

  const CustomSelect = ({
    label,
    value,
    options,
    onChange,
    placeholder,
    required = false,
    id,
    icon: Icon
  }: {
    label: string,
    value: string,
    options: string[],
    onChange: (val: string) => void,
    placeholder: string,
    required?: boolean,
    id: string,
    icon?: any
  }) => {
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
            <div style={{ overflowY: "auto", flex: 1 }}>
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
  };

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
        toast.success("Request sent successfully! Our experts will contact you soon.");
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
              placeholder="98765 43210"
              value={formData.phoneNumber}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                setFormData({ ...formData, phoneNumber: digits });
              }}
              style={{ ...inputStyle, paddingLeft: "42px" }}
              required
              maxLength={10}
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
    </div>
  );
}
