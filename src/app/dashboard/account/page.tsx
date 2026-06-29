import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { accounts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { formatDateTime } from "@/lib/format";
import { ChangePasswordForm } from "./change-password-form";

export default async function AccountPage() {
  const session = await requireUser();
  const account = await db.query.accounts.findFirst({ where: eq(accounts.id, session.sub) });

  if (!account) {
    return (
      <div className="container container--x-narrow">
        <h2 className="h2 mb-6">Account</h2>
        <p className="text-muted text-sm">Account not found.</p>
      </div>
    );
  }

  return (
    <div className="container container--x-narrow">
      <h2 className="h2 mb-6">Account Settings</h2>

      <div className="card card--pad stack mb-6">
        <h3 className="h5">Profile</h3>
        <div className="form-row">
          <label>Name</label>
          <p className="mono-sm" style={{ color: "var(--text)" }}>{account.name}</p>
        </div>
        <div className="form-row">
          <label>Email</label>
          <p className="mono-sm" style={{ color: "var(--text)" }}>{account.email}</p>
        </div>
        <div className="form-row">
          <label>Role</label>
          <span className="status status--success">{account.role}</span>
        </div>
        <div className="form-row">
          <label>Created</label>
          <p className="text-sm text-muted">{formatDateTime(account.createdAt)}</p>
        </div>
      </div>

      <ChangePasswordForm />
    </div>
  );
}
