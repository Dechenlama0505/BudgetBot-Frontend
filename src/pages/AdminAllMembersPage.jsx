import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileAppFrame from "../components/MobileAppFrame";
import AdminBottomNav from "../components/AdminBottomNav";
import { memberManagementAPI } from "../services/memberManagementAPI";
import { useTheme } from "../context/ThemeContext";
import { showError } from "../utils/toastUtils";

const AdminAllMembersPage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const response = await memberManagementAPI.listMembers();
        const allMembers = Array.isArray(response?.data?.members)
          ? response.data.members.filter((member) => member.status !== "pending")
          : [];

        setMembers(allMembers);
      } catch (loadError) {
        setError(loadError.message || "Failed to load members.");
        showError(loadError, "Failed to load members.");
      } finally {
        setIsLoading(false);
      }
    };

    loadMembers();
  }, []);

  const containerBg = darkMode ? "#1E3A45" : "#E0E6E7";
  const cardBg = darkMode ? "#274956" : "#A8B7C0";
  const panelBg = darkMode ? "#21414D" : "#E0E6E7";
  const textMain = darkMode ? "#E4EDF2" : "#265D6F";
  const textSub = darkMode ? "#C2D3DB" : "#6E828D";

  return (
    <MobileAppFrame
      backgroundColor={containerBg}
      bottomNav={<AdminBottomNav />}
    >
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-4">
        <section
          className="rounded-[28px] px-5 py-5"
          style={{ backgroundColor: cardBg }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard")}
                className="rounded-full border border-[#265D6F] px-3 py-1 text-[11px] font-semibold text-[#265D6F]"
              >
                ← Back
              </button>
              <p
                className="mt-4 text-xs uppercase tracking-[0.2em]"
                style={{ color: textSub }}
              >
                Admin Members
              </p>
              <h1
                className="mt-2 text-2xl font-semibold"
                style={{ color: textMain }}
              >
                All Members
              </h1>
              <p className="mt-2 text-sm" style={{ color: textSub }}>
                View all members using the same mobile-first card style as the
                dashboard.
              </p>
            </div>
          </div>
        </section>

        <section
          className="mt-4 rounded-[22px] px-5 py-4"
          style={{ backgroundColor: cardBg }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: textMain }}>
              All Members
            </h2>
          </div>

          {isLoading ? (
            <div className="mt-5 flex justify-center py-10">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#265D6F] border-t-transparent" />
            </div>
          ) : error ? (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          ) : members.length ? (
            <div className="mt-3 space-y-3">
              {members.map((member, index) => (
                <div
                  key={member?.id || `${member?.email || "member"}-${index}`}
                  className="rounded-[18px] px-4 py-4"
                  style={{ backgroundColor: panelBg }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: textMain }}>
                        {member?.fullName || "Unknown member"}
                      </p>
                      {member?.email ? (
                        <p className="mt-1 text-xs" style={{ color: textSub }}>
                          {member.email}
                        </p>
                      ) : null}
                    </div>
                    {member?.status ? (
                      <span className="rounded-full bg-[#D8EEE5] px-3 py-1 text-[11px] font-semibold text-[#215C42]">
                        {member.status}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[18px] border border-dashed border-[#C4CFD4] px-4 py-8 text-center text-sm text-[#6E828D]">
              No members found.
            </div>
          )}
        </section>
      </div>
    </MobileAppFrame>
  );
};

export default AdminAllMembersPage;
