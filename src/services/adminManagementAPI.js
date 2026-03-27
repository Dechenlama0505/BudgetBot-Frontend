const STORAGE_KEY = "bb_admins_collection";

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

    return {
      data: {
        admin: updatedAdmin,
      },
    };
  },

  deleteAdmin: async (adminId) => {
    await wait();
    writeAdmins(readAdmins().filter((admin) => admin.id !== adminId));

    return {
      data: {
        success: true,
      },
    };
  },
};
