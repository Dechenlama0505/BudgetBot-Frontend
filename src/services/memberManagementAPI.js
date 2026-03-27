const STORAGE_KEY = "bb_members_collection";
const ACTIVITY_KEY = "bb_members_activity";

const defaultMembers = [
  {
    id: "mem_001",
    fullName: "Aarav Sharma",
    email: "aarav@gmail.com",
    role: "user",
    status: "active",
  },
  {
    id: "mem_002",
    fullName: "Nisha Thapa",
    email: "nisha@gmail.com",
    role: "user",
    status: "pending",
  },
  {
    id: "mem_003",
    fullName: "Maya Singh",
    email: "maya@gmail.com",
    role: "user",
    status: "inactive",
  },
];

const defaultActivity = [
  {
    id: "act_001",
    type: "member approved",
    message: "Nisha -> active",
    createdAt: "2026-03-27T08:15:00.000Z",
  },
  {
    id: "act_002",
    type: "member updated",
    message: "Maya -> updated",
    createdAt: "2026-03-26T14:30:00.000Z",
  },
  {
    id: "act_003",
    type: "member added",
    message: "Aarav -> added",
    createdAt: "2026-03-26T09:05:00.000Z",
  },
];

const wait = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const readMembers = () => {
  const rawMembers = localStorage.getItem(STORAGE_KEY);

  if (!rawMembers) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMembers));
    return defaultMembers;
  }

  try {
    return JSON.parse(rawMembers);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMembers));
    return defaultMembers;
  }
};

const writeMembers = (members) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  return members;
};

const readActivity = () => {
  const rawActivity = localStorage.getItem(ACTIVITY_KEY);

  if (!rawActivity) {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(defaultActivity));
    return defaultActivity;
  }

  try {
    return JSON.parse(rawActivity);
  } catch {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(defaultActivity));
    return defaultActivity;
  }
};

const writeActivity = (activity) => {
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity));
  return activity;
};

const addActivity = (type, message) => {
  const nextActivity = [
    {
      id: `act_${Date.now()}`,
      type,
      message,
      createdAt: new Date().toISOString(),
    },
    ...readActivity(),
  ].slice(0, 10);

  writeActivity(nextActivity);
};

const getShortName = (fullName = "") => {
  return fullName.trim().split(" ")[0] || fullName;
};

const normalizeListArgs = (searchOrOptions) => {
  if (typeof searchOrOptions === "string") {
    return {
      search: searchOrOptions,
      status: "all",
    };
  }

  return {
    search: searchOrOptions?.search || "",
    status: searchOrOptions?.status || "all",
  };
};

const filterMembers = (members, search = "", status = "all") => {
  const normalizedSearch = search.trim().toLowerCase();

  return members.filter((member) => {
    const matchesSearch =
      !normalizedSearch ||
      member.fullName.toLowerCase().includes(normalizedSearch) ||
      member.email.toLowerCase().includes(normalizedSearch) ||
      member.status.toLowerCase().includes(normalizedSearch);

    const matchesStatus = status === "all" || member.status === status;

    return matchesSearch && matchesStatus;
  });
};

export const memberManagementAPI = {
  listMembers: async (searchOrOptions = "") => {
    await wait();

    const { search, status } = normalizeListArgs(searchOrOptions);

    return {
      data: {
        members: filterMembers(readMembers(), search, status),
      },
    };
  },

  getMemberById: async (memberId) => {
    await wait();

    return {
      data: {
        member: readMembers().find((member) => member.id === memberId) || null,
      },
    };
  },

  createMember: async (memberData) => {
    await wait();

    const members = readMembers();
    const newMember = {
      id: `mem_${Date.now()}`,
      fullName: memberData.fullName.trim(),
      email: memberData.email.trim(),
      role: "user",
      status: memberData.status || "active",
    };

    writeMembers([newMember, ...members]);
    addActivity("member added", `${getShortName(newMember.fullName)} -> added`);

    return {
      data: {
        member: newMember,
      },
    };
  },

  updateMember: async (memberId, memberData) => {
    await wait();

    let updatedMember = null;

    const members = readMembers().map((member) => {
      if (member.id !== memberId) return member;

      updatedMember = {
        ...member,
        fullName: memberData.fullName.trim(),
        email: memberData.email.trim(),
        status: memberData.status || member.status,
      };

      return updatedMember;
    });

    writeMembers(members);
    if (updatedMember) {
      addActivity("member updated", `${getShortName(updatedMember.fullName)} -> updated`);
    }

    return {
      data: {
        member: updatedMember,
      },
    };
  },

  changeMemberStatus: async (memberId, nextStatus) => {
    await wait();

    let updatedMember = null;

    const members = readMembers().map((member) => {
      if (member.id !== memberId) return member;

      updatedMember = {
        ...member,
        status: nextStatus,
      };

      return updatedMember;
    });

    writeMembers(members);

    if (updatedMember) {
      addActivity(`member marked ${nextStatus}`, `${getShortName(updatedMember.fullName)} -> ${nextStatus}`);
    }

    return {
      data: {
        member: updatedMember,
      },
    };
  },

  approveMember: async (memberId) => {
    await wait();

    let approvedMember = null;

    const members = readMembers().map((member) => {
      if (member.id !== memberId) return member;

      approvedMember = {
        ...member,
        status: "active",
      };

      return approvedMember;
    });

    writeMembers(members);

    if (approvedMember) {
      addActivity("member approved", `${getShortName(approvedMember.fullName)} -> active`);
    }

    return {
      data: {
        member: approvedMember,
      },
    };
  },

  rejectMember: async (memberId) => {
    await wait();

    let rejectedMember = null;

    const members = readMembers().map((member) => {
      if (member.id !== memberId) return member;

      rejectedMember = {
        ...member,
        status: "inactive",
      };

      return rejectedMember;
    });

    writeMembers(members);

    if (rejectedMember) {
      addActivity("member rejected", `${getShortName(rejectedMember.fullName)} -> inactive`);
    }

    return {
      data: {
        member: rejectedMember,
      },
    };
  },

  deleteMember: async (memberId) => {
    await wait();
    const member = readMembers().find((entry) => entry.id === memberId);
    writeMembers(readMembers().filter((entry) => entry.id !== memberId));

    if (member) {
      addActivity("member deleted", `${getShortName(member.fullName)} -> deleted`);
    }

    return {
      data: {
        success: true,
      },
    };
  },

  listRecentActivity: async (limit = 4) => {
    await wait();

    return {
      data: {
        activity: readActivity().slice(0, limit),
      },
    };
  },
};
