import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Building2,
  CheckCircle2,
  GraduationCap,
  MapPin,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

export type StatItem = {
  icon: LucideIcon;
  stat: string;
  label: string;
};

export type IconTextItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const HOME_STATS: StatItem[] = [
  {
    icon: Building2,
    stat: "500+",
    label: "Schools Listed",
  },
  {
    icon: Users,
    stat: "10,000+",
    label: "Parents Helped",
  },
  {
    icon: MapPin,
    stat: "1",
    label: "City Available",
  },
  {
    icon: GraduationCap,
    stat: "₹0",
    label: "Plans Starting From",
  },
];

export const WHY_LAKSHYA_POINTS = [
  "Simple School Search",
  "Organized School Information",
  "Compare Schools Easily",
  "Direct School Inquiries",
  "Save Time During Admissions",
  "Built for Parents and Schools",
];

export const HOW_IT_WORKS_STEPS: IconTextItem[] = [
  {
    icon: Search,
    title: "Search Schools",
    description: "Search schools based on your city and preferences.",
  },
  {
    icon: BookOpen,
    title: "Explore School Profiles",
    description:
      "View school information, facilities, photos, and admission details.",
  },
  {
    icon: CheckCircle2,
    title: "Compare Schools",
    description:
      "Compare multiple schools side by side to make informed decisions.",
  },
  {
    icon: MessageSquareText,
    title: "Send an Inquiry",
    description: "Connect directly with schools through the platform.",
  },
  {
    icon: GraduationCap,
    title: "Begin Your Admission Journey",
    description: "Take the next step with confidence.",
  },
];

export const PLATFORM_HIGHLIGHTS = [
  "Smart School Search",
  "Detailed School Profiles",
  "School Comparison",
  "Direct Inquiry System",
  "Mobile-Friendly Experience",
];

export const PARENT_POINTS = [
  "Discover schools faster",
  "Compare multiple schools",
  "Explore school profiles",
  "Save time during admissions",
  "Contact schools directly",
  "Access information anytime",
];

export const SCHOOL_POINTS = [
  "Create a professional school profile",
  "Reach more parents",
  "Receive admission inquiries",
  "Showcase facilities and achievements",
  "Strengthen their online visibility",
];

export const PARENT_TESTIMONIALS = [
  {
    quote:
      "Lakshya One made our school search much easier. Instead of visiting every school first, we could shortlist the schools that matched our needs.",
    name: "Parent",
  },
  {
    quote:
      "Everything was organized in one place, which saved us a lot of time during admissions.",
    name: "Parent",
  },
];

export const SCHOOL_TESTIMONIALS = [
  {
    quote:
      "Lakshya One gave our school a better online presence and helped more parents discover us.",
    name: "School Administrator",
  },
  {
    quote:
      "It's a simple platform that helps parents learn more about our school before visiting.",
    name: "Principal",
  },
];

export const HOME_FAQS = [
  {
    question: "Is Lakshya One free for parents?",
    answer:
      "Yes. Parents can search and explore schools without paying any listing charges.",
  },
  {
    question: "Can every school join Lakshya One?",
    answer:
      "Recognized schools from different boards and management types can create their presence on the platform.",
  },
  {
    question: "How do parents contact schools?",
    answer:
      "Parents can send inquiries directly through each school's profile.",
  },
  {
    question: "Can I compare schools?",
    answer:
      "Yes. Lakshya One allows parents to compare multiple schools before making a decision.",
  },
  {
    question: "Is school information available for every school?",
    answer:
      "Information may vary depending on what each school has shared. We encourage schools to keep their profiles updated so parents can access the latest available information.",
  },
  {
    question: "Will Lakshya One expand to more cities?",
    answer:
      "Yes. We're starting with Prayagraj and plan to expand to more cities in the future.",
  },
];

export const BLOG_PREVIEW_ITEMS = [
  "How to Choose the Right School",
  "Questions Every Parent Should Ask Before Admission",
  "CBSE vs ICSE vs State Board",
  "School Admission Checklist",
  "Preparing Your Child for the First Day of School",
  "Education News & Updates",
];

export const PLATFORM_CARDS: IconTextItem[] = [
  {
    icon: Search,
    title: "Smart Search",
    description: "Find schools by name, city, board, or locality.",
  },
  {
    icon: ShieldCheck,
    title: "Organized Profiles",
    description: "View school details in a clean and structured format.",
  },
  {
    icon: Sparkles,
    title: "Easy Experience",
    description: "A simple, mobile-friendly platform for parents and schools.",
  },
];