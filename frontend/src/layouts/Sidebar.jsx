import { ChevronDown, ChevronRight } from "lucide-react";
import logo from "../assets/logo2.png";
import { getUserInfo } from "../utils/jwt";
import { FiUser, FiBriefcase } from "react-icons/fi";

export default function Sidebar({ children }) {
  const employee = getUserInfo();

  return (
    <>
      <aside className="h-screen w-64 overflow-y-auto hide-scrollbar shadow-md border-r ">
        <nav className="h-full flex flex-col shadow-sm">
          <div className="p-4 pb-2 flex flex-col items-center border-b-2 border-blue-700 bg-gradient-to-tr from-blue-500/20 to-blue-600/50">
            <img
              src={logo}
              className={`overflow-hidden transition-all w-full opacity-90`}
              alt="Company Logo"
            />
            {/* User Info */}
            <div className="bg-transparent p-2 w-full">
              {/* Header with avatar and basic info */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-100 text-blue-600 rounded-full h-10 w-10 flex items-center justify-center">
                  <FiUser className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-gray-900 font-extrabold">
                    {employee?.name}
                  </h3>

                  <p className="text-xs text-gray-800 font-bold">
                    ID: {employee?.employee_id}
                  </p>
                </div>
              </div>

              {/* Details section */}
              <div className="space-y-3">
                <div className="flex items-start">
                  <FiBriefcase className="text-black mr-2 h-4 min-w-4 mt-0.5" />
                  <div className="flex flex-wrap gap-1">
                    {employee?.roles.map((role, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          ["Admin", "General Manager", "Manager"].includes(role)
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ul className="flex-1 px-3">{children}</ul>
        </nav>
      </aside>
    </>
  );
}

export function SidebarItem({
  icon,
  text,
  active,
  alert,
  onClick,
  isDropdown,
  isOpen,
}) {
  return (
    <li
      onClick={onClick}
      className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group ${
        active
          ? "bg-gradient-to-r from-blue-500/80 to-blue-600/80 text-white"
          : "text-blue-800 hover:bg-blue-100"
      }`}
    >
      {icon}
      <span className={`overflow-hidden transition-all w-52 ml-3`}>{text}</span>
      {isDropdown && (
        <div className="text-sm">
          {isOpen ? <ChevronDown /> : <ChevronRight />}
        </div>
      )}
      {alert && (
        <div className={`absolute right-2 w-2 h-2 rounded bg-blue-400`}></div>
      )}
    </li>
  );
}

export function DropdownItem({ text }) {
  return (
    <div className="pl-12 py-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
      {text}
    </div>
  );
}
