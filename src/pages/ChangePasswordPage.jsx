// src/pages/ChangePasswordPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppBottomNav from "../components/AppBottomNav";
import { authAPI } from "../services/authAPI";
import { tokenService } from "../services/tokenService";
import { useTheme } from "../context/ThemeContext";
import { showError, showSuccess } from "../utils/toastUtils";

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirmNew, setShowConfirmNew] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const validate = () => {
    if (!currentPassword) {
      setError("Current password is required");
      return false;
    }
    if (!newPassword) {
      setError("New password is required");
      return false;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return false;
    }
    if (
      !(
        /[A-Z]/.test(newPassword) &&
        /[a-z]/.test(newPassword) &&
        /[0-9]/.test(newPassword) &&
        /[^A-Za-z0-9]/.test(newPassword)
      )
    ) {
      setError("New password must include upper, lower, number and special character");
      return false;
    }
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match");
      return false;
    }
    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    setError("");
    setSuccessMessage("");
    if (!validate()) return;
    if (!tokenService.isAuthenticated()) {
      navigate("/login");
      return;
    }

    setIsSaving(true);
    try {
      const response = await authAPI.changePassword(
        currentPassword,
        newPassword,
        confirmNewPassword
      );
      const message = response.data?.message || "Password changed successfully!";
      setSuccessMessage(message);
      showSuccess(message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      setError(showError(err, "Failed to change password. Please try again."));
    } finally {
      setIsSaving(false);
    }
  };

  const containerBg = darkMode ? "#1E3A45" : "#E0E6E7";
  const headerBg = darkMode ? "#274956" : "#A8B7C0";
  const textMain = darkMode ? "#E4EDF2" : "#265D6F";
  const textSub = darkMode ? "#C2D3DB" : "#6E828D";
  const inputBorder = darkMode ? "#3B6A78" : "#C4CFD4";

  const eyeIcon = (show) =>
    show ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-5 0-9.27-3.11-11-8 0-1.07.22-2.09.63-3.02" />
        <path d="M6.06 6.06A10.07 10.07 0 0112 4c5 0 9.27 3.11 11 8-.27.8-.62 1.55-1.05 2.26" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );

  return (
    <div
      className="flex h-dvh min-h-dvh w-full items-start justify-center sm:px-4"
      style={{ backgroundColor: containerBg }}
    >
      <div
        className="relative flex h-dvh min-h-dvh w-full flex-col sm:h-dvh sm:min-h-dvh sm:max-h-dvh sm:max-w-[430px] sm:rounded-[32px] sm:shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
        style={{ backgroundColor: containerBg }}
      >
        {/* top app bar */}
        <div
          className="flex items-center justify-center rounded-t-[32px] px-4 py-3"
          style={{ backgroundColor: headerBg }}
        >
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="absolute left-4 text-2xl text-[#265D6F]"
            disabled={isSaving}
          >
            ←
          </button>
          <h1 className="text-lg font-semibold text-white">Change Password</h1>
        </div>

        {/* content */}
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4">
          {successMessage && (
            <div className="mb-4 rounded-md border border-green-400 bg-green-100 px-3 py-2">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-md border border-red-400 bg-red-100 px-3 py-2">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="mt-4 space-y-5">
            <div>
              <label className="block text-sm font-semibold" style={{ color: textSub }}>
                Current Password
              </label>
              <div
                className="mt-2 flex w-full items-center rounded-lg border bg-white px-3 py-2"
                style={{ borderColor: inputBorder }}
              >
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none disabled:opacity-50"
                  style={{ color: textMain }}
                  placeholder="Enter current password"
                  disabled={isSaving}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="ml-2"
                  style={{ color: textSub }}
                  disabled={isSaving}
                  aria-label={showCurrent ? "Hide" : "Show"}
                >
                  {eyeIcon(showCurrent)}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold" style={{ color: textSub }}>
                New Password
              </label>
              <div
                className="mt-2 flex w-full items-center rounded-lg border bg-white px-3 py-2"
                style={{ borderColor: inputBorder }}
              >
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none disabled:opacity-50"
                  style={{ color: textMain }}
                  placeholder="Enter new password"
                  disabled={isSaving}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="ml-2"
                  style={{ color: textSub }}
                  disabled={isSaving}
                  aria-label={showNew ? "Hide" : "Show"}
                >
                  {eyeIcon(showNew)}
                </button>
              </div>
              <p className="mt-1 text-xs" style={{ color: textSub }}>
                8+ chars, upper, lower, number, special character
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold" style={{ color: textSub }}>
                Confirm New Password
              </label>
              <div
                className="mt-2 flex w-full items-center rounded-lg border bg-white px-3 py-2"
                style={{ borderColor: inputBorder }}
              >
                <input
                  type={showConfirmNew ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none disabled:opacity-50"
                  style={{ color: textMain }}
                  placeholder="Confirm new password"
                  disabled={isSaving}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNew((value) => !value)}
                  className="ml-2"
                  style={{ color: textSub }}
                  disabled={isSaving}
                  aria-label={showConfirmNew ? "Hide" : "Show"}
                >
                  {eyeIcon(showConfirmNew)}
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="mt-8 w-full rounded-md bg-[#265D6F] py-3 text-sm font-semibold text-[#E0E6E7] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? "Changing..." : "Change Password"}
          </button>
        </div>

        <AppBottomNav />
      </div>
    </div>
  );
};

export default ChangePasswordPage;
