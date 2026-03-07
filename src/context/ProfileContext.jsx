// src/context/ProfileContext.jsx
import React, { createContext, useContext, useState } from "react";

const ProfileContext = createContext(null);

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState({
    fullName: "User",
    email: "user email",
    monthlyIncome: "60,000",
    photo: null,
  });

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
