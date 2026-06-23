export type Role = "PARENT" | "SCHOOL_ADMIN" | "ADMIN";

export type AdminAccessLevel = "READ_ONLY" | "READ_WRITE" | "FULL_ACCESS";

export type InquiryStatus =
  | "NEW"
  | "CONTACTED"
  | "INTERESTED"
  | "CONVERTED"
  | "CLOSED";

export type BoardType = "CBSE" | "ICSE" | "UP_BOARD" | "OTHER";

export type SchoolType = "BOYS" | "GIRLS" | "CO_ED";

export type MediumType = "HINDI" | "ENGLISH" | "BOTH";

export type SchoolStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";

export type GeoCoordinates = {
  latitude: number | null;
  longitude: number | null;
};