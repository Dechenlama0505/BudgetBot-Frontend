import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import InsightPage from "./pages/InsightPage";
import AddSpendingPage from "./pages/AddSpendingPage";
import CategoriesPage from "./pages/CategoriesPage";
import ProfilePage from "./pages/ProfilePage";
import CreateAccount from "./pages/CreateAccountPage";
import EditProfilePage from "./pages/EditProfilePage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminActivityPage from "./pages/AdminActivityPage";
import AdminAllMembersPage from "./pages/AdminAllMembersPage";
import AdminMembersPage from "./pages/AdminMembersPage";
import AdminProfilePage from "./pages/AdminProfilePage";
import SuperAdminDashboardPage from "./pages/SuperAdminDashboardPage";
import SuperAdminActivityPage from "./pages/SuperAdminActivityPage";
import SuperAdminAllMembersPage from "./pages/SuperAdminAllMembersPage";
import SuperAdminMembersPage from "./pages/SuperAdminMembersPage";
import SuperAdminAdminsPage from "./pages/SuperAdminAdminsPage";
import SuperAdminProfilePage from "./pages/SuperAdminProfilePage";
import { ExpenseProvider } from "./context/ExpenseContext";
import UserRoute from "./routes/UserRoute";
import AdminRoute from "./routes/AdminRoute";
import SuperAdminRoute from "./routes/SuperAdminRoute";
import AuthenticatedRoute from "./routes/AuthenticatedRoute";

const App = () => {
  return (
    <ExpenseProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/createaccount" element={<CreateAccount />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<AuthenticatedRoute />}>
          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Route>

        <Route element={<UserRoute />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/insight" element={<InsightPage />} />
          <Route path="/addspending" element={<AddSpendingPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/edit-profile" element={<EditProfilePage />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/activity" element={<AdminActivityPage />} />
          <Route path="/admin/all-members" element={<AdminAllMembersPage />} />
          <Route path="/admin/members" element={<AdminMembersPage />} />
          <Route path="/admin/profile" element={<AdminProfilePage />} />
        </Route>

        <Route element={<SuperAdminRoute />}>
          <Route
            path="/superadmin/dashboard"
            element={<SuperAdminDashboardPage />}
          />
          <Route
            path="/superadmin/activity"
            element={<SuperAdminActivityPage />}
          />
          <Route
            path="/superadmin/all-members"
            element={<SuperAdminAllMembersPage />}
          />
          <Route
            path="/superadmin/members"
            element={<SuperAdminMembersPage />}
          />
          <Route
            path="/superadmin/admins"
            element={<SuperAdminAdminsPage />}
          />
          <Route
            path="/superadmin/profile"
            element={<SuperAdminProfilePage />}
          />
        </Route>
      </Routes>
      <ToastContainer newestOnTop />
    </ExpenseProvider>
  );
};

export default App;
