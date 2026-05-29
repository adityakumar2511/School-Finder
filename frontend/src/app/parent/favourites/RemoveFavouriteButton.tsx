"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";

type Props = {
  schoolId: string;
  schoolName: string;
};

export default function RemoveFavouriteButton({ schoolId, schoolName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRemove() {
    if (!confirm(`Remove "${schoolName}" from your saved schools?`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/parent/favourites?schoolId=${encodeURIComponent(schoolId)}`, {
        method: "DELETE",
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body.message ?? "Failed to remove favourite");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="absolute top-3 right-3 z-10">
      <button
        type="button"
        onClick={handleRemove}
        disabled={loading}
        title="Remove from saved schools"
        aria-label={`Remove ${schoolName} from favourites`}
        className="w-9 h-9 rounded-full bg-white shadow-card border border-gray-100 flex items-center justify-center hover:bg-danger-bg hover:border-red-200 transition-all disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
        ) : (
          <Heart className="w-4 h-4 text-blue-400 fill-blue-400 hover:text-danger-text hover:fill-danger-text transition-colors" />
        )}
      </button>
      {error && (
        <p className="absolute top-10 right-0 bg-danger-bg text-danger-text text-xs px-2 py-1 rounded shadow whitespace-nowrap max-w-[200px]">
          {error}
        </p>
      )}
    </div>
  );
}
