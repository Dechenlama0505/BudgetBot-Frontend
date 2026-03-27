import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileAppFrame from "../components/MobileAppFrame";
import SuperAdminBottomNav from "../components/SuperAdminBottomNav";
import { API_BASE_URL, authAPI } from "../services/authAPI";
import { tokenService } from "../services/tokenService";
import { useTheme } from "../context/ThemeContext";

const SuperAdminProfilePage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [profileImage, setProfileImage] = useState(null);
  const [displayName, setDisplayName] = useState("Superadmin");
  const [displayEmail, setDisplayEmail] = useState("Loading...");
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [status, setStatus] = useState("active");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        const user = response.data?.user;

        tokenService.setUser(user);
        setDisplayName(user?.fullName || "Superadmin");
        setDisplayEmail(user?.email || "");
        setStatus(user?.status || "active");
        setProfilePictureUrl(
          user?.profilePicture ? `${API_BASE_URL}${user.profilePicture}` : null
        );
      } catch (error) {
        console.error("Failed to load superadmin profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setProfileImage(loadEvent.target?.result || null);
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
    <MobileAppFrame
      backgroundColor={containerBg}
      bottomNav={<SuperAdminBottomNav />}
    >
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-4">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.2em]" style={{ color: textSub }}>
            Superadmin Profile
          </p>
        </div>

        <div className="relative flex flex-col items-center rounded-[28px] pt-20 pb-7" style={{ backgroundColor: panelBg }}>
          <label className="absolute top-4 flex h-24 w-24 cursor-pointer items-center justify-center rounded-full bg-white shadow-md">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
            ) : profilePictureUrl ? (
              <img src={profilePictureUrl} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <img src="/budgetbotlogoHome.png" alt="Default profile" className="h-16 w-16 object-contain" />
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>

          <div className="mt-16 text-center">
            <h2 className="text-xl font-semibold" style={{ color: textMain }}>
              {displayName}
            </h2>
            <p className="mt-1 text-sm" style={{ color: `${textSub}80` }}>
              {displayEmail}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-[18px] border px-5 py-3" style={{ backgroundColor: cardBg, borderColor: panelBg }}>
          <div className="flex items-center justify-between text-sm font-semibold">
            <span style={{ color: textMain }}>Role</span>
            <span style={{ color: textMain }}>Superadmin</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span style={{ color: textSub }}>Account Status</span>
            <span className="rounded-full bg-[#D8EEE5] px-3 py-1 font-semibold text-[#215C42]">
              {status}
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-[18px] border px-5 py-2" style={{ backgroundColor: cardBg, borderColor: panelBg }}>
          <button
            type="button"
            onClick={() => navigate("/superadmin/admins")}
            className="flex w-full items-center justify-between py-2 text-sm font-semibold"
            style={{ color: textMain }}
          >
            <span>Manage Admins</span>
            <span style={{ color: textSub }}>{">"}</span>
          </button>
        </div>

        <div className="mt-4 rounded-[18px] border px-5 py-2" style={{ backgroundColor: cardBg, borderColor: panelBg }}>
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
    </MobileAppFrame>
  );
};

export default SuperAdminProfilePage;
