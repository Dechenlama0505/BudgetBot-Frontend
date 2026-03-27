const STORAGE_KEY = "bb_admins_collection";
const ACTIVITY_KEY = "bb_admins_activity";

const defaultAdmins = [
  {
    id: "adm_001",
    fullName: "Sofia Carter",
    email: "sofia@gmail.com",
    role: "admin",
    status: "active",
  },
  {
    id: "adm_002",
    fullName: "Daniel Brooks",
    email: "daniel@gmail.com",
    role: "admin",
    status: "active",
  },
];

const defaultActivity = [
  {
    id: "adm_act_001",
    type: "admin created",
    message: `Admin "Dechen" was created`,
    createdAt: "2026-03-27T09:20:00.000Z",
  },
  {
    id: "adm_act_002",
    type: "admin updated",
    message: `Admin "Sofia" was updated`,
    createdAt: "2026-03-26T16:10:00.000Z",
  },
];

const wait = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const readAdmins = () => {
  const rawAdmins = localStorage.getItem(STORAGE_KEY);

  if (!rawAdmins) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultAdmins));
    return defaultAdmins;
  }

  try {
    return JSON.parse(rawAdmins);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultAdmins));
    return defaultAdmins;
  }
};

const writeAdmins = (admins) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(admins));
  return admins;
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
      id: `adm_act_${Date.now()}`,
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

const filterAdmins = (admins, search = "") => {
  const normalized = search.trim().toLowerCase();

  if (!normalized) return admins;

  return admins.filter((admin) => {
    return (
      admin.fullName.toLowerCase().includes(normalized) ||
      admin.email.toLowerCase().includes(normalized) ||
      admin.status.toLowerCase().includes(normalized)
    );
  });
};

export const adminManagementAPI = {
  listAdmins: async (search = "") => {
    await wait();
    return {
      data: {
        admins: filterAdmins(readAdmins(), search),
      },
    };
  },

  createAdmin: async (adminData) => {
    await wait();

    const admins = readAdmins();
    const newAdmin = {
      id: `adm_${Date.now()}`,
      fullName: adminData.fullName.trim(),
      email: adminData.email.trim(),
      role: "admin",
      status: adminData.status || "active",
    };

    writeAdmins([newAdmin, ...admins]);
    addActivity("admin created", `Admin "${getShortName(newAdmin.fullName)}" was created`);

    return {
      data: {
        admin: newAdmin,
      },
    };
  },

  updateAdmin: async (adminId, adminData) => {
    await wait();

    let updatedAdmin = null;

    const admins = readAdmins().map((admin) => {
      if (admin.id !== adminId) return admin;

      updatedAdmin = {
        ...admin,
        fullName: adminData.fullName.trim(),
        email: adminData.email.trim(),
        status: adminData.status || admin.status,
      };

      return updatedAdmin;
    });

    writeAdmins(admins);

    if (updatedAdmin) {
      addActivity("admin updated", `Admin "${getShortName(updatedAdmin.fullName)}" was updated`);
    }

    return {
      data: {
        admin: updatedAdmin,
      },
    };
  },

  deleteAdmin: async (adminId) => {
    await wait();
    const admin = readAdmins().find((entry) => entry.id === adminId);
    writeAdmins(readAdmins().filter((entry) => entry.id !== adminId));

    if (admin) {
      addActivity("admin deleted", `Admin "${getShortName(admin.fullName)}" was deleted`);
    }

    return {
      data: {
        success: true,
      },
    };
  },

  listRecentActivity: async (limit = 3) => {
    await wait();

    return {
      data: {
        activity: readActivity().slice(0, limit),
      },
    };
  },
};
