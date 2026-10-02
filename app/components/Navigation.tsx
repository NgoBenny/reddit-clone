"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Bell, Bookmark, Compass, Home, Plus, Users } from "lucide-react";

export function Navigation({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const items = [
    {
      href: "/?feed=home",
      label: "Your feed",
      icon: Home,
      active: pathname === "/" && params.get("feed") === "home",
    },
    {
      href: "/",
      label: "Explore",
      icon: Compass,
      active: pathname === "/" && params.get("feed") !== "home",
    },
    {
      href: "/communities",
      label: "Communities",
      icon: Users,
      active: pathname === "/communities" && !params.has("compose"),
    },
    {
      href: "/saved",
      label: "Saved",
      icon: Bookmark,
      active: pathname === "/saved",
    },
    {
      href: "/notifications",
      label: "Notifications",
      icon: Bell,
      active: pathname === "/notifications",
    },
  ];
  const mobileItems = [
    items[0],
    items[1],
    {
      href: "/communities?compose=1",
      label: "Post",
      icon: Plus,
      active: pathname.endsWith("/create") || params.has("compose"),
    },
    items[3],
    items[4],
  ];
  return (
    <nav
      aria-label={mobile ? "Mobile navigation" : "Main navigation"}
      className={mobile ? "grid grid-cols-5" : "space-y-1"}
    >
      {(mobile ? mobileItems : items).map(
        ({ href, label, icon: Icon, active }) => (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={
              mobile
                ? "nav-item flex-col justify-center gap-1 px-1 py-2 text-[10px]"
                : "nav-item"
            }
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ),
      )}
    </nav>
  );
}
