import type { Metadata } from "next";
import CompareClient from "./CompareClient";
import { fetchSchoolList } from "@/lib/data/schools-public";

export const metadata: Metadata = {
  title: "Compare Schools | SchoolFinder",
  description:
    "Compare schools side by side on fees, board, medium, classes, facilities, and location.",
};

export default async function ComparePage() {
  const { schools } = await fetchSchoolList(
    {
      limit: "100",
    },
    {
      revalidate: 60,
    },
  );

  return <CompareClient schools={schools ?? []} />;
}