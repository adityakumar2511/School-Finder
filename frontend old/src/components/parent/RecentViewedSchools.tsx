"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { readRecentSchools, type RecentSchoolEntry } from "@/lib/parent/recent-schools";

export default function RecentViewedSchools() {
  const [schools, setSchools] = useState<RecentSchoolEntry[]>([]);

  useEffect(() => {
    setSchools(readRecentSchools());
  }, []);

  if (schools.length === 0) {
    return (
      <Card className="border-gray-100 shadow-card rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-lg text-blue-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Recently viewed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-body text-body text-gray-500">
            Schools you browse will appear here for quick access.
          </p>
          <Link
            href="/schools"
            className="inline-flex items-center gap-1 mt-3 font-heading font-semibold text-sm text-blue-600 hover:text-blue-800"
          >
            Browse schools
            <ArrowRight className="w-4 h-4" />
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-100 shadow-card rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-lg text-blue-800 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Recently viewed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {schools.map((school) => (
          <Link
            key={school.slug}
            href={`/schools/${school.slug}`}
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center overflow-hidden shrink-0">
              {school.logoUrl ? (
                <Image
                  src={school.logoUrl}
                  alt=""
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="font-heading font-bold text-blue-600 text-lg">
                  {school.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-heading font-semibold text-sm text-gray-800 truncate">
                {school.name}
              </p>
              <p className="font-body text-meta text-gray-500">{school.city}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
