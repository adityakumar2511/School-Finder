import Link from "next/link";
import {
  Heart,
  User,
  BookOpen,
  ArrowRight,
  Search,
  MessageSquare,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { getParentDashboardData } from "@/lib/parent/data";
import RecentViewedSchools from "@/components/parent/RecentViewedSchools";
import SchoolCard from "@/components/SchoolCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function ParentDashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const { user, favouritesCount, recentSaved } = await getParentDashboardData(userId);
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-h1 font-bold text-blue-800">
          Welcome back, {firstName}
        </h1>
        <p className="font-body text-body text-gray-500 mt-1">
          Manage your saved schools and continue your search for the right fit.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-gray-100 shadow-card rounded-2xl bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="font-heading text-sm font-semibold text-gray-500 flex items-center gap-2">
              <Heart className="w-4 h-4 text-blue-600" />
              Saved schools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-3xl font-bold text-blue-800">{favouritesCount}</p>
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-card rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white sm:col-span-2 lg:col-span-3">
          <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-heading font-semibold text-lg">Quick actions</p>
              <p className="font-body text-sm text-blue-100 mt-1">
                Browse listings, review favourites, or update your profile.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" className="bg-white text-blue-800 hover:bg-blue-50">
                <Link href="/schools">
                  <Search className="w-4 h-4 mr-1" />
                  Browse schools
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10"
              >
                <Link href="/parent/favourites">
                  <Heart className="w-4 h-4 mr-1" />
                  Favourites
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10"
              >
                <Link href="/parent/profile">
                  <User className="w-4 h-4 mr-1" />
                  Profile
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-100 shadow-card rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-heading text-lg text-blue-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Recently saved
            </CardTitle>
            {favouritesCount > 0 && (
              <Link
                href="/parent/favourites"
                className="font-heading text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {recentSaved.length === 0 ? (
              <p className="font-body text-body text-gray-500">
                You have not saved any schools yet. Open a school profile and tap the heart icon
                to save it here.
              </p>
            ) : (
              <div className="space-y-4">
                {recentSaved.map((school) => (
                  <SchoolCard
                    key={school.id}
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <RecentViewedSchools />
      </div>

      <Card className="mt-6 border-gray-100 shadow-card rounded-2xl bg-amber-50 border-amber-100">
        <CardContent className="pt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <MessageSquare className="w-8 h-8 text-amber-700 shrink-0" />
          <div className="flex-1">
            <p className="font-heading font-semibold text-amber-900">Need help choosing?</p>
            <p className="font-body text-sm text-amber-800/80 mt-1">
              Compare fees, boards, and facilities across schools in your city.
            </p>
          </div>
          <Button asChild className="bg-amber-500 hover:bg-amber-600 text-amber-950 shrink-0">
            <Link href="/schools">Explore schools</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
