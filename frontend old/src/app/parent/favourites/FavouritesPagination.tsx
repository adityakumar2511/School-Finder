import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  page: number;
  totalPages: number;
};

export default function FavouritesPagination({ page, totalPages }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-10 flex items-center justify-center gap-4">
      <Button
        asChild
        variant="outline"
        size="sm"
        disabled={page <= 1}
        className={page <= 1 ? "pointer-events-none opacity-50" : ""}
      >
        <Link href={`/parent/favourites?page=${page - 1}`}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Link>
      </Button>
      <span className="font-body text-sm text-gray-600">
        Page {page} of {totalPages}
      </span>
      <Button
        asChild
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
      >
        <Link href={`/parent/favourites?page=${page + 1}`}>
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </Button>
    </div>
  );
}
