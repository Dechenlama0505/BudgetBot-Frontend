// src/pages/EditProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppBottomNav from "../components/AppBottomNav";
import { API_BASE_URL, authAPI } from "../services/authAPI";
import { tokenService } from "../services/tokenService";
import { useTheme } from "../context/ThemeContext";
import { showError, showSuccess } from "../utils/toastUtils";

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  // User data from API
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);

  // Local state for photo handling
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPhotoPrompt, setShowPhotoPrompt] = useState(false);

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

        setFullName(user.fullName || "");
        setEmail(user.email || "");
        setMonthlyIncome(user.monthlyIncome || "");

        const fullProfileUrl = user.profilePicture
          ? `${API_BASE_URL}${user.profilePicture}`
          : null;

        setProfilePictureUrl(fullProfileUrl);
        setPreviewUrl(fullProfileUrl);
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

  const handleBack = () => {
    navigate("/profile");
  };

  const handlePickPhoto = () => {
    setShowPhotoPrompt(true);
  };

  const handlePhotoPermission = (allow) => {
    setShowPhotoPrompt(false);
    if (!allow) return;

    const input = document.getElementById("edit-profile-photo-input");
    if (input) input.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreviewUrl(ev.target?.result || null);
    };
    reader.readAsDataURL(file);
    setError("");
  };

  const handleRemovePhoto = async () => {
    try {
      setError("");

      if (profilePictureUrl) {
        const response = await authAPI.deleteProfilePicture();
        setProfilePictureUrl(null);
        showSuccess(
          response.data?.message || "Profile picture removed successfully!"
        );
      }

      setSelectedFile(null);
      setPreviewUrl(null);
      setSuccessMessage("Profile picture removed successfully!");

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setError(showError(error, "Failed to remove profile picture"));
    }
  };

  const handleSave = async () => {
    try {
      setError("");
      setSuccessMessage("");
      setIsSaving(true);

      if (monthlyIncome && monthlyIncome < 0) {
        setError("Monthly income cannot be negative");
        return;
      }

      const response = await authAPI.updateProfile(
        fullName,
        monthlyIncome ? parseFloat(monthlyIncome) : null,
        selectedFile
      );

      const successMessage =
        response.data?.message || "Profile updated successfully!";
      setSuccessMessage(successMessage);
      showSuccess(successMessage);

      const updatedUser = response.data.user;
      setFullName(updatedUser.fullName);
      setEmail(updatedUser.email);
      setMonthlyIncome(updatedUser.monthlyIncome || "");

      const updatedFullUrl = updatedUser.profilePicture
        ? `${API_BASE_URL}${updatedUser.profilePicture}`
        : null;

      setProfilePictureUrl(updatedFullUrl);
      setPreviewUrl(updatedFullUrl);
      setSelectedFile(null);

      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (error) {
      setError(showError(error, "Failed to update profile. Please try again."));
    } finally {
      setIsSaving(false);
    }
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
  const headerBg = darkMode ? "#274956" : "#A8B7C0";
  const textMain = darkMode ? "#E4EDF2" : "#265D6F";
  const textSub = darkMode ? "#C2D3DB" : "#6E828D";
  const inputBorder = darkMode ? "#3B6A78" : "#C4CFD4";

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
            onClick={handleBack}
            className="absolute left-4 text-2xl text-[#265D6F]"
            disabled={isSaving}
          >
            ←
          </button>
          <h1 className="text-lg font-semibold text-white">Edit Profile</h1>
        </div>

        {/* content */}
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 rounded-md border border-green-400 bg-green-100 px-3 py-2">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-md border border-red-400 bg-red-100 px-3 py-2">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* avatar */}
          <div className="flex flex-col items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-md">
              {previewUrl ? (
                <img
                  src={previewUrl}
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
            </div>
            <button
              type="button"
              onClick={handlePickPhoto}
              className="mt-3 text-sm font-semibold"
              style={{ color: textMain }}
              disabled={isSaving}
            >
              Change photo
            </button>
            {(previewUrl || profilePictureUrl) && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="mt-1 text-xs text-red-500 disabled:opacity-50"
                disabled={isSaving}
              >
                Remove photo
              </button>
            )}
          </div>

          {/* form fields */}
          <div className="mt-8 space-y-5">
            {/* Name */}
            <div>
              <label
                className="block text-sm font-semibold"
                style={{ color: textSub }}
              >
                Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none disabled:opacity-50 disabled:bg-gray-100"
                style={{ borderColor: inputBorder, color: textMain }}
                disabled={isSaving}
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label
                className="block text-sm font-semibold"
                style={{ color: textSub }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                className="mt-2 w-full cursor-not-allowed rounded-lg border bg-gray-100 px-3 py-2 text-sm outline-none"
                style={{ borderColor: inputBorder, color: textSub }}
                disabled
                title="Email cannot be changed"
              />
              <p className="mt-1 text-xs" style={{ color: textSub }}>
                Email cannot be changed
              </p>
            </div>

            {/* Monthly Income */}
            <div>
              <label
                className="block text-sm font-semibold"
                style={{ color: textSub }}
              >
                Monthly Income (NPR)
              </label>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className="mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none disabled:opacity-50 disabled:bg-gray-100"
                style={{ borderColor: inputBorder, color: textMain }}
                placeholder="Enter your monthly income"
                min="0"
                step="0.01"
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            className="mt-8 w-full rounded-md bg-[#265D6F] py-3 text-sm font-semibold text-[#E0E6E7] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* hidden file input */}
        <input
          id="edit-profile-photo-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isSaving}
        />

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

export default EditProfilePage;
