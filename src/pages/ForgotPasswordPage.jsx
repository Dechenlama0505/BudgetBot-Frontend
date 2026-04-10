// src/pages/ForgotPasswordPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/authAPI";
import { showError, showSuccess } from "../utils/toastUtils";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setError("E-mail is required.");
      return false;
    }
    if (!/^[^\s@]+@gmail\.com$/i.test(email.trim())) {
      setError("E-mail must be a valid Gmail address ending with @gmail.com.");
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
      const response = await authAPI.forgotPassword(email);
      const message =
        response.data?.message || "Reset instructions sent successfully.";
      setSuccessMessage(message);
      showSuccess(message);
    } catch (err) {
      setError(showError(err, "Request failed. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full justify-center bg-[#E0E6E7] sm:px-4 sm:py-6">
      <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#265D6F] sm:min-h-[calc(100vh-3rem)] sm:max-h-[calc(100vh-3rem)] sm:max-w-[430px] sm:rounded-[32px] sm:shadow-[0_20px_40px_rgba(0,0,0,0.25)]">
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
            <h1 className="text-4xl font-bold text-white">Forgot Password?</h1>
            <p className="mt-2 text-sm text-[#C4D0D8]">
              Enter your email to receive a reset link.
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
              {error && (
                <p className="mt-1 text-xs text-red-300">{error}</p>
              )}
            </div>
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
              {isLoading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPasswordPage;
