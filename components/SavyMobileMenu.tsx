"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { pitchHref } from "@/lib/pitchMode";

const CRIMSON = "#DC143C";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/log-food", label: "Nutrition" },
  { href: "/workouts", label: "Workouts" },
  { href: "/hydration", label: "Hydration" },
  { href: "/sleep", label: "Sleep" },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSignOut: () => void | Promise<void>;
};

export function SavyMobileMenu({ isOpen, onClose, user, onSignOut }: Props) {
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        style={{
          flex: 1,
          border: "none",
          margin: 0,
          padding: 0,
          background: "rgba(0,0,0,0.55)",
          cursor: "pointer",
        }}
      />
      <nav
        style={{
          background: "#0A0A0A",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: "28px 24px calc(24px + env(safe-area-inset-bottom, 0px))",
          maxHeight: "85vh",
          overflow: "auto",
          boxShadow: "0 -12px 40px rgba(0,0,0,0.45)",
        }}
      >
        <div
          style={{
            width: 48,
            height: 4,
            borderRadius: 2,
            background: "rgba(255,255,255,0.2)",
            margin: "0 auto 24px",
          }}
        />
        <div
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.06em",
            color: "#F5F0E8",
            marginBottom: 8,
          }}
        >
          SAVY.
        </div>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            color: "rgba(255,255,255,0.45)",
            margin: "0 0 24px",
            letterSpacing: "0.04em",
          }}
        >
          {user?.email ?? "Browse the app"}
        </p>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {NAV_ITEMS.map((item) => {
            const target = pitchHref(item.href);
            const active = isActive(item.href) || isActive(target);
            return (
              <li key={item.href}>
                <Link
                  href={target}
                  onClick={onClose}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    padding: "14px 0",
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    color: active ? CRIMSON : "#FFFFFF",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div
          style={{
            marginTop: "2rem",
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.15rem",
            textTransform: "uppercase",
            marginBottom: "0.75rem",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          My Logs
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {[
            { href: "/sleep", label: "Sleep" },
            { href: "/log-food", label: "Nutrition" },
          ].map((item) => {
            const target = pitchHref(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={target}
                  onClick={onClose}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    padding: "1rem 0",
                    background: "transparent",
                    border: "none",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#FFFFFF",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    letterSpacing: "0.08rem",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
          {user ? (
            <button
              type="button"
              onClick={() => {
                void onSignOut();
                onClose();
              }}
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                border: `1px solid ${CRIMSON}`,
                background: "transparent",
                color: CRIMSON,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Sign out
            </button>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              style={{
                padding: "12px 16px",
                borderRadius: 10,
                border: `1px solid ${CRIMSON}`,
                color: CRIMSON,
                fontWeight: 600,
                textAlign: "center",
                textDecoration: "none",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
