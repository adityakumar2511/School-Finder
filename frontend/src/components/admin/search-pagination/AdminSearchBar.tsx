"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/shared/ui/input";
import { Button } from "@/components/shared/ui/button";
import Link from "next/link";

type Props = {
  placeholder?: string;
  basePath: string;
  currentQuery?: string;
};

export default function AdminSearchBar({
  placeholder = "Search…",
  basePath,
  currentQuery = "",
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(currentQuery);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (q.trim()) params.set("q", q.trim());
    else params.delete("q");
    params.delete("page");
    startTransition(() => {
      const query = params.toString();
      router.push(query ? `${basePath}?${query}` : basePath);
    });
  }

  const hasQuery = Boolean(currentQuery || searchParams.get("q"));

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="sm:max-w-sm"
      />
      <Button type="submit" disabled={pending}>
        Search
      </Button>
      {hasQuery && (
        <Button type="button" variant="outline" asChild>
          <Link href={basePath}>Clear</Link>
        </Button>
      )}
    </form>
  );
}
