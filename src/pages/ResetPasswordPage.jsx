// src/pages/ResetPasswordPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { authAPI } from "../services/authAPI";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const state = location.state || {};

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNew, setShowNew] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const urlToken = searchParams.get("token");
    const urlEmail = searchParams.get("email");
    if (urlToken) setToken(urlToken);
    if (urlEmail) setEmail(decodeURIComponent(urlEmail));
    if (!urlToken && !urlEmail && state.resetToken) setToken(state.resetToken);
    if (!urlEmail && state.email) setEmail(state.email);
  }, [searchParams, state.resetToken, state.email]);

  const validate = () => {
    if (!email.trim()) {
      setError("E-mail is required.");
      return false;
    }
    if (!/^[^\s@]+@gmail\.com$/i.test(email.trim())) {
      setError("E-mail must be a valid Gmail address.");
      return false;
    }
    if (!token.trim()) {
      setError("Reset token is required.");
      return false;
    }
    if (!newPassword) {
      setError("New password is required.");
      return false;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
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
      setError("Password must include upper, lower, number and special character.");
      return false;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    if (!validate()) return;

    setIsLoading(true);
    try {
      await authAPI.resetPassword(
        email.trim(),
        token.trim(),
        newPassword,
        confirmNewPassword
      );
      setSuccessMessage("Password reset successfully. You can now sign in.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const eyeIcon = (show) =>
    show ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
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
      >
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#E0E6E7]">
      <div className="relative flex h-[896px] w-[414px] max-w-full flex-col overflow-hidden rounded-[32px] bg-[#265D6F] shadow-[0_20px_40px_rgba(0,0,0,0.25)]">
        <div className="relative h-44 bg-[#A8B7C0]">
          <svg
            className="absolute bottom-0 left-0 right-0 h-24 w-full"
            viewBox="0 0 414 96"
            preserveAspectRatio="none"
          >
            <path
              d="M0,60 C80,20 200,0 414,50 L414,96 L0,96 Z"
              fill="#265D6F"
            />
          </svg>
        </div>

        <div className="relative z-10 flex flex-1 flex-col px-8 pb-10">
          <div className="mt-6">
            <h1 className="text-4xl font-bold text-white">Reset Password</h1>
            <p className="mt-2 text-sm text-[#C4D0D8]">
              {token && email ? "Enter your new password below." : "Enter your email, the reset token from your email, and your new password."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm text-[#E2EDF2]">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-md border border-[#5C8A99] bg-transparent px-3 py-3 text-sm text-white outline-none focus:border-white placeholder:text-[#8AA3AD]"
                placeholder="your@gmail.com"
                disabled={isLoading}
              />
            </div>

            {!token && (
              <div>
                <label className="block text-sm text-[#E2EDF2]">Reset Token</label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="mt-2 w-full rounded-md border border-[#5C8A99] bg-transparent px-3 py-3 text-sm text-white outline-none focus:border-white placeholder:text-[#8AA3AD]"
                  placeholder="Paste the token from the reset link in your email"
                  disabled={isLoading}
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-[#E2EDF2]">New Password</label>
              <div className="mt-2 flex items-center rounded-md border border-[#5C8A99] bg-transparent px-3 py-1 focus-within:border-white">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-transparent py-2 text-sm text-white outline-none placeholder:text-[#8AA3AD]"
                  placeholder="8+ chars, upper, lower, number, special"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="ml-2 text-[#D0DEE5]"
                  disabled={isLoading}
                >
                  {eyeIcon(showNew)}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#E2EDF2]">Confirm New Password</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="mt-2 w-full rounded-md border border-[#5C8A99] bg-transparent px-3 py-3 text-sm text-white outline-none focus:border-white placeholder:text-[#8AA3AD]"
                placeholder="Confirm new password"
                disabled={isLoading}
              />
            </div>

            {error && (
              <p className="text-xs text-red-300">{error}</p>
            )}
          </form>

          {successMessage && (
            <div className="mb-4 rounded-md border border-green-400 bg-green-100 px-3 py-2">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          <div className="mt-8 flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-3/4 rounded-full bg-[#A8B7C0] py-3 text-sm font-semibold text-[#265D6F] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              disabled={isLoading}
              className="w-3/4 rounded-full border border-[#A8B7C0] py-3 text-sm font-semibold text-[#E2EDF2] disabled:opacity-50"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
