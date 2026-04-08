import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileAppFrame from "../components/MobileAppFrame";
import SuperAdminBottomNav from "../components/SuperAdminBottomNav";
import { superAdminAPI } from "../services/superAdminAPI";
import { useTheme } from "../context/ThemeContext";
import { showError } from "../utils/toastUtils";

const SuperAdminActivityPage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [activity, setActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadActivity = async () => {
      try {
        const response = await superAdminAPI.listRecentActivity();
        const data = response?.data;
        const allActivity = Array.isArray(data)
          ? data
          : Array.isArray(data?.activity)
            ? data.activity
            : [];

        setActivity(allActivity);
      } catch (loadError) {
        setError(loadError.message || "Failed to load activity.");
        showError(loadError, "Failed to load activity.");
      } finally {
        setIsLoading(false);
      }
    };

    loadActivity();
  }, []);

  const containerBg = darkMode ? "#1E3A45" : "#E0E6E7";
  const cardBg = darkMode ? "#274956" : "#A8B7C0";
  const panelBg = darkMode ? "#21414D" : "#E0E6E7";
  const textMain = darkMode ? "#E4EDF2" : "#265D6F";
  const textSub = darkMode ? "#C2D3DB" : "#6E828D";

  return (
    <MobileAppFrame
      backgroundColor={containerBg}
      bottomNav={<SuperAdminBottomNav />}
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
                onClick={() => navigate("/superadmin/dashboard")}
                className="rounded-full border border-[#265D6F] px-3 py-1 text-[11px] font-semibold text-[#265D6F]"
              >
                ← Back
              </button>
              <p
                className="mt-4 text-xs uppercase tracking-[0.2em]"
                style={{ color: textSub }}
              >
                Superadmin Activity
              </p>
              <h1
                className="mt-2 text-2xl font-semibold"
                style={{ color: textMain }}
              >
                All Activity
              </h1>
              <p className="mt-2 text-sm" style={{ color: textSub }}>
                Review all available activity entries using the same dashboard
                card style.
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
              Recent Activity
            </h2>
          </div>

          {isLoading ? (
            <div className="mt-5 flex justify-center py-10">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#265D6F] border-t-transparent" />
            </div>
          ) : error ? (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          ) : activity.length ? (
            <div className="mt-3 space-y-3">
              {activity.map((entry, index) => (
                <div
                  key={entry?.id || `${entry?.message || "activity"}-${index}`}
                  className="rounded-[18px] px-4 py-4"
                  style={{ backgroundColor: panelBg }}
                >
                  <p className="text-sm font-semibold" style={{ color: textMain }}>
                    {entry?.message || "Activity update"}
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

export default SuperAdminActivityPage;
