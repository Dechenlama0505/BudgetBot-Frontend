import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileAppFrame from "../components/MobileAppFrame";
import SuperAdminBottomNav from "../components/SuperAdminBottomNav";
import { authAPI } from "../services/authAPI";
import { superAdminAPI } from "../services/superAdminAPI";
import { tokenService } from "../services/tokenService";
import { useTheme } from "../context/ThemeContext";
import { showError } from "../utils/toastUtils";

const SuperAdminDashboardPage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [displayName, setDisplayName] = useState("Superadmin");
  const [membersCount, setMembersCount] = useState(0);
  const [adminsCount, setAdminsCount] = useState(0);
  const [superAdminsCount, setSuperAdminsCount] = useState(0);
  const [activity, setActivity] = useState([]);
  const [recentMembers, setRecentMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [profileResponse, statsResponse, recentMembersResponse, activityResponse] =
          await Promise.all([
            authAPI.getProfile(),
            superAdminAPI.getDashboardStats(),
            superAdminAPI.listRecentMembers(),
            superAdminAPI.listRecentActivity(),
          ]);

        const currentUser = profileResponse.data?.user;
        const stats = statsResponse.data || {};

        tokenService.setUser(currentUser);
        setDisplayName(currentUser?.fullName || "Superadmin");
        setMembersCount(stats.totalUsers || 0);
        setAdminsCount(stats.totalAdmins || 0);
        setSuperAdminsCount(stats.totalSuperAdmins || 0);
        setRecentMembers(recentMembersResponse.data || stats.recentUsers || []);
        setActivity((activityResponse.data || stats.recentActivity || []).slice(0, 3));
      } catch (loadError) {
        setError(loadError.message || "Failed to load superadmin dashboard.");
        showError(loadError, "Failed to load superadmin dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const containerBg = darkMode ? "#1E3A45" : "#E0E6E7";
  const cardBg = darkMode ? "#274956" : "#A8B7C0";
  const panelBg = darkMode ? "#21414D" : "#E0E6E7";
  const textMain = darkMode ? "#E4EDF2" : "#265D6F";
  const textSub = darkMode ? "#C2D3DB" : "#6E828D";
  const sectionShadow = "0 16px 30px rgba(21,39,49,0.08)";

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

  return (
    <MobileAppFrame
      backgroundColor={containerBg}
      bottomNav={<SuperAdminBottomNav />}
    >
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-4">
        <section className="rounded-[28px] px-6 py-5" style={{ backgroundColor: cardBg, boxShadow: sectionShadow }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em]" style={{ color: textSub }}>
                Superadmin Dashboard
              </p>
              <h1 className="mt-2 text-2xl font-semibold" style={{ color: textMain }}>
                Hello, {displayName}
              </h1>
              <p className="mt-2 text-sm" style={{ color: textSub }}>
                Oversee members and admins from the same mobile-first interface.
              </p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#2A5B6C]">
              <img
                src="/budgetbotlogoHome.png"
                alt="BudgetBot logo"
                className="h-11 w-11 object-contain"
              />
            </div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-3">
          {[
            { label: "Members", value: membersCount },
            { label: "Admins", value: adminsCount },
            { label: "Super Admins", value: superAdminsCount },
            { label: "Total", value: membersCount + adminsCount + superAdminsCount },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[22px] px-4 py-4"
              style={{ backgroundColor: cardBg, boxShadow: "0 14px 28px rgba(21,39,49,0.06)" }}
            >
              <p className="text-[11px]" style={{ color: textSub }}>
                {item.label}
              </p>
              <p className="mt-2 text-xl font-semibold" style={{ color: textMain }}>
                {item.value}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-4 rounded-[22px] px-5 py-4" style={{ backgroundColor: cardBg, boxShadow: sectionShadow }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: textMain }}>
              Recent Activity
            </h2>
            <button
              type="button"
              onClick={() => navigate("/superadmin/activity")}
              className="rounded-full border border-[#265D6F] px-3 py-1 text-[11px] font-semibold text-[#265D6F]"
            >
              View All
            </button>
          </div>

          {error ? (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          ) : activity.length ? (
            <div className="mt-3 space-y-3">
              {activity.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-[18px] px-4 py-4"
                  style={{ backgroundColor: panelBg }}
                >
                  <p className="text-sm font-semibold" style={{ color: textMain }}>
                    {entry.message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[18px] border border-dashed border-[#C4CFD4] px-4 py-8 text-center text-sm text-[#6E828D]">
              No recent activity yet.
            </div>
          )}
        </section>

        <section className="mt-4 rounded-[22px] px-5 py-4" style={{ backgroundColor: cardBg, boxShadow: sectionShadow }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: textMain }}>
              Recent Members
            </h2>
            <button
              type="button"
              onClick={() => navigate("/superadmin/all-members")}
              className="rounded-full border border-[#265D6F] px-3 py-1 text-[11px] font-semibold text-[#265D6F]"
            >
              View All
            </button>
          </div>

          {recentMembers.length ? (
            <div className="mt-3 space-y-3">
              {recentMembers.map((member) => (
                <div
                  key={member.id}
                  className="rounded-[18px] px-4 py-4"
                  style={{ backgroundColor: panelBg }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: textMain }}>
                        {member.fullName}
                      </p>
                      <p className="mt-1 text-xs" style={{ color: textSub }}>
                        {member.email}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#D8EEE5] px-3 py-1 text-[11px] font-semibold text-[#215C42]">
                      {member.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[18px] border border-dashed border-[#C4CFD4] px-4 py-8 text-center text-sm text-[#6E828D]">
              No recent members yet.
            </div>
          )}
        </section>
      </div>
    </MobileAppFrame>
  );
};

export default SuperAdminDashboardPage;
