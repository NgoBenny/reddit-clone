"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";
import type { FeedQuery } from "../lib/feed";

export function FeedFilters({
  query,
  home = false,
}: {
  query: FeedQuery;
  home?: boolean;
}) {
  const pathname = usePathname();
  const [sort, setSort] = useState(query.sort === "top" ? "top" : "new");
  const search = typeof query.q === "string" ? query.q : "";
  function feedHref(feed: string) {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (query.sort === "top") params.set("sort", "top");
    if (query.sort === "top" && ["day", "week"].includes(query.time || ""))
      params.set("time", query.time!);
    params.set("feed", feed);
    return `/?${params}`;
  }
  return (
    <div className="space-y-3">
      {home && (
        <nav aria-label="Feed" className="flex gap-6 border-b">
          <Link
            href={feedHref("home")}
            className="feed-tab"
            aria-current={query.feed === "home" ? "page" : undefined}
          >
            Your feed
          </Link>
          <Link
            href={feedHref("all")}
            className="feed-tab"
            aria-current={query.feed !== "home" ? "page" : undefined}
          >
            Explore
          </Link>
        </nav>
      )}
      <form className="flex flex-wrap items-center gap-2">
        {home && (
          <input
            type="hidden"
            name="feed"
            value={query.feed === "home" ? "home" : "all"}
          />
        )}
        <label className="flex min-w-[150px] flex-1 items-center gap-2 rounded-xl border bg-card px-3">
          <Search
            className="h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="sr-only">Search posts</span>
          <input
            name="q"
            type="search"
            defaultValue={search}
            maxLength={100}
            placeholder={home ? "Search this feed" : "Search these posts"}
            className="h-11 min-w-0 w-full bg-transparent text-sm"
          />
        </label>
        <label>
          <span className="sr-only">Sort</span>
          <select
            name="sort"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="rounded-xl border bg-card px-3 text-sm"
          >
            <option value="new">New</option>
            <option value="top">Top</option>
          </select>
        </label>
        {sort === "top" && (
          <label>
            <span className="sr-only">Time</span>
            <select
              name="time"
              defaultValue={
                ["day", "week"].includes(query.time || "") ? query.time : "all"
              }
              className="rounded-xl border bg-card px-3 text-sm"
            >
              <option value="all">All time</option>
              <option value="day">Past 24 hours</option>
              <option value="week">Past week</option>
            </select>
          </label>
        )}
        <button
          aria-label="Apply filters"
          className="min-h-11 rounded-xl px-3 text-sm font-medium text-primary hover:bg-primary/10"
          type="submit"
        >
          <span className="sm:hidden">Apply</span>
          <span className="hidden sm:inline">Apply filters</span>
        </button>
      </form>
      {(search || query.time === "day" || query.time === "week") && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {search && <span>Results for “{search}”</span>}
          <Link
            href={home && query.feed === "home" ? "/?feed=home" : pathname}
            className="inline-flex min-h-11 items-center gap-1 text-primary"
          >
            <X className="h-3 w-3" />
            Clear filters
          </Link>
        </div>
      )}
    </div>
  );
}
