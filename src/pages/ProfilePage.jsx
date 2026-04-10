// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppBottomNav from "../components/AppBottomNav";
import { API_BASE_URL, authAPI } from "../services/authAPI";
import { tokenService } from "../services/tokenService";
import { useTheme } from "../context/ThemeContext";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  const [profileImage, setProfileImage] = useState(null);
  const [showPhotoPrompt, setShowPhotoPrompt] = useState(false);

  // User data from API
  const [displayName, setDisplayName] = useState("User");
  const [displayEmail, setDisplayEmail] = useState("Loading...");
  const [monthlyIncome, setMonthlyIncome] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!tokenService.isAuthenticated()) {
          navigate("/login");
          return;
        }

        const response = await authAPI.getProfile();
        const user = response.data.user;

        tokenService.setUser(user);

        setDisplayName(user.fullName);
        setDisplayEmail(user.email);
        setMonthlyIncome(user.monthlyIncome);
        setProfilePictureUrl(
          user.profilePicture ? `${API_BASE_URL}${user.profilePicture}` : null
        );
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        tokenService.removeToken();
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handlePickPhoto = () => {
    setShowPhotoPrompt(true);
  };

  const handlePhotoPermission = (allow) => {
    setShowPhotoPrompt(false);
    if (!allow) return;

    const input = document.getElementById("profile-photo-input");
    if (input) input.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfileImage(ev.target?.result || null);
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    tokenService.logout();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#E0E6E7]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#265D6F] border-t-transparent" />
          <p className="mt-4 text-sm text-[#265D6F]">Loading...</p>
        </div>
      </div>
    );
  }

  const containerBg = darkMode ? "#1E3A45" : "#E0E6E7";
  const panelBg = darkMode ? "#274956" : "#A8B7C0";
  const cardBg = darkMode ? "#2F5A68" : "#E0E6E7";
  const textMain = darkMode ? "#E4EDF2" : "#265D6F";
  const textSub = darkMode ? "#C2D3DB" : "#6E828D";

  return (
    <div
      className="flex min-h-dvh w-full items-start justify-center sm:px-4"
      style={{ backgroundColor: containerBg }}
    >
      <div
        className="relative flex min-h-dvh w-full flex-col sm:min-h-dvh sm:max-h-dvh sm:max-w-[430px] sm:rounded-[32px] sm:shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
        style={{ backgroundColor: containerBg }}
      >
        {/* main content */}
        <div className="flex-1 overflow-y-auto px-4 pt-5 pb-4">
          {/* header panel with avatar */}
          <div
            className="relative flex flex-col items-center rounded-[28px] pt-20 pb-7"
            style={{ backgroundColor: panelBg }}
          >
            {/* avatar circle - lower inside card */}
            <button
              type="button"
              onClick={handlePickPhoto}
              className="absolute top-4 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-md"
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt="Profile"
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <img
                  src="/budgetbotlogoHome.png"
                  alt="Default profile"
                  className="h-16 w-16 object-contain"
                />
              )}
            </button>

            <div className="mt-16 text-center">
              <h2
                className="text-xl font-semibold"
                style={{ color: textMain }}
              >
                {displayName}
              </h2>
              <p
                className="mt-1 text-sm"
                style={{ color: `${textSub}80` }}
              >
                {displayEmail}
              </p>
            </div>
          </div>

          {/* hidden file input for photo upload */}
          <input
            id="profile-photo-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Monthly income card */}
          <div
            className="mt-5 rounded-[18px] border px-5 py-3"
            style={{ backgroundColor: cardBg, borderColor: panelBg }}
          >
            <div className="flex items-center justify-between text-sm font-semibold">
              <span style={{ color: textMain }}>Monthly Income</span>
              <span style={{ color: textMain }}>
                {monthlyIncome
                  ? `NPR ${monthlyIncome.toLocaleString()}`
                  : "Not set"}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => navigate("/edit-profile")}
                className="text-left text-[#3A6B7A]"
              >
                Edit Profile
              </button>
              <span style={{ color: textSub }}>{">"}</span>
            </div>
          </div>

          {/* Settings block 1 */}
          <div
            className="mt-4 rounded-[18px] border px-5 py-2"
            style={{ backgroundColor: cardBg, borderColor: panelBg }}
          >
            {/* Dark mode */}
            <div className="flex items-center justify-between py-2">
              <span
                className="text-sm font-semibold"
                style={{ color: textMain }}
              >
                Dark Mode
              </span>
              <button
                type="button"
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? "bg-[#2A5B6C]" : "bg-[#C4CFD4]"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                    darkMode ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Manage categories */}
            <button
              type="button"
              onClick={() => navigate("/categories")}
              className="flex w-full items-center justify-between border-t py-2 text-sm font-semibold"
              style={{ borderColor: panelBg, color: textMain }}
            >
              <span>Manage Categories</span>
              <span style={{ color: textSub }}>{">"}</span>
            </button>

      
          </div>

          {/* Settings block 2 */}
          <div
            className="mt-4 rounded-[18px] border px-5 py-2"
            style={{ backgroundColor: cardBg, borderColor: panelBg }}
          >
            {/* Change password */}
            <button
              type="button"
              onClick={() => navigate("/change-password")}
              className="flex w-full items-center justify-between border-b py-2 text-sm font-semibold"
              style={{ borderColor: panelBg, color: textMain }}
            >
              <span>Change Password</span>
              <span style={{ color: textSub }}>{">"}</span>
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-between py-2 text-sm font-semibold"
              style={{ color: textMain }}
            >
              <span>Logout</span>
              <span style={{ color: textSub }}>{">"}</span>
            </button>
          </div>
        </div>

        {/* photo permission prompt */}
        {showPhotoPrompt && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
            <div className="w-72 rounded-2xl bg-white p-5 text-sm text-[#265D6F]">
              <p className="font-semibold">Allow access to photos?</p>
              <p className="mt-2 text-xs text-[#6E828D]">
                BudgetBot needs permission to open your photo library.
              </p>
              <div className="mt-4 flex justify-end gap-3 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handlePhotoPermission(false)}
                  className="rounded-full border border-[#265D6F] px-4 py-1 text-[#265D6F]"
                >
                  Decline
                </button>
                <button
                  type="button"
                  onClick={() => handlePhotoPermission(true)}
                  className="rounded-full bg-[#265D6F] px-4 py-1 text-white"
                >
                  Allow
                </button>
              </div>
            </div>
          </div>
        )}

        {/* bottom nav */}
        <AppBottomNav />
      </div>
    </div>
  );
};

export default ProfilePage;
