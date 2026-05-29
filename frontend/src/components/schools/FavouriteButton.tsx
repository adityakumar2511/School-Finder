"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Bookmark, Loader2 } from "lucide-react";

type Props = {
  schoolId: string;
  initialFavourited: boolean;
};

type ApiErrorBody = {
  message?: string;
};

function getParentToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("sf_parent_token");
}

function clearParentToken(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("sf_parent_token");
}

export default function FavouriteButton({ schoolId, initialFavourited }: Props) {
  const { data: session, status } = useSession();
  const [favourited, setFavourited] = useState(initialFavourited);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

  if (status === "authenticated") {
    const role = session?.user?.role;
    if (role === "SCHOOL_ADMIN" || role === "ADMIN") {
      return null;
    }
  }

  function showMessage(text: string, type: "success" | "error" | "info") {
    setMessage(text);
    setMessageType(type);
    window.setTimeout(() => setMessage(null), 3000);
  }

  async function handleToggle() {
    setMessage(null);

    if (status === "loading") {
      return;
    }

    if (!session?.user) {
      showMessage("Please log in to save schools", "info");
      return;
    }

    if (session.user.role !== "PARENT") {
      return;
    }

    setLoading(true);

    try {
      const token = getParentToken();
      if (!token) {
        showMessage(
          "Please sign out and sign in again to refresh your session.",
          "error"
        );
        return;
      }

      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
      const isRemoving = favourited;

      const response = await fetch(
        isRemoving
          ? `${apiBase}/api/favourites?schoolId=${encodeURIComponent(schoolId)}`
          : `${apiBase}/api/favourites`,
        {
          method: isRemoving ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: isRemoving ? undefined : JSON.stringify({ schoolId }),
        }
      );

      if (response.status === 401) {
        clearParentToken();
        showMessage("Session expired. Please sign out and sign in again.", "error");
        return;
      }

      const body = (await response.json().catch(() => ({}))) as ApiErrorBody;

      if (!response.ok) {
        showMessage(
          typeof body.message === "string"
            ? body.message
            : "Failed to update saved schools. Please try again.",
          "error"
        );
        return;
      }

      setFavourited(!isRemoving);
      showMessage(
        isRemoving ? "Removed from saved schools" : "School saved successfully",
        "success"
      );
    } catch {
      showMessage("Unable to reach the server. Please try again later.", "error");
    } finally {
      setLoading(false);
    }
  }

  const messageClassName =
    messageType === "success"
      ? "text-success-text"
      : messageType === "error"
        ? "text-danger-text"
        : "text-gray-600";

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading || status === "loading"}
        aria-pressed={favourited}
        aria-label={favourited ? "Remove from saved schools" : "Save school"}
        className="btn-secondary h-10 w-10 p-0 text-blue-600 hover:text-blue-800"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Bookmark
            className={`h-4 w-4 ${favourited ? "fill-current" : ""}`}
          />
        )}
      </button>
      {message && (
        <p className={`font-body text-meta max-w-[220px] ${messageClassName}`}>
          {message}
        </p>
      )}
    </div>
  );
}
