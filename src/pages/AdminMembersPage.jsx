import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import MobileAppFrame from "../components/MobileAppFrame";
import AdminBottomNav from "../components/AdminBottomNav";
import EntityFormModal from "../components/EntityFormModal";
import { memberManagementAPI } from "../services/memberManagementAPI";
import { useTheme } from "../context/ThemeContext";
import { showError, showSuccess } from "../utils/toastUtils";

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  status: "active",
};

const getFields = (isEditing) => {
  const baseFields = [
    { name: "fullName", label: "Full Name", placeholder: "Enter full name" },
    { name: "email", label: "E-mail", type: "email", placeholder: "Enter e-mail" },
  ];

  if (!isEditing) {
    baseFields.push({
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Enter password",
    });
  }

  baseFields.push({
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
  });

  return baseFields;
};

const AdminMembersPage = () => {
  const location = useLocation();
  const { darkMode } = useTheme();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [pendingDeleteMember, setPendingDeleteMember] = useState(null);
  const [formValues, setFormValues] = useState(initialForm);

  const loadMembers = useCallback(async (searchValue = search, nextStatus = statusFilter) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await memberManagementAPI.listMembers({
        search: searchValue,
        status: nextStatus,
      });
      const nextMembers = (response.data?.members || []).filter(
        (member) => member.status !== "pending"
      );

      setMembers(nextMembers);

      if (location.state?.openView && location.state?.selectedMemberId) {
        const preselectedMember = nextMembers.find(
          (member) => member.id === location.state.selectedMemberId
        );

        if (preselectedMember) {
          setSelectedMember(preselectedMember);
          setShowViewModal(true);
        }
      }
    } catch (loadError) {
      setError(loadError.message || "Failed to load members.");
    } finally {
      setIsLoading(false);
    }
  }, [location.state, search, statusFilter]);

  useEffect(() => {
    loadMembers(search, statusFilter);
  }, [loadMembers, search, statusFilter]);

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
      password: "",
      status: member.status,
    });
    setFormError("");
    setShowModal(true);
  };

  const openDeleteModal = (member) => {
    setPendingDeleteMember(member);
  };

  const openViewModal = async (memberId) => {
    try {
      const response = await memberManagementAPI.getMemberById(memberId);
      setSelectedMember(response.data?.member || null);
      setShowViewModal(true);
    } catch (loadError) {
      setError(loadError.message || "Failed to load member details.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormError("");
    setFormValues(initialForm);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedMember(null);
  };

  const handleEditFromView = () => {
    if (!selectedMember) return;
    setShowViewModal(false);
    openEditModal(selectedMember);
  };

  const handleDeleteFromView = () => {
    if (!selectedMember) return;
    setShowViewModal(false);
    openDeleteModal(selectedMember);
  };

  const handleChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formValues.fullName.trim()) return "Full name is required.";
    if (!formValues.email.trim()) return "E-mail is required.";
    if (!editingMemberId && !formValues.password.trim()) {
      return "Password is required.";
    }
    return "";
  };

  const handleSubmit = async () => {
    const validationMessage = validateForm();

    if (validationMessage) {
      setFormError(validationMessage);
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
        const updatedMember = response.data?.member || null;
        showSuccess(response.data?.message || "Member updated successfully");

        if (updatedMember && selectedMember?.id === editingMemberId) {
          setSelectedMember(updatedMember);
        }
      } else {
        const response = await memberManagementAPI.createMember(formValues);
        showSuccess(response.data?.message || "Member created successfully");
      }

      closeModal();
      loadMembers();
    } catch (submitError) {
      setFormError(showError(submitError, "Failed to save member."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!pendingDeleteMember) return;
    try {
      const response = await memberManagementAPI.deleteMember(
        pendingDeleteMember.id
      );
      if (selectedMember?.id === pendingDeleteMember.id) {
        setSelectedMember(null);
        setShowViewModal(false);
      }
      setPendingDeleteMember(null);
      showSuccess(response.data?.message || "Member deleted successfully");
      loadMembers();
    } catch (deleteError) {
      setError(showError(deleteError, "Failed to delete member."));
    }
  };

  const handleStatusChange = async (memberId, nextStatus) => {
    try {
      const response = await memberManagementAPI.changeMemberStatus(
        memberId,
        nextStatus
      );
      const updatedMember = response.data?.member || null;
      showSuccess(response.data?.message || "Member status updated successfully");

      if (updatedMember && selectedMember?.id === memberId) {
        setSelectedMember(updatedMember);
      }

      loadMembers();
    } catch (statusError) {
      setError(showError(statusError, "Failed to update member status."));
    }
  };

  const containerBg = darkMode ? "#1E3A45" : "#E0E6E7";
  const cardBg = darkMode ? "#274956" : "#A8B7C0";
  const panelBg = darkMode ? "#21414D" : "#E0E6E7";
  const textMain = darkMode ? "#E4EDF2" : "#265D6F";
  const textSub = darkMode ? "#C2D3DB" : "#6E828D";
  const filterOptions = ["all", "active", "inactive"];

  return (
    <MobileAppFrame backgroundColor={containerBg} bottomNav={<AdminBottomNav />}>
      <div className="relative flex-1 overflow-y-auto px-4 pt-5 pb-4">
        <section className="rounded-[28px] px-5 py-5" style={{ backgroundColor: cardBg }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em]" style={{ color: textSub }}>
                Admin Members
              </p>
              <h1 className="mt-2 text-2xl font-semibold" style={{ color: textMain }}>
                Manage Members
              </h1>
              <p className="mt-2 text-sm" style={{ color: textSub }}>
                Add, update, and delete member accounts in the same mobile-style flow.
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

          <div className="mt-4 flex flex-wrap gap-2">
            {filterOptions.map((option) => {
              const isActive = statusFilter === option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStatusFilter(option)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold capitalize ${
                    isActive ? "bg-[#265D6F] text-white" : "bg-[#E0E6E7] text-[#265D6F]"
                  }`}
                >
                  {option}
                </button>
              );
            })}
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
                    <button
                      type="button"
                      onClick={() => openViewModal(member.id)}
                      className="flex-1 text-left"
                    >
                      <p className="text-sm font-semibold" style={{ color: textMain }}>
                        {member.fullName}
                      </p>
                      <p className="mt-1 text-xs" style={{ color: textSub }}>
                        {member.email}
                      </p>
                    </button>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="rounded-full bg-[#D8EEE5] px-3 py-1 text-[11px] font-semibold text-[#215C42]">
                        {member.status}
                      </span>
                      <select
                        value={member.status}
                        onChange={(event) =>
                          handleStatusChange(member.id, event.target.value)
                        }
                        className="rounded-full border border-[#C4CFD4] bg-white px-3 py-2 text-xs font-semibold text-[#265D6F] outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openViewModal(member.id)}
                      className="rounded-full border border-[#265D6F] px-3 py-1 text-xs font-semibold text-[#265D6F]"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(member)}
                      className="rounded-full border border-[#265D6F] px-3 py-1 text-xs font-semibold text-[#265D6F]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => openDeleteModal(member)}
                      className="rounded-full bg-[#9F4B4B] px-3 py-1 text-xs font-semibold text-white"
                    >
                      Delete
                    </button>
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
            fields={getFields(Boolean(editingMemberId))}
            values={formValues}
            error={formError}
            isSubmitting={isSubmitting}
            submitLabel={editingMemberId ? "Update" : "Create"}
            onChange={handleChange}
            onClose={closeModal}
            onSubmit={handleSubmit}
          />
        ) : null}

        {showViewModal && selectedMember ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-[340px] rounded-[24px] bg-white p-5 text-[#265D6F] shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Member Details</h2>
                <button
                  type="button"
                  onClick={closeViewModal}
                  className="text-xl leading-none text-[#6E828D]"
                >
                  ×
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs text-[#6E828D]">Full Name</p>
                  <p className="mt-1 text-sm font-semibold">{selectedMember.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6E828D]">E-mail</p>
                  <p className="mt-1 text-sm font-semibold">{selectedMember.email}</p>
                </div>
                <div>
                  <p className="text-xs text-[#6E828D]">Status</p>
                  <p className="mt-1 text-sm font-semibold capitalize">
                    {selectedMember.status}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6E828D]">Role</p>
                  <p className="mt-1 text-sm font-semibold capitalize">
                    {selectedMember.role || "user"}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={handleEditFromView}
                  className="rounded-full border border-[#265D6F] px-4 py-2 text-sm font-semibold text-[#265D6F]"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDeleteFromView}
                  className="rounded-full bg-[#9F4B4B] px-4 py-2 text-sm font-semibold text-white"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={closeViewModal}
                  className="rounded-full bg-[#265D6F] px-4 py-2 text-sm font-semibold text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {pendingDeleteMember ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-[340px] rounded-[24px] bg-white p-5 text-[#265D6F] shadow-xl">
              <h2 className="text-lg font-semibold">Delete Member</h2>
              <p className="mt-3 text-sm text-[#6E828D]">
                Are you sure you want to delete {pendingDeleteMember.fullName}?
              </p>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPendingDeleteMember(null)}
                  className="rounded-full border border-[#265D6F] px-4 py-2 text-sm font-semibold text-[#265D6F]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-full bg-[#9F4B4B] px-4 py-2 text-sm font-semibold text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </MobileAppFrame>
  );
};

export default AdminMembersPage;
