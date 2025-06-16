import { Routes, Route, useLocation } from "react-router-dom";
import EmployeeSidebar from "./EmployeeSidebar";
import TopBar from "./TopBar";
import React, { useState } from "react";
import NotFoundPage from "./NotFoundPage";
import EmployeeManagementPanel from "../pages/EmployeeManagement/EmployeeManagementPanel";
import LoginPage from "../pages/Auth/LoginPage";
import AuthRoute from "../pages/Auth/AuthRoute";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { login } from "../redux/store/authSlice";
import useAutoLogout from "../hooks/useAutoLogout";
import { decodeToken, isTokenExpired } from "../utils/jwt";
import SubscriberManagementPanel from "../pages/SubscriberManagement/SubscriberManagementPanel";
import MainDashboard from "../pages/Dashboard/MainDashboard";

const MainLayout = () => {
  const location = useLocation();

  const dispatch = useDispatch();

  // Restore auth state on app load
  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token && !isTokenExpired(token)) {
      const user = decodeToken(token);
      dispatch(login({ token, user }));
    }
  }, [dispatch]);

  // Enable auto-logout
  useAutoLogout();

  const noSidebarRoutes = ["/login"];
  const shouldShowSidebar = !noSidebarRoutes.includes(location.pathname);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const paths = [
    { path: "/employee-management", name: "Employee Management" },
    { path: "/", name: "Dashboard" },
    { path: "/subscriber-management", name: "Subscriber Management" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {shouldShowSidebar && (
        <EmployeeSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      )}

      <div className="flex-1 flex flex-col overflow-y-auto hide-scrollbar">
        <div className="sticky top-0 w-full">
          {shouldShowSidebar && (
            <TopBar
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              pageTitle={paths.find((p) => p.path === location.pathname)?.name}
            />
          )}
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <AuthRoute>
                  <MainDashboard />
                </AuthRoute>
              }
            />
            <Route
              path="/employee-management"
              element={
                <AuthRoute>
                  <EmployeeManagementPanel />
                </AuthRoute>
              }
            />
            <Route
              path="/subscriber-management"
              element={
                <AuthRoute>
                  <SubscriberManagementPanel />
                </AuthRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
