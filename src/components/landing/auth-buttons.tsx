"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function AuthButton({ className }: { className?: string }) {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // Check session via a lightweight endpoint
    fetch("/api/health", { method: "GET" }).then(() => {
      // If the session cookie exists, the user is likely logged in
      // We check for the cookie name presence (httpOnly cookies aren't readable, but session presence is inferred)
      setLoggedIn(document.cookie.includes("passify_session") || document.cookie.includes("__Secure-passify_session"));
    }).catch(() => {});
  }, []);

  if (loggedIn) {
    return <Link href="/dashboard" className={className ?? "btn btn--primary btn--sm"}>Dashboard</Link>;
  }
  return <Link href="/login" className={className ?? "btn btn--primary btn--sm"}>Sign in</Link>;
}

export function HeroAuthButton() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    setLoggedIn(document.cookie.includes("passify_session") || document.cookie.includes("__Secure-passify_session"));
  }, []);

  if (loggedIn) {
    return <Link href="/dashboard" className="btn btn--primary btn--lg">Go to dashboard</Link>;
  }
  return <Link href="/login" className="btn btn--primary btn--lg">Get started free</Link>;
}

export function CtaAuthButton() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    setLoggedIn(document.cookie.includes("passify_session") || document.cookie.includes("__Secure-passify_session"));
  }, []);

  if (loggedIn) {
    return <Link href="/dashboard" className="btn btn--white btn--lg">Go to dashboard</Link>;
  }
  return <Link href="/login" className="btn btn--white btn--lg">Start building</Link>;
}
