import { requireUser } from "@/lib/auth/session";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser().catch(() => null);
  if (!session) redirect("/login");

  const headerList = await headers();
  const pathname = headerList.get("x-next-pathname") ?? headerList.get("x-invoke-path") ?? "/dashboard";

  async function handleLogout() {
    "use server";
    const { destroySession } = await import("@/lib/auth/session");
    await destroySession();
    redirect("/login");
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", exact: true },
    { href: "/kyc", label: "KYC" },
    { href: "/rules", label: "Rules" },
    { href: "/keys", label: "Keys" },
    { href: "/dashboard/audit", label: "Audit" },
    { href: "/docs", label: "Docs" },
    { href: "/dashboard/account", label: "Account" },
  ];

  return (
    <div className="page">
      <header className="header">
        <div className="header__inner">
          <Link href="/dashboard" className="wordmark">passify</Link>
          <div className="row" style={{ gap: "16px" }}>
            <nav className="row" style={{ gap: "4px" }}>
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`btn btn--link btn--sm${isActive ? " nav-active" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <span className="mono text-muted">{session.email}</span>
            <form action={handleLogout}>
              <button type="submit" className="btn btn--ghost btn--sm">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <main id="main-content">{children}</main>
    </div>
  );
}
