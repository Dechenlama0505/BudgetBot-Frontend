import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileAppFrame from "../components/MobileAppFrame";
import SuperAdminBottomNav from "../components/SuperAdminBottomNav";
import { superAdminAPI } from "../services/superAdminAPI";
import { useTheme } from "../context/ThemeContext";
import { showError, showSuccess } from "../utils/toastUtils";

const initialUpdateForm = {
  email: "",
  password: "",
};

const pageSizeOptions = [10, 25, 50];

const SuperAdminUserManagementPage = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [reloadKey, setReloadKey] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpenFor, setMenuOpenFor] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [updateForm, setUpdateForm] = useState(initialUpdateForm);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const containerBg = darkMode ? "#1E3A45" : "#E0E6E7";
  const cardBg = darkMode ? "#274956" : "#A8B7C0";
  const panelBg = darkMode ? "#21414D" : "#E0E6E7";
  const textMain = darkMode ? "#E4EDF2" : "#265D6F";
  const textSub = darkMode ? "#C2D3DB" : "#6E828D";
  const borderColor = darkMode ? "#3C6472" : "#C4CFD4";

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await superAdminAPI.listManagedUsers({
          page,
          limit: pageSize,
          search: query,
          role: roleFilter,
          status: statusFilter,
        });

        const data = response?.data || {};
        const safeUsers = Array.isArray(data.users) ? data.users : [];

        setUsers(safeUsers);
        setPagination({
          page: data.pagination?.page ?? page,
          limit: data.pagination?.limit ?? pageSize,
          total: data.pagination?.total ?? 0,
          totalPages: data.pagination?.totalPages ?? 1,
        });
      } catch (loadError) {
        setError(loadError.message || "Failed to load users.");
        showError(loadError, "Failed to load users.");
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [page, pageSize, query, roleFilter, statusFilter, reloadKey]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    setQuery(search);
  };

  const handlePageSizeChange = (event) => {
    setPage(1);
    setPageSize(Number(event.target.value));
  };

  const handleRoleChange = (event) => {
    setPage(1);
    setRoleFilter(event.target.value);
  };

  const handleStatusChange = (event) => {
    setPage(1);
    setStatusFilter(event.target.value);
  };

  const openUpdateModal = (user) => {
    setEditingUser(user);
    setUpdateForm({
      email: user?.email || "",
      password: "",
    });
    setFormError("");
    setShowPassword(false);
    setMenuOpenFor(null);
  };

  const closeUpdateModal = () => {
    setEditingUser(null);
    setUpdateForm(initialUpdateForm);
    setFormError("");
    setShowPassword(false);
  };

  const handleUpdateFormChange = (field, value) => {
    setUpdateForm((current) => ({ ...current, [field]: value }));
  };

  const handleUpdateUser = async () => {
    if (!editingUser) {
      return;
    }

    const trimmedEmail = updateForm.email.trim();
    const trimmedPassword = updateForm.password.trim();

    if (!trimmedEmail && !trimmedPassword) {
      setFormError("Enter a new email or password to update this user.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const response = await superAdminAPI.updateManagedUser(editingUser.id, {
        email: trimmedEmail || undefined,
        password: trimmedPassword || undefined,
      });

      showSuccess(response?.data?.message || "User updated successfully");
      closeUpdateModal();
      setReloadKey((current) => current + 1);
    } catch (submitError) {
      const message = submitError.message || "Failed to update user.";
      setFormError(message);
      showError(submitError, "Failed to update user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (user) => {
    setMenuOpenFor(null);
    const confirmed = window.confirm(
      `Delete ${user?.fullName || "this user"}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await superAdminAPI.deleteManagedUser(user.id);
      showSuccess(response?.data?.message || "User deleted successfully");

      const shouldGoBackOnePage =
        users.length === 1 && pagination.page > 1;

      if (shouldGoBackOnePage) {
        setPage((currentPage) => currentPage - 1);
      } else {
        setReloadKey((current) => current + 1);
      }
    } catch (deleteError) {
      setError(deleteError.message || "Failed to delete user.");
      showError(deleteError, "Failed to delete user.");
    }
  };

  const summaryText = useMemo(() => {
    if (!pagination.total) {
      return "Showing 0-0 of 0";
    }

    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(
      pagination.page * pagination.limit,
      pagination.total
    );

    return `Showing ${start}-${end} of ${pagination.total}`;
  }, [pagination]);

  return (
    <MobileAppFrame
      backgroundColor={containerBg}
      bottomNav={<SuperAdminBottomNav />}
    >
      <div className="relative flex-1 overflow-y-auto px-4 pt-5 pb-4">
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
                Superadmin Controls
              </p>
              <h1
                className="mt-2 text-2xl font-semibold"
                style={{ color: textMain }}
              >
                User Management
              </h1>
              <p className="mt-2 text-sm" style={{ color: textSub }}>
                Manage all users and reset passwords (Super Admin Only)
              </p>
            </div>
          </div>
        </section>

        <section
          className="mt-4 rounded-[22px] px-4 py-4"
          style={{ backgroundColor: cardBg }}
        >
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-3"
          >
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-[18px] border px-4 py-3 text-sm outline-none"
              style={{
                color: textMain,
                backgroundColor: panelBg,
                borderColor,
              }}
            />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="rounded-[16px] border px-3 py-3 text-sm outline-none"
                style={{
                  color: textMain,
                  backgroundColor: panelBg,
                  borderColor,
                }}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>

              <select
                value={roleFilter}
                onChange={handleRoleChange}
                className="rounded-[16px] border px-3 py-3 text-sm outline-none"
                style={{
                  color: textMain,
                  backgroundColor: panelBg,
                  borderColor,
                }}
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>

              <select
                value={statusFilter}
                onChange={handleStatusChange}
                className="rounded-[16px] border px-3 py-3 text-sm outline-none"
                style={{
                  color: textMain,
                  backgroundColor: panelBg,
                  borderColor,
                }}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>

              <button
                type="submit"
                className="rounded-[16px] bg-[#265D6F] px-4 py-3 text-sm font-semibold text-white"
              >
                Search
              </button>
            </div>

            <div className="text-right text-xs font-medium" style={{ color: textSub }}>
              {summaryText}
            </div>
          </form>
        </section>

        <section
          className="mt-4 rounded-[22px] px-4 py-4"
          style={{ backgroundColor: cardBg }}
        >
          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#265D6F] border-t-transparent" />
            </div>
          ) : users.length ? (
            <div className="space-y-3 overflow-x-auto">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="rounded-[20px] px-4 py-4"
                  style={{ backgroundColor: panelBg }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold" style={{ color: textMain }}>
                        {user.fullName}
                      </p>
                      <p className="mt-1 break-all text-xs" style={{ color: textSub }}>
                        {user.email}
                      </p>
                      <div
                        className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.14em]"
                        style={{ color: textSub }}
                      >
                        {user.role ? <span>{user.role}</span> : null}
                        {user.status ? <span>{user.status}</span> : null}
                      </div>
                      <p className="mt-2 text-[11px]" style={{ color: textSub }}>
                        Joined:{" "}
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>

                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setMenuOpenFor((current) =>
                            current === user.id ? null : user.id
                          )
                        }
                        className="rounded-full border border-[#265D6F] px-3 py-1 text-lg font-semibold text-[#265D6F]"
                      >
                        ⋯
                      </button>

                      {menuOpenFor === user.id ? (
                        <div className="absolute right-0 z-10 mt-2 w-40 rounded-[16px] bg-white py-2 shadow-lg">
                          <button
                            type="button"
                            onClick={() => openUpdateModal(user)}
                            className="block w-full px-4 py-2 text-left text-sm text-[#265D6F]"
                          >
                            Update User
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            className="block w-full px-4 py-2 text-left text-sm text-[#9F4B4B]"
                          >
                            Delete User
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[18px] border border-dashed border-[#C4CFD4] px-4 py-8 text-center text-sm text-[#6E828D]">
              No users found.
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={pagination.page <= 1 || isLoading}
              className="rounded-full border border-[#265D6F] px-4 py-2 text-xs font-semibold text-[#265D6F] disabled:opacity-50"
            >
              Previous
            </button>
            <p className="text-xs font-medium" style={{ color: textSub }}>
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  Math.min(pagination.totalPages, current + 1)
                )
              }
              disabled={pagination.page >= pagination.totalPages || isLoading}
              className="rounded-full border border-[#265D6F] px-4 py-2 text-xs font-semibold text-[#265D6F] disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </section>

        {editingUser ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-[360px] rounded-[24px] bg-white p-5 text-[#265D6F] shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Update User</h2>
                  <p className="mt-1 text-xs text-[#6E828D]">
                    Editing {editingUser.fullName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeUpdateModal}
                  className="text-xl leading-none text-[#6E828D]"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-[#265D6F]">
                    New Email
                  </span>
                  <input
                    type="email"
                    value={updateForm.email}
                    onChange={(event) =>
                      handleUpdateFormChange("email", event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-[#C4CFD4] px-3 py-3 text-sm outline-none focus:border-[#265D6F]"
                    placeholder="Leave unchanged or enter new email"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-[#265D6F]">
                    New Password
                  </span>
                  <div className="mt-2 flex rounded-xl border border-[#C4CFD4]">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={updateForm.password}
                      onChange={(event) =>
                        handleUpdateFormChange("password", event.target.value)
                      }
                      className="w-full rounded-l-xl px-3 py-3 text-sm outline-none"
                      placeholder="Leave blank to keep current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="rounded-r-xl px-3 text-xs font-semibold text-[#265D6F]"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>
              </div>

              {formError ? (
                <p className="mt-3 text-xs text-red-600">{formError}</p>
              ) : null}

              <div className="mt-5 flex justify-end gap-3 text-sm font-semibold">
                <button
                  type="button"
                  onClick={closeUpdateModal}
                  className="rounded-full border border-[#265D6F] px-4 py-2 text-[#265D6F]"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateUser}
                  className="rounded-full bg-[#265D6F] px-4 py-2 text-white disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update User"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </MobileAppFrame>
  );
};

export default SuperAdminUserManagementPage;
