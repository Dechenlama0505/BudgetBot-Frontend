import React, { useEffect, useState } from "react";
import MobileAppFrame from "../components/MobileAppFrame";
import SuperAdminBottomNav from "../components/SuperAdminBottomNav";
import EntityFormModal from "../components/EntityFormModal";
import { adminManagementAPI } from "../services/adminManagementAPI";
import { useTheme } from "../context/ThemeContext";
import { showError, showSuccess } from "../utils/toastUtils";

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  role: "admin",
  status: "active",
};

const getFields = (isEditing) => {
  const fields = [
    { name: "fullName", label: "Full Name", placeholder: "Enter full name" },
    { name: "email", label: "E-mail", type: "email", placeholder: "Enter e-mail" },
  ];

  if (isEditing) {
    fields.push({
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    });
  } else {
    fields.push({
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Enter password",
    });
    fields.push({
      name: "role",
      label: "Role",
      type: "select",
      options: [
        { value: "admin", label: "Admin" },
        { value: "superadmin", label: "Super Admin" },
      ],
    });
  }

  return fields;
};

const SuperAdminAdminsPage = () => {
  const { darkMode } = useTheme();
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formValues, setFormValues] = useState(initialForm);

  const loadAccounts = async (searchValue = "") => {
    setIsLoading(true);
    setError("");

    try {
      const response = await adminManagementAPI.listAdmins(searchValue);
      setAccounts(response.data?.admins || []);
    } catch (loadError) {
      setError(loadError.message || "Failed to load accounts.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts(search);
  }, [search]);

  const openCreateModal = () => {
    setEditingAccount(null);
    setFormValues(initialForm);
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (account) => {
    setEditingAccount(account);
    setFormValues({
      fullName: account.fullName,
      email: account.email,
      password: "",
      role: account.role,
      status: account.status,
    });
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormError("");
    setFormValues(initialForm);
  };

  const handleChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formValues.fullName.trim() || !formValues.email.trim()) {
      setFormError("Full name and e-mail are required.");
      return;
    }

    if (!editingAccount && !formValues.password.trim()) {
      setFormError("Password is required.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      if (editingAccount) {
        const response = await adminManagementAPI.updateAdmin(
          editingAccount.id,
          {
            ...formValues,
            role: editingAccount.role,
          }
        );
        showSuccess(
          response.data?.message ||
          `${editingAccount.role === "superadmin" ? "Super admin" : "Admin"} updated successfully`
        );
      } else {
        const response = await adminManagementAPI.createAdmin(formValues);
        showSuccess(
          response.data?.message ||
          `${formValues.role === "superadmin" ? "Super admin" : "Admin"} created successfully`
        );
      }

      closeModal();
      loadAccounts(search);
    } catch (submitError) {
      setFormError(showError(submitError, "Failed to save account."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (account) => {
    const label = account.role === "superadmin" ? "super admin" : "admin";
    const confirmed = window.confirm(`Delete this ${label}?`);
    if (!confirmed) return;

    try {
      const response = await adminManagementAPI.deleteAdmin(account.id, account.role);
      showSuccess(
        response.data?.message ||
        `${account.role === "superadmin" ? "Super admin" : "Admin"} deleted successfully`
      );
      loadAccounts(search);
    } catch (deleteError) {
      setError(showError(deleteError, "Failed to delete account."));
    }
  };

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
      <div className="relative flex-1 overflow-y-auto px-4 pt-5 pb-4">
        <section className="rounded-[28px] px-5 py-5" style={{ backgroundColor: cardBg }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em]" style={{ color: textSub }}>
                Superadmin Accounts
              </p>
              <h1 className="mt-2 text-2xl font-semibold" style={{ color: textMain }}>
                Manage Admin Accounts
              </h1>
              <p className="mt-2 text-sm" style={{ color: textSub }}>
                Create, update, and delete admin and super admin accounts.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-full bg-[#265D6F] px-4 py-2 text-xs font-semibold text-white"
            >
              Add Account
            </button>
          </div>
        </section>

        <section className="mt-4 rounded-[22px] px-4 py-4" style={{ backgroundColor: cardBg }}>
          <div className="rounded-[18px] border border-[#C4CFD4] px-4 py-3">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search accounts by name, email, role, or status"
              className="w-full bg-transparent text-sm outline-none"
              style={{ color: textMain }}
            />
          </div>

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

          {isLoading ? (
            <div className="mt-5 flex justify-center py-10">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#265D6F] border-t-transparent" />
            </div>
          ) : accounts.length ? (
            <div className="mt-4 space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="rounded-[20px] px-4 py-3"
                  style={{ backgroundColor: panelBg }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: textMain }}>
                        {account.fullName}
                      </p>
                      <p className="mt-1 text-xs" style={{ color: textSub }}>
                        {account.email}
                      </p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: textSub }}>
                        {account.role}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#D8EEE5] px-3 py-1 text-[11px] font-semibold text-[#215C42]">
                      {account.status}
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-end">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(account)}
                        className="rounded-full border border-[#265D6F] px-3 py-1 text-xs font-semibold text-[#265D6F]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(account)}
                        className="rounded-full bg-[#9F4B4B] px-3 py-1 text-xs font-semibold text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[18px] border border-dashed border-[#C4CFD4] px-4 py-8 text-center text-sm text-[#6E828D]">
              No accounts found.
            </div>
          )}
        </section>

        {showModal ? (
          <EntityFormModal
            title={editingAccount ? "Update Account" : "Add Account"}
            fields={getFields(Boolean(editingAccount))}
            values={formValues}
            error={formError}
            isSubmitting={isSubmitting}
            submitLabel={editingAccount ? "Update" : "Create"}
            onChange={handleChange}
            onClose={closeModal}
            onSubmit={handleSubmit}
          />
        ) : null}
      </div>
    </MobileAppFrame>
  );
};

export default SuperAdminAdminsPage;
