"use client";

import { useEffect } from "react";
import { saveRecentSchool } from "@/lib/parent/recent-schools";

type Props = {
  slug: string;
  name: string;
  city: string;
  logoUrl: string | null;
};

export default function TrackSchoolView({ slug, name, city, logoUrl }: Props) {
  useEffect(() => {
    saveRecentSchool({ slug, name, city, logoUrl });
  }, [slug, name, city, logoUrl]);

  return null;
}
