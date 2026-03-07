import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { tokenService } from "../services/tokenService";
import { authAPI } from "../services/authAPI";

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    credentials: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = { email: "", password: "", credentials: "" };

    // Email: required, must end with @gmail.com
    if (!email.trim()) {
      newErrors.email = "E-mail is required.";
    } else if (!/^[^\s@]+@gmail\.com$/i.test(email.trim())) {
      newErrors.email = "E-mail must be a valid address ending with @gmail.com.";
    }

    // Password: required, complexity rules
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

    setErrors(newErrors);
    return Object.values(newErrors).every((m) => m === "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous credential errors
    setErrors((prev) => ({ ...prev, credentials: "" }));
    
    if (!validate()) return;

    setIsLoading(true);

    try {
      const response = await authAPI.login({
        email: email.trim(),
        password: password,
      });

      // Store the token
      tokenService.setToken(response.data.token);

      // Navigate to home page
      navigate("/home");
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        credentials: error.message || "Invalid e-mail or password.",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#E0E6E7]">
      {/* APP SCREEN FRAME */}
      <div className="relative flex h-[896px] w-[414px] max-w-full flex-col overflow-hidden rounded-[32px] bg-[#265D6F] shadow-[0_20px_40px_rgba(0,0,0,0.25)]">
        {/* top grey block + wave, same as signup */}
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

        {/* CONTENT */}
        <div className="relative z-10 flex flex-1 flex-col px-8 pb-10">
          {/* heading section, aligned like Figma */}
          <div className="mt-6">
            <h1 className="text-4xl font-bold text-white">Welcome Back!</h1>
            <p className="mt-2 text-sm text-[#C4D0D8]">
              To sign in to an account, enter your email and password.
            </p>
          </div>

          {/* form fields */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* E-mail */}
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

            {/* Password with eye icon */}
            <div>
              <label className="block text-sm text-[#E2EDF2]">Password</label>
              <div className="mt-2 flex items-center rounded-md border border-[#5C8A99] bg-transparent px-3 py-1 text-sm text-white focus-within:border-white">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent py-2 text-sm text-white outline-none"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="ml-2 text-[#D0DEE5]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                >
                  {/* simple eye / eye-off svg */}
                  {showPassword ? (
                    // eye-off
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
                    // eye
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
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-300">
                  {errors.password}
                </p>
              )}
            </div>

            {/* credentials error under fields */}
            {errors.credentials && (
              <p className="mt-1 text-xs text-red-300 text-center">
                {errors.credentials}
              </p>
            )}
          </form>

          {/* bottom section like Figma */}
          <div className="mt-8 flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-xs font-semibold text-[#E2EDF2] hover:underline"
              disabled={isLoading}
            >
              Forgot Password?
            </button>

            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-3/4 rounded-full bg-[#A8B7C0] py-3 text-sm font-semibold text-[#265D6F] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Continue"}
            </button>

            <p className="mt-2 text-xs text-[#D0DEE5]">
              Don't have an account yet?
            </p>

            <button
              type="button"
              onClick={() => navigate("/createaccount")}
              disabled={isLoading}
              className="w-3/4 rounded-full bg-[#A8B7C0] py-3 text-sm font-semibold text-[#265D6F] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create an account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;