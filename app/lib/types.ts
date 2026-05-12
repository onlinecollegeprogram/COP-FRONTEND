export interface SectionContent {
  _id: string;
  pageSlug: string;
  sectionApiId: string;
  sectionIndex: number;
  itemIndex: number;
  values: Record<string, any>;
}

export interface PageData {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  isPublished: boolean;
  sections: {
    sectionIndex: number;
    title: string;
    apiIdentifier: string;
    description?: string;
    fields: {
      name: string;
      label?: string;
      type: string;
      placeholder?: string;
      options?: string[];
      required?: boolean;
    }[];
  }[];
}

export interface PageResponse {
  page: PageData;
  content: SectionContent[];
}

export interface Provider {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  coverImage?: string;
  coverDescription?: string;
  galleryImages?: string[];
  galleryDescription?: any;
  shortExcerpt?: string;
  contentBlocks?: any[];
  isFeatured?: boolean;
  bestROI?: boolean;
  trending?: boolean;
  publicationStatus?: "draft" | "published";
  averageRating?: number;
  reviewCount?: number;
  ratingBreakdown?: {
    averageRating: number;
    digitalInfrastructure: number;
    curriculum: number;
    valueForMoney: number;
  };
  aboutContent?: any;
  admissionProcess?: any;
  financialAid?: any;
  examinationPattern?: any;
  careerServices?: any;
  additionalContent?: any;
  scholarshipDescription?: any;
  scholarships?: {
    category: string;
    scholarshipCredit: string;
    eligibility: string;
    _id?: string;
  }[];
  approvalsDescription?: any;
  approvals?: {
    name: string;
    logo: string;
    _id?: string;
  }[];
  rankingsDescription?: any;
  rankings?: {
    title: string;
    description: string;
    _id?: string;
  }[];
  factsDescription?: any;
  facts?: {
    icon: string;
    text: any;
    _id?: string;
  }[];
  placementPartnersDescription?: any;
  placementPartners?: {
    name: string;
    logo: string;
    _id?: string;
  }[];
  sampleCertificateDescription?: any;
  sampleCertificateImage?: string;
  admissionOpen?: {
    isOpen: boolean;
    year?: string;
    text: string;
    description?: any;
  };
  admissionOpenDescription?: any;
  campuses?: {
    city: string;
    state: string;
    country: string;
    _id?: string;
  }[];
  isActive?: "active" | "inactive";
  faq?: {
    question: string;
    answer: string;
    _id?: string;
  }[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  whoShouldChoosePoints?: {
    text: string;
    _id?: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
  comparison?: {
    location?: string;
    feesStartingFrom?: number;
    duration?: string;
    intakePeriod?: string;
    timeCommitment?: string;
    totalSeatsAvailable?: number;
    overallRating?: number;
    accreditation?: string;
    placementRate?: number;
    averageSalary?: number;
    eligibility?: string;
    minimumRequirements?: string;
    ugcDebStatus?: boolean;
    naacGrade?: string;
    examType?: string;
    roiScore?: string;
  };
  
  // UI Helpers (Not in DB)
  location?: string;
  highlights?: string[];
}

export interface DegreeType {
  _id: string;
  name: string;
  slug: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  _id: string;
  name: string;
  slug: string;
  degreeTypeId: string | DegreeType;
  approvals?: string[];
  highlights?: {
    title?: string;
    description?: string;
    icon?: string;
    _id?: string;
  }[];
  eligibilityCriteria?: {
    title?: string;
    points?: string[];
    _id?: string;
  }[];
  curriculum?: {
    semester?: string;
    subjects?: string[];
    _id?: string;
  }[];
  careerRoles?: string[];
  careerStats?: {
    salaryGrowth?: { year?: string; value?: number; _id?: string }[];
    placementPercentage?: number;
    highCTC?: string;
    avgCTC?: string;
    hiringPartners?: string;
  };
  faqs?: {
    question?: string;
    answer?: string;
    _id?: string;
  }[];
  contentBlocks?: any[];
  description?: string;
  shortDescription?: string;
  duration?: string;
  feeStarting?: number;
  icon?: string;
  universities?: (string | Provider)[];
  isTrending?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Specialization {
  _id: string;
  name: string;
  slug: string;
  courseId: string | Course;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  providerCount?: number;
}

export interface ProviderCourse {
  _id: string;
  providerId: string | Provider;
  degreeTypeId: string | DegreeType;
  courseId: string | Course;
  specializationId?: string | Specialization;
  title: string;
  slug: string;
  shortDescription?: string;
  thumbnail?: string;
  minFees?: number;
  fees: number;
  discountedFees?: number;
  duration?: string;
  mode?: string;
  eligibility?: string;
  seatsAvailable?: number;
  brochureUrl?: string;
  feesBreakdown?: { label: string; amount: number }[];
  weeklyEffort?: number;
  examPattern?: string;
  employerAcceptance?: "High" | "Medium" | "Low";
  difficultyLevel?: "Beginner" | "Intermediate" | "Advanced";
  bestROI?: boolean;
  trending?: boolean;
  approvals?: string[];
  highlights?: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  _id: string;
  providerId: string;
  studentId: string | any;
  rating: number;
  content: string;
  pros?: string[];
  cons?: string[];
  isActive: boolean;
  createdAt: string;
}

