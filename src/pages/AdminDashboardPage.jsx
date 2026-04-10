import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileAppFrame from "../components/MobileAppFrame";
import AdminBottomNav from "../components/AdminBottomNav";
import { authAPI } from "../services/authAPI";
import { adminDashboardAPI } from "../services/adminDashboardAPI";
import { memberManagementAPI } from "../services/memberManagementAPI";
import { tokenService } from "../services/tokenService";
import { useTheme } from "../context/ThemeContext";
import { showError } from "../utils/toastUtils";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [adminName, setAdminName] = useState("Admin");
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalAdmins: 0,
  });
  const [activity, setActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = async () => {
    setIsLoading(true);

    try {
      const [profileResponse, statsResponse, membersResponse, activityResponse] =
        await Promise.all([
          authAPI.getProfile(),
          adminDashboardAPI.getDashboardStats(),
          memberManagementAPI.listMembers(),
          memberManagementAPI.listRecentActivity(3),
        ]);

      const currentUser = profileResponse.data?.user;
      tokenService.setUser(currentUser);
      setAdminName(currentUser?.fullName || "Admin");
      const dashboardStats = statsResponse?.data?.data || statsResponse?.data || {};
      const nextMembers = Array.isArray(membersResponse.data?.members)
        ? membersResponse.data.members.filter(
          (member) => member.status !== "pending"
        )
        : [];

      setStats({
        totalUsers: dashboardStats.totalUsers ?? nextMembers.length,
        activeUsers:
          dashboardStats.activeUsers ??
          nextMembers.filter((member) => member.status === "active").length,
        inactiveUsers:
          dashboardStats.inactiveUsers ??
          nextMembers.filter((member) => member.status === "inactive").length,
        totalAdmins: dashboardStats.totalAdmins ?? 0,
      });
      setMembers(nextMembers);
      setActivity(activityResponse.data?.activity || []);
    } catch (loadError) {
      showError(loadError, "Failed to load admin dashboard.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const containerBg = darkMode ? "#1E3A45" : "#E0E6E7";
  const cardBg = darkMode ? "#274956" : "#A8B7C0";
  const panelBg = darkMode ? "#21414D" : "#E0E6E7";
  const textMain = darkMode ? "#E4EDF2" : "#265D6F";
  const textSub = darkMode ? "#C2D3DB" : "#6E828D";
  const sectionShadow = "0 16px 30px rgba(21,39,49,0.08)";

  const recentMembers = [...members].slice(0, 4);

  const handleOpenMember = (memberId) => {
    navigate("/admin/members", {
      state: {
        selectedMemberId: memberId,
        openView: true,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-dvh min-h-dvh w-full items-center justify-center bg-[#E0E6E7]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#265D6F] border-t-transparent" />
          <p className="mt-4 text-sm text-[#265D6F]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <MobileAppFrame backgroundColor={containerBg} bottomNav={<AdminBottomNav />}>
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-4">
        <section className="rounded-[28px] px-6 py-5" style={{ backgroundColor: cardBg, boxShadow: sectionShadow }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em]" style={{ color: textSub }}>
                Admin Dashboard
              </p>
              <h1 className="mt-2 text-2xl font-semibold" style={{ color: textMain }}>
                Hello, {adminName}
              </h1>
              <p className="mt-2 text-sm" style={{ color: textSub }}>
                Manage members with a clearer view of account health and activity.
              </p>
              <button
                type="button"
                onClick={() => navigate("/admin/members")}
                className="mt-4 rounded-full bg-[#265D6F] px-4 py-2 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(11,26,33,0.14)] transition hover:translate-y-[-1px]"
              >
                + Add Member
              </button>
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
            { label: "Total Members", value: stats.totalUsers },
            { label: "Active Members", value: stats.activeUsers },
            { label: "Inactive Members", value: stats.inactiveUsers },
            { label: "Total Admins", value: stats.totalAdmins },
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
              Recent Members
            </h2>
            <button
              type="button"
              onClick={() => navigate("/admin/all-members")}
              className="rounded-full border border-[#265D6F] px-3 py-1 text-[11px] font-semibold text-[#265D6F]"
            >
              View All
            </button>
          </div>

          {recentMembers.length ? (
            <div className="mt-3 space-y-3">
              {recentMembers.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => handleOpenMember(member.id)}
                  className="w-full rounded-[18px] px-4 py-4 text-left transition hover:translate-y-[-1px]"
                  style={{ backgroundColor: panelBg }}
                >
                  <div className="flex items-center justify-between gap-3">
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
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[18px] border border-dashed border-[#C4CFD4] px-4 py-8 text-center text-sm text-[#6E828D]">
              No members yet
            </div>
          )}
        </section>

        <section className="mt-4 rounded-[22px] px-5 py-4" style={{ backgroundColor: cardBg, boxShadow: sectionShadow }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: textMain }}>
              Recent Activity
            </h2>
            <button
              type="button"
              onClick={() => navigate("/admin/activity")}
              className="rounded-full border border-[#265D6F] px-3 py-1 text-[11px] font-semibold text-[#265D6F]"
            >
              View All
            </button>
          </div>

          {activity.length ? (
            <div className="mt-3 space-y-3">
              {activity.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-[18px] px-4 py-4"
                  style={{ backgroundColor: panelBg }}
                >
                  <p className="text-sm font-semibold capitalize" style={{ color: textMain }}>
                    {entry.type}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: textSub }}>
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
      </div>
    </MobileAppFrame>
  );
};

export default AdminDashboardPage;
