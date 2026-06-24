import type {
  Control,
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
} from "react-hook-form";
import type { SchoolProfileFormData } from "../SchoolProfileForm";

export interface SectionProps {
  control: Control<SchoolProfileFormData>;
  register: UseFormRegister<SchoolProfileFormData>;
  errors: FieldErrors<SchoolProfileFormData>;
  watch: UseFormWatch<SchoolProfileFormData>;
  setValue: UseFormSetValue<SchoolProfileFormData>;
  isLoading?: boolean;
}

export interface CustomField {
  label: string;
  value: string;
  fieldType: "text" | "number" | "date" | "url" | "richtext";
}

// Used by SchoolProfileSidebar
export interface SidebarSection {
  index: number;
  label: string;
}
