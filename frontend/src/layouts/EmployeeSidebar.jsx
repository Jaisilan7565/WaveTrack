import React, { useState } from "react";
import { LayoutDashboard, LogOut } from "lucide-react";
import { GoOrganization } from "react-icons/go";
import { FaUsers } from "react-icons/fa";
import { AiOutlineAlert } from "react-icons/ai";
import { IoTicketSharp } from "react-icons/io5";
import { MdInventory, MdOutlineAdminPanelSettings } from "react-icons/md";
import { Podcast } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Sidebar, { SidebarItem, DropdownItem } from "./Sidebar";
import { logoutAPI } from "../services/authServices";
import { getUserRoles } from "../utils/jwt";
import { hasPermission } from "../utils/auth";

const EmployeeSidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const userRoles = getUserRoles();

  //HR and Higher Authority
  const HRPermission = hasPermission(
    ["Admin", "General Manager", "Manager", "Senior HR", "HR"],
    userRoles
  );

  //Finance and Higher Authority
  const FinancePermission = hasPermission(
    ["Admin", "General Manager", "Manager", "Finance"],
    userRoles
  );

  //Technical Team and Higher Authority
  const TLStaffPermission = hasPermission(
    ["Admin", "General Manager", "Manager", "Team Lead", "Staff"],
    userRoles
  );

  const location = useLocation();
  const path = location.pathname;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isSubscriberOpen, setIsSubscriberOpen] = useState(false);

  const toggleSubscriberDropdown = () => {
    setIsSubscriberOpen(!isSubscriberOpen);
  };

  const logoutHandler = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logoutAPI();
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-md z-40
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:relative
        `}
      >
        {/* ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} */}
        <Sidebar>
          <Link to="/">
            <SidebarItem
              icon={<LayoutDashboard size={30} />}
              text="Dashboard"
              onClick={() => setSidebarOpen(false)}
              active={path === "/"}
            />
          </Link>

          {/* <Link to="/subscribers">
            <SidebarItem
              icon={<Podcast size={30} />}
              text="Subscribers"
              onClick={toggleSubscriberDropdown}
              isDropdown
              isOpen={isSubscriberOpen}
              active={
                path === "/subscribers" || path.startsWith("/subscribers/")
              }
            />
          </Link>
          {isSubscriberOpen && (
            <>
              <Link to="/subscribers-history">
                <DropdownItem
                  text="Subscribers History"
                  onClick={() => setSidebarOpen(false)}
                />
              </Link>
            </>
          )} */}

          {FinancePermission && (
            <Link to="/subscriber-management">
              <SidebarItem
                icon={<Podcast size={30} />}
                text="Subscribers"
                // onClick={toggleSubscriberDropdown}
                onClick={() => setSidebarOpen(false)}
                isDropdown
                isOpen={isSubscriberOpen}
                active={
                  path === "/subscriber-management" ||
                  path.startsWith("/subscriber/")
                }
              />
            </Link>
          )}

          {/* {FinancePermission && (
            <Link to="/subscribers-alert">
              <SidebarItem
                icon={<AiOutlineAlert size={30} />}
                text="Subscription Tracker"
                active={
                  path === "/subscribers-alert" ||
                  path.startsWith("/subscribers-alert/")
                }
                onClick={() => setSidebarOpen(false)}
              />
            </Link>
          )}

          {TLStaffPermission && (
            <Link to="/order-dashboard">
              <SidebarItem
                icon={<LayoutDashboard size={30} />}
                text="Orders"
                active={
                  path === "/order-dashboard" ||
                  path.startsWith("/order-dashboard/")
                }
                onClick={() => setSidebarOpen(false)}
              />
            </Link>
          )} 
          {TLStaffPermission && (
            <Link to="/isp-management">
              <SidebarItem
                icon={<GoOrganization size={30} />}
                text="Vendor Management"
                active={
                  path === "/isp-management" ||
                  path.startsWith("/isp-management/")
                }
                onClick={() => setSidebarOpen(false)}
              />
            </Link>
          )}

          {FinancePermission && (
            <Link to="/inventory-management">
              <SidebarItem
                icon={<MdInventory size={30} />}
                text="Stocks & Inventory"
                active={
                  path === "/inventory-management" ||
                  path.startsWith("/inventory-management/")
                }
                onClick={() => setSidebarOpen(false)}
              />
            </Link>
          )} */}

          {HRPermission && (
            <Link to="/employee-management">
              <SidebarItem
                icon={<FaUsers size={30} />}
                text="User Management"
                active={
                  path === "/employee-management" ||
                  path.startsWith("/employee-management/")
                }
                onClick={() => setSidebarOpen(false)}
              />
            </Link>
          )}

          <Link to="/tickets">
            <SidebarItem
              icon={<IoTicketSharp size={30} />}
              text="Ticket Management"
              active={path === "/tickets" || path.startsWith("/tickets")}
              onClick={() => setSidebarOpen(false)}
            />
          </Link>

          <hr className="my-3" />

          <SidebarItem
            icon={<LogOut size={30} />}
            text="Logout"
            onClick={logoutHandler}
          />
        </Sidebar>
      </div>
    </>
  );
};

export default EmployeeSidebar;
