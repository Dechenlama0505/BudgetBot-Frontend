import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/authAPI";
import { tokenService } from "../services/tokenService";
import { showError, showSuccess } from "../utils/toastUtils";

const CreateAccount = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const validate = () => {
    const newErrors = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    // Full name: required, max 100, letters + spaces only
    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    } else if (fullName.trim().length > 100) {
      newErrors.fullName = "Full name must be at most 100 characters.";
    } else if (!/^[A-Za-z\s]+$/.test(fullName.trim())) {
      newErrors.fullName = "Full name can only contain letters and spaces.";
    }

    // Email: must end with @gmail.com
    if (!email.trim()) {
      newErrors.email = "E-mail is required.";
    } else if (!/^[^\s@]+@gmail\.com$/i.test(email.trim())) {
      newErrors.email = "E-mail must be a valid address ending with @gmail.com.";
    }

    // Password: ≥ 8 chars, upper, lower, number, special
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    } else if (
      !(
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password)
      )
    ) {
      newErrors.password =
        "Password must include upper, lower, number and special character.";
    }

    // Confirm password: must match
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((m) => m === "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous API errors
    setApiError("");
    
    if (!validate()) return;

    setIsLoading(true);

    try {
      const response = await authAPI.signup({
        fullName: fullName.trim(),
        email: email.trim(),
        password: password,
        confirmPassword: confirmPassword,
      });

      tokenService.setToken(response.data.token);
      tokenService.setUser(response.data.user);
      showSuccess(response.data.message || "Account created successfully");
      navigate(tokenService.getHomePath());
    } catch (error) {
      setApiError(
        showError(error, "Failed to create account. Please try again.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#E0E6E7]">
      {/* phone frame */}
      <div className="relative flex h-[896px] w-[414px] max-w-full flex-col overflow-hidden rounded-[32px] bg-[#265D6F] shadow-[0_20px_40px_rgba(0,0,0,0.25)]">
        {/* top grey block + wave */}
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

        {/* content */}
        <div className="relative z-10 flex flex-1 flex-col px-8 pb-10">
          {/* heading section */}
          <div className="mt-6">
            <h1 className="text-4xl font-bold text-white">Welcome!</h1>
            <p className="mt-2 text-sm text-[#C4D0D8]">
              Create an account to join BudgetBot
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* API Error Display */}
            {apiError && (
              <div className="rounded-md bg-red-900/30 border border-red-400/50 px-3 py-2">
                <p className="text-xs text-red-300">{apiError}</p>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-sm text-[#E2EDF2]">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-2 w-full rounded-md border border-[#5C8A99] bg-transparent px-3 py-3 text-sm text-white outline-none focus:border-white"
                maxLength={100}
                disabled={isLoading}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-300">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-[#E2EDF2]">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-md border border-[#5C8A99] bg-transparent px-3 py-3 text-sm text-white outline-none focus:border-white"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-300">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-[#E2EDF2]">Password</label>
              <div className="mt-2 flex items-center rounded-md border border-[#5C8A99] bg-transparent px-3 py-1 focus-within:border-white">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent py-2 text-sm text-white outline-none"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="ml-2 text-[#D0DEE5]"
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {eyeIcon(showPassword)}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-300">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm text-[#E2EDF2]">
                Confirm Password
              </label>
              <div className="mt-2 flex items-center rounded-md border border-[#5C8A99] bg-transparent px-3 py-1 focus-within:border-white">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent py-2 text-sm text-white outline-none"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="ml-2 text-[#D0DEE5]"
                  disabled={isLoading}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {eyeIcon(showConfirmPassword)}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-300">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </form>

          {/* bottom button + link, pushed down similar to Figma */}
          <div className="mt-auto mb-8 flex flex-col items-center">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-3/4 rounded-full bg-[#A8B7C0] py-3 text-sm font-semibold text-[#265D6F] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </button>
            <p className="mt-4 text-xs text-[#D0DEE5]">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                disabled={isLoading}
                className="underline disabled:opacity-50"
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
