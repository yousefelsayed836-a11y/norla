"use client";

import { useState } from "react";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match.");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/auth/change-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to change password.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl bg-white rounded-2xl p-8 shadow-sm space-y-4"
    >
      <div>
        <h2 className="font-medium">Change Password</h2>
        <p className="text-xs text-foreground/50 mt-1">
          Use a long, unique password — at least 8 characters.
        </p>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Current Password</label>
        <input
          type="password"
          required
          autoComplete="current-password"
          className="w-full border border-brand-light rounded-xl px-4 py-2.5"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">New Password</label>
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full border border-brand-light rounded-xl px-4 py-2.5"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Confirm New Password</label>
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full border border-brand-light rounded-xl px-4 py-2.5"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        disabled={saving}
        className="bg-brand-dark text-white px-6 py-2.5 rounded-full font-medium disabled:opacity-50"
      >
        {saving ? "Saving..." : success ? "Password changed ✓" : "Change Password"}
      </button>
    </form>
  );
}
