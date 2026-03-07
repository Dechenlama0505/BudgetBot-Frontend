import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import InsightPage from "./pages/InsightPage";
import AddSpendingPage from "./pages/AddSpendingPage";
import CategoriesPage from "./pages/CategoriesPage";
import ProfilePage from "./pages/ProfilePage";
import CreateAccount from "./pages/CreateAccountPage";
import EditProfilePage from "./pages/EditProfilePage";
import { ExpenseProvider } from "./context/ExpenseContext";

const App = () => {
  return (
    <ExpenseProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/createaccount" element={<CreateAccount />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/insight" element={<InsightPage />} />
        <Route path="/addspending" element={<AddSpendingPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/edit-profile" element={<EditProfilePage />} />
      </Routes>
    </ExpenseProvider>
  );
};

export default App;