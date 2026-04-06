import React, { useEffect, useState } from "react";
import MobileAppFrame from "../components/MobileAppFrame";
import SuperAdminBottomNav from "../components/SuperAdminBottomNav";
import EntityFormModal from "../components/EntityFormModal";
import { memberManagementAPI } from "../services/memberManagementAPI";
import { useTheme } from "../context/ThemeContext";
import { showError, showSuccess } from "../utils/toastUtils";

const initialForm = {
  fullName: "",
  email: "",
  status: "active",
};

const fields = [
  { name: "fullName", label: "Full Name", placeholder: "Enter full name" },
  { name: "email", label: "E-mail", type: "email", placeholder: "Enter e-mail" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "pending", label: "Pending" },
      { value: "inactive", label: "Inactive" },
    ],
  },
];

const SuperAdminMembersPage = () => {
  const { darkMode } = useTheme();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [formValues, setFormValues] = useState(initialForm);

  const loadMembers = async (searchValue = "") => {
    setIsLoading(true);
    setError("");

    try {
      const response = await memberManagementAPI.listMembers(searchValue);
      setMembers(response.data?.members || []);
    } catch (loadError) {
      setError(loadError.message || "Failed to load members.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers(search);
  }, [search]);

  const openCreateModal = () => {
    setEditingMemberId(null);
    setFormValues(initialForm);
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (member) => {
    setEditingMemberId(member.id);
    setFormValues({
      fullName: member.fullName,
      email: member.email,
      status: member.status,
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

    setIsSubmitting(true);
    setFormError("");

    try {
      if (editingMemberId) {
        const response = await memberManagementAPI.updateMember(
          editingMemberId,
          formValues
        );
        showSuccess(response.data?.message || "Member updated successfully");
      } else {
        const response = await memberManagementAPI.createMember(formValues);
        showSuccess(response.data?.message || "Member created successfully");
      }

      closeModal();
      loadMembers(search);
    } catch (submitError) {
      setFormError(showError(submitError, "Failed to save member."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (memberId) => {
    const confirmed = window.confirm("Delete this member?");
    if (!confirmed) return;

    try {
      const response = await memberManagementAPI.deleteMember(memberId);
      showSuccess(response.data?.message || "Member deleted successfully");
      loadMembers(search);
    } catch (deleteError) {
      setError(showError(deleteError, "Failed to delete member."));
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
                Superadmin Members
              </p>
              <h1 className="mt-2 text-2xl font-semibold" style={{ color: textMain }}>
                Manage Members
              </h1>
              <p className="mt-2 text-sm" style={{ color: textSub }}>
                Full CRUD for member accounts with the same card and form patterns.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-full bg-[#265D6F] px-4 py-2 text-xs font-semibold text-white"
            >
              Add Member
            </button>
          </div>
        </section>

        <section className="mt-4 rounded-[22px] px-4 py-4" style={{ backgroundColor: cardBg }}>
          <div className="rounded-[18px] border border-[#C4CFD4] px-4 py-3">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search members by name, email, or status"
              className="w-full bg-transparent text-sm outline-none"
              style={{ color: textMain }}
            />
          </div>

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

          {isLoading ? (
            <div className="mt-5 flex justify-center py-10">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#265D6F] border-t-transparent" />
            </div>
          ) : members.length ? (
            <div className="mt-4 space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="rounded-[20px] px-4 py-3"
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

                  <div className="mt-2.5 flex items-center justify-end">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(member)}
                        className="rounded-full border border-[#265D6F] px-3 py-1 text-xs font-semibold text-[#265D6F]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(member.id)}
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
              No members found.
            </div>
          )}
        </section>

        {showModal ? (
          <EntityFormModal
            title={editingMemberId ? "Update Member" : "Add Member"}
            fields={fields}
            values={formValues}
            error={formError}
            isSubmitting={isSubmitting}
            submitLabel={editingMemberId ? "Update" : "Create"}
            onChange={handleChange}
            onClose={closeModal}
            onSubmit={handleSubmit}
          />
        ) : null}
      </div>
    </MobileAppFrame>
  );
};

export default SuperAdminMembersPage;
