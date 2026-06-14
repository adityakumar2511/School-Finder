import Link from "next/link";
import { getParentFavourites } from "@/lib/parent/data";
import SchoolCard from "@/components/public/schools/SchoolCard";
import RemoveFavouriteButton from "./RemoveFavouriteButton";
import FavouritesPagination from "./FavouritesPagination";
import { Heart, BookOpen, ArrowRight } from "lucide-react";

const PAGE_SIZE = 6;

type Props = {
  searchParams: { page?: string };
};

export default async function ParentFavouritesPage({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const { schools, total, totalPages } = await getParentFavourites(page, PAGE_SIZE);
  const currentPage = Math.min(page, totalPages);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Heart className="w-5 h-5 text-blue-600" />
          </div>
          <h1 className="font-heading text-h1 font-bold text-blue-800">Saved schools</h1>
        </div>
        <p className="font-body text-body text-gray-500 ml-[52px]">
          {total > 0
            ? `${total} school${total !== 1 ? "s" : ""} saved for your family`
            : "No schools saved yet"}
        </p>
      </div>

      {schools.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map((school) => (
              <div key={school.id} className="relative group">
                <SchoolCard
                  id={school.id}
                  name={school.name}
                  slug={school.slug}
                  city={school.city}
                  state={school.state}
                  board={school.board as "CBSE" | "ICSE" | "UP_BOARD" | "OTHER"}
                  schoolType={school.schoolType as "BOYS" | "GIRLS" | "CO_ED"}
                  medium={school.medium as "HINDI" | "ENGLISH" | "BOTH"}
                  classesFrom={school.classesFrom}
                  classesTo={school.classesTo}
                  tuitionFeeMonthly={school.tuitionFeeMonthly}
                  logoUrl={school.logoUrl}
                  facilitiesCount={school.facilitiesCount}
                />
                <RemoveFavouriteButton schoolId={school.id} schoolName={school.name} />
              </div>
            ))}
          </div>

          <FavouritesPagination page={currentPage} totalPages={totalPages} />

          <div className="mt-10 text-center">
            <p className="font-body text-body text-gray-500 mb-3">Looking for more options?</p>
            <Link
              href="/schools"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-heading font-semibold text-btn px-6 py-3 rounded-xl shadow-btn transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Browse all schools
            </Link>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-5">
            <Heart className="w-9 h-9 text-blue-200" />
          </div>
          <h2 className="font-heading text-h3 font-semibold text-gray-700 mb-2">
            No saved schools yet
          </h2>
          <p className="font-body text-body text-gray-500 max-w-md mb-8">
            Visit a school profile and use the save button to add schools to your list. They will
            appear here for easy comparison.
          </p>
          <Link
            href="/schools"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-heading font-semibold text-btn px-6 py-3 rounded-xl shadow-btn transition-colors"
          >
            Find schools
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </main>
  );
}
