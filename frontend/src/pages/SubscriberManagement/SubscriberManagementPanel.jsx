import React from "react";
import { FiFilter, FiSearch } from "react-icons/fi";
import { useState } from "react";
import AddSubscriberForm from "./AddSubscriberForm";

const SubscriberManagementPanel = () => {
  const [isNewSubscriberFormOpen, setIsNewSubscriberFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState(0);
  const [filters, setFilters] = useState({
    status: "",
    role: "",
  });

  const clearFilters = () => {
    setFilters({ status: "", role: "" });
    setSearchTerm("");
  };

  const handleOpenNewSubscriberForm = () => {
    setIsNewSubscriberFormOpen(true);
  };

  const handleCloseNewSubscriberForm = () => {
    // refetch();
    setIsNewSubscriberFormOpen(false);
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-fit">
      {isNewSubscriberFormOpen && (
        <AddSubscriberForm handleClose={handleCloseNewSubscriberForm} />
      )}

      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 whitespace-nowrap">
            Subscriber Directory
          </h2>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search with advanced filter dropdown */}
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search subscribers..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {/* Filter Button */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <button
                  onClick={() =>
                    document
                      .getElementById("filter-dropdown")
                      .classList.toggle("hidden")
                  }
                  className={`p-1 rounded-full ${
                    activeFilters > 0
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-400 hover:text-gray-500"
                  }`}
                  title="Filters"
                >
                  <div className="relative">
                    <FiFilter className="h-5 w-5" />
                    {activeFilters > 0 && (
                      <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {activeFilters}
                      </span>
                    )}
                  </div>
                </button>
              </div>

              {/* Filter Dropdown */}
              <div
                id="filter-dropdown"
                className="hidden absolute left-0 sm:left-auto sm:right-0 mt-1 w-full sm:w-64 bg-white rounded-md shadow-lg z-20 p-3 border"
              >
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      className="w-full border rounded-md p-2 text-sm"
                      value={filters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                    >
                      <option value="">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="InActive">Inactive</option>
                      <option value="OnProcess">On Process</option>
                      <option value="Modified">Modified</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      className="w-full border rounded-md p-2 text-sm"
                      value={filters.role}
                      onChange={(e) =>
                        handleFilterChange("role", e.target.value)
                      }
                    >
                      <option value="">All Roles</option>
                      <option value="Admin">Admin</option>
                      <option value="General Manager">General Manager</option>
                      <option value="Manager">Manager</option>
                      <option value="Senior HR">Senior HR</option>
                      <option value="HR">HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Team Lead">Team Lead</option>
                      <option value="Staff">Staff</option>
                    </select>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Clear Filters
                    </button>
                    <button
                      onClick={() =>
                        document
                          .getElementById("filter-dropdown")
                          .classList.add("hidden")
                      }
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleOpenNewSubscriberForm}
              className="whitespace-nowrap px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Subscriber
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
        {/* Operation Features - Responsive */}
        <div className="w-full flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
          {/* Left Button Group */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button className="flex-1 sm:flex-none whitespace-nowrap px-3 py-2 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm sm:text-base">
              Import Subscribers
            </button>
            <button className="flex-1 sm:flex-none whitespace-nowrap px-3 py-2 sm:px-4 sm:py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 text-sm sm:text-base">
              Export Subscribers
            </button>
            <button className="flex-1 sm:flex-none whitespace-nowrap px-3 py-2 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-sm sm:text-base">
              Delete
            </button>
          </div>

          {/* Right Button Group */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button className="flex-1 sm:flex-none whitespace-nowrap px-3 py-2 sm:px-4 sm:py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm sm:text-base">
              Approve
            </button>
            <button className="flex-1 sm:flex-none whitespace-nowrap px-3 py-2 sm:px-4 sm:py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 text-sm sm:text-base">
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriberManagementPanel;
