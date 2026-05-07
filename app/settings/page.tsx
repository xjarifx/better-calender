"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCalendar } from "@/lib/calendar-context";
import { api } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoading } from "@/components/ui/loading";

function updateTokenCookie(token: string) {
  document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
}

export default function SettingsPage() {
  const { isAuthenticated, isLoading, hasApiKey, refreshAuth, logout } =
    useAuth();
  const { setFirstDayOfWeek: setContextFirstDayOfWeek } = useCalendar();
  const router = useRouter();

  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const [timeFormat, setTimeFormat] = useState("12h");
  const [firstDayOfWeek, setFirstDayOfWeek] = useState(0);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const [newUsername, setNewUsername] = useState("");
  const [usernamePassword, setUsernamePassword] = useState("");
  const [usernameSaving, setUsernameSaving] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    loadProfile();
    loadModels();
  }, [isAuthenticated, isLoading, router]);

  const loadModels = async () => {
    try {
      const data = await api.getFreeModels();
      if (Array.isArray(data)) setModels(data);
      const saved = localStorage.getItem("preferred-model");
      if (saved) setSelectedModel(saved);
      else if (data && data[0]) setSelectedModel(data[0]);
    } catch (err) {
      // ignore model fetch errors
    }
  };

  const loadProfile = async () => {
    try {
      const data = await api.getUserProfile();
      if (data.hasApiKey) {
        setApiKey("••••••••••••••••••••••••••••••");
      }
      if (data.timeFormat) setTimeFormat(data.timeFormat);
      if (data.firstDayOfWeek !== undefined)
        setFirstDayOfWeek(data.firstDayOfWeek);
    } catch (err) {
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = async () => {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      if (apiKey === "••••••••••••••••••••••••••••••") {
        setError("API key already saved");
        setSaving(false);
        return;
      }
      await api.updateApiKey(apiKey || null);
      setSuccess("API key saved successfully!");
      setApiKey("••••••••••••••••••••••••••••••");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save API key");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveApiKey = async () => {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await api.updateApiKey(null);
      setApiKey("");
      setSuccess("API key removed. Using default key.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove API key");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await api.updateProfile({ timeFormat, firstDayOfWeek });
      setContextFirstDayOfWeek(firstDayOfWeek);
      setSuccess("Preferences saved!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save preferences",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleModelChange = (m: string) => {
    setSelectedModel(m);
    try {
      localStorage.setItem("preferred-model", m);
    } catch {}
    setSuccess("Model selected");
    setTimeout(() => setSuccess(""), 1500);
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    )
      return;
    try {
      const res = await fetch("/api/auth/delete", { method: "DELETE" });
      if (res.ok) {
        // call logout to clear client state
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch {}
        router.push("/login");
      } else {
        const text = await res.text();
        setError("Account deletion failed: " + (text || res.statusText));
      }
    } catch (err) {
      setError("Account deletion failed");
    }
  };

  const handleChangeUsername = async () => {
    setError("");
    setSuccess("");
    setUsernameSaving(true);
    try {
      if (!newUsername.trim()) throw new Error("Username cannot be empty");
      if (!usernamePassword) throw new Error("Current password required");
      await api.updateUsername(newUsername.trim(), usernamePassword);
      setSuccess("Username updated!");
      setNewUsername("");
      setUsernamePassword("");
      refreshAuth();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update username",
      );
    } finally {
      setUsernameSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");
    setPasswordSaving(true);
    try {
      if (!oldPassword) throw new Error("Current password required");
      if (!newPassword) throw new Error("New password required");
      if (newPassword !== confirmPassword)
        throw new Error("Passwords do not match");
      if (newPassword.length < 6)
        throw new Error("Password must be at least 6 characters");
      const result = await api.updatePassword(oldPassword, newPassword);
      if (result.token) {
        updateTokenCookie(result.token);
      }
      setSuccess(
        "Password updated! You may need to log in again on other devices.",
      );
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update password",
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PageLoading text="Loading settings..." />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 px-4 py-3 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.push("/calendar")}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Calendar
          </button>
          <h1 className="text-2xl font-semibold">Settings</h1>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}
        {models.length > 0 && (
          <div>
            <label className="text-sm font-medium block mb-1.5">Model</label>
            <select
              value={selectedModel || ""}
              onChange={(e) => handleModelChange(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            >
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 text-green-600 p-3 rounded-lg text-sm mb-4">
            {success}
          </div>
        )}

        <div className="space-y-6">
          {/* API Key */}
          <div className="rounded-lg border p-6 space-y-4">
            <h2 className="text-lg font-semibold">OpenRouter API Key</h2>
            <p className="text-sm text-muted-foreground">
              By default, the app uses a shared API key. You can add your own to
              avoid rate limits. Get your key at{" "}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                openrouter.ai/keys
              </a>
            </p>
            <div>
              <label className="text-sm font-medium block mb-1.5">
                API Key
              </label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="font-mono rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSaveApiKey}
                disabled={saving}
                className="rounded-lg"
              >
                {saving ? "Saving..." : "Save API Key"}
              </Button>
              {hasApiKey && (
                <Button
                  variant="outline"
                  onClick={handleRemoveApiKey}
                  disabled={saving}
                  className="rounded-lg"
                >
                  Remove Key
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              <strong>Status:</strong>{" "}
              {hasApiKey ? (
                <span className="text-green-600">
                  Using your personal API key
                </span>
              ) : (
                <span>Using default shared key</span>
              )}
            </p>
          </div>

          {/* Time Format & First Day of Week */}
          <div className="rounded-lg border p-6 space-y-4">
            <h2 className="text-lg font-semibold">Preferences</h2>

            <div>
              <label className="text-sm font-medium block mb-2">
                Time Format
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="timeFormat"
                    value="12h"
                    checked={timeFormat === "12h"}
                    onChange={() => setTimeFormat("12h")}
                  />
                  12-hour (AM/PM)
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="timeFormat"
                    value="24h"
                    checked={timeFormat === "24h"}
                    onChange={() => setTimeFormat("24h")}
                  />
                  24-hour
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">
                First Day of Week
              </label>
              <select
                value={firstDayOfWeek}
                onChange={(e) => setFirstDayOfWeek(Number(e.target.value))}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value={0}>Sunday</option>
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
              </select>
            </div>

            <Button
              onClick={handleSavePreferences}
              disabled={saving}
              className="rounded-lg"
            >
              {saving ? "Saving..." : "Save Preferences"}
            </Button>
          </div>

          {/* Change Username */}
          <div className="rounded-lg border p-6 space-y-4">
            <h2 className="text-lg font-semibold">Change Username</h2>
            <p className="text-sm text-muted-foreground">
              Enter a new username and confirm with your current password.
            </p>
            <div>
              <label className="text-sm font-medium block mb-1.5">
                New Username
              </label>
              <Input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="New username"
                className="rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Current Password
              </label>
              <Input
                type="password"
                value={usernamePassword}
                onChange={(e) => setUsernamePassword(e.target.value)}
                placeholder="Enter current password"
                className="rounded-lg"
              />
            </div>
            <Button
              onClick={handleChangeUsername}
              disabled={usernameSaving}
              className="rounded-lg"
            >
              {usernameSaving ? "Saving..." : "Update Username"}
            </Button>
          </div>

          {/* Change Password */}
          <div className="rounded-lg border p-6 space-y-4">
            <h2 className="text-lg font-semibold">Change Password</h2>
            <p className="text-sm text-muted-foreground">
              Changing your password will log you out from other devices.
            </p>
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Current Password
              </label>
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                className="rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">
                New Password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 chars)"
                className="rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Confirm New Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="rounded-lg"
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={passwordSaving}
              className="rounded-lg"
            >
              {passwordSaving ? "Saving..." : "Update Password"}
            </Button>
          </div>

          {/* Account Actions */}
          <div className="rounded-lg border p-6 space-y-4">
            <h2 className="text-lg font-semibold">Account</h2>
            <p className="text-sm text-muted-foreground">
              Logout or delete your account.
            </p>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={handleDeleteAccount}>
                Delete Account
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  try {
                    logout();
                  } catch {}
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
