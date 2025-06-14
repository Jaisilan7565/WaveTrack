import React, { useEffect } from "react";
import { useState } from "react";
import AddSubscriberForm from "./AddSubscriberForm";
import { getSubscribersAPI } from "../../services/subscriberServices";
import { useQuery } from "@tanstack/react-query";
import {
  FiFilter,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiCheck,
  FiX,
} from "react-icons/fi";
import AddSubscribersExcel from "./AddSubscribersExcel";
import NoData from "../../components/NoData";

const SubscriberManagementPanel = () => {
  const [isNewSubscriberFormOpen, setIsNewSubscriberFormOpen] = useState(false);
  const [isSubscribersExcelOpen, setIsSubscribersExcelOpen] = useState(false);

  const [loadingApprove, setLoadingApprove] = useState(null);
  const [loadingReject, setLoadingReject] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
  });
  const [activeFilters, setActiveFilters] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const {
    data: subscribers,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryFn: getSubscribersAPI,
    queryKey: ["getSubscribers"],
    refetchOnWindowFocus: true,
  });

  // Filter and sort employees
  const processedSubscribers = React.useMemo(() => {
    if (!subscribers?.data) return [];

    let result = [...subscribers.data];

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (sub) =>
          sub.subscriber_id.toLowerCase().includes(term) ||
          sub.siteCode.toLowerCase().includes(term) ||
          sub.siteName.toLowerCase().includes(term) ||
          sub.siteAddress.toLowerCase().includes(term) ||
          sub.ispInfo?.broadbandPlan.toLowerCase().includes(term)
      );
    }

    // Apply filters
    if (filters.status) {
      result = result.filter((sub) => sub.status === filters.status);
    }

    // Apply date range filter
    if (filters.startDate || filters.endDate) {
      result = result.filter((sub) => {
        const subDate = new Date(sub.activationDate.split("T")[0]);
        const startDate = filters.startDate
          ? new Date(filters.startDate)
          : null;
        const endDate = filters.endDate ? new Date(filters.endDate) : null;

        // Set time to midnight for proper comparison
        if (startDate) startDate.setHours(0, 0, 0, 0);
        if (endDate) endDate.setHours(23, 59, 59, 999);

        const afterStart = !startDate || subDate >= startDate;
        const beforeEnd = !endDate || subDate <= endDate;

        return afterStart && beforeEnd;
      });
    }

    const getNestedValue = (obj, path) =>
      path.split(".").reduce((o, k) => o?.[k] ?? "", obj);

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        // First sort by request_status (pending first)
        if (a.request_status === "pending" && b.request_status !== "pending") {
          return -1;
        }
        if (a.request_status !== "pending" && b.request_status === "pending") {
          return 1;
        }

        if (
          a.request_status === "rejected" &&
          b.request_status !== "rejected"
        ) {
          return -1;
        }
        if (
          a.request_status !== "rejected" &&
          b.request_status === "rejected"
        ) {
          return 1;
        }

        const aVal = getNestedValue(a, sortConfig.key);
        const bVal = getNestedValue(b, sortConfig.key);

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortConfig.direction === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        // if (a[sortConfig.key] < b[sortConfig.key]) {
        //   return sortConfig.direction === "asc" ? -1 : 1;
        // }
        // if (a[sortConfig.key] > b[sortConfig.key]) {
        //   return sortConfig.direction === "asc" ? 1 : -1;
        // }
        return 0;
      });
    } else {
      // Default sort: pending first, then by createdAt (newest first)
      result.sort((a, b) => {
        // Pending first
        if (a.request_status === "pending" && b.request_status !== "pending") {
          return -1;
        }
        if (a.request_status !== "pending" && b.request_status === "pending") {
          return 1;
        }

        // Then by createdAt (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    return result;
  }, [subscribers, searchTerm, filters, sortConfig]);

  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedSubscribers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(processedSubscribers.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters, sortConfig]);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (filters.status) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    setActiveFilters(count);
  }, [filters]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const clearFilters = () => {
    setFilters({ status: "", startDate: "", endDate: "" });
    setSearchTerm("");
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? <FiChevronUp /> : <FiChevronDown />;
  };

  const handleOpenNewSubscriberForm = () => {
    setIsNewSubscriberFormOpen(true);
  };

  const handleCloseNewSubscriberForm = () => {
    refetch();
    setIsNewSubscriberFormOpen(false);
  };

  const handleOpenSubscribersExcel = () => {
    setIsSubscribersExcelOpen(true);
  };

  const handleCloseSubscribersExcel = () => {
    refetch();
    setIsSubscribersExcelOpen(false);
  };

  const [selectedRows, setSelectedRows] = useState([]);

  const handleSelectRow = (e, id) => {
    if (e.target.checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(processedSubscribers.map((item) => item._id));
    } else {
      setSelectedRows([]);
    }
  };

  if (isLoading)
    return <div className="flex justify-center py-8">Loading...</div>;
  if (error)
    return (
      <div className="text-red-500 text-center py-8">
        Error: {error.message}
      </div>
    );

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-fit">
      {isNewSubscriberFormOpen && (
        <AddSubscriberForm handleClose={handleCloseNewSubscriberForm} />
      )}

      {isSubscribersExcelOpen && (
        <AddSubscribersExcel handleClose={handleCloseSubscribersExcel} />
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
              {/* <div
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
                      <option value="Added">Added</option>
                      <option value="Active">Active</option>
                      <option value="InActive">Inactive</option>
                      <option value="Modified">Modified</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 items-start sm:items-end">
                    <div className="w-full sm:w-auto">
                      <label className="block text-sm font-medium text-gray-700">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) =>
                          handleFilterChange("startDate", e.target.value)
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        max={filters.endDate || undefined} // Prevent selecting start date after end date
                      />
                    </div>

                    <div className="w-full sm:w-auto">
                      <label className="block text-sm font-medium text-gray-700">
                        To Date
                      </label>
                      <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) =>
                          handleFilterChange("endDate", e.target.value)
                        }
                        min={filters.startDate || undefined} // Ensure end date can't be before start date
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>

                    {(filters.startDate || filters.endDate) && (
                      <button
                        onClick={() =>
                          setFilters({ ...filters, startDate: "", endDate: "" })
                        }
                        className="w-full sm:w-auto px-3 py-1.5 text-sm bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                      >
                        Clear Dates
                      </button>
                    )}
                  </div>

                  <div className="w-full max-w-sm">
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                      Items per page:{" "}
                      <span className="text-blue-600 font-bold">
                        {itemsPerPage}
                      </span>
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      step="5"
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
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
              </div> */}
              <div
                id="filter-dropdown"
                className="hidden absolute left-0 sm:left-auto sm:right-0 mt-1 w-full sm:w-80 bg-white rounded-md shadow-lg z-20 p-3 border"
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
                      <option value="Added">Added</option>
                      <option value="Active">Active</option>
                      <option value="InActive">Inactive</option>
                      <option value="Modified">Modified</option>
                    </select>
                  </div>

                  {/* Improved Date Range Filter */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          From Date
                        </label>
                        <input
                          type="date"
                          value={filters.startDate}
                          onChange={(e) =>
                            handleFilterChange("startDate", e.target.value)
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
                          max={filters.endDate || undefined}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          To Date
                        </label>
                        <input
                          type="date"
                          value={filters.endDate}
                          onChange={(e) =>
                            handleFilterChange("endDate", e.target.value)
                          }
                          min={filters.startDate || undefined}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
                        />
                      </div>
                    </div>
                    {(filters.startDate || filters.endDate) && (
                      <button
                        onClick={() =>
                          setFilters({ ...filters, startDate: "", endDate: "" })
                        }
                        className="w-full text-sm py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        Clear Dates
                      </button>
                    )}
                  </div>

                  <div className="w-full">
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                      Items per page:{" "}
                      <span className="text-blue-600 font-bold">
                        {itemsPerPage}
                      </span>
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      step="5"
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-between pt-2">
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

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Operation Features - Responsive */}
        <div className="w-full flex flex-col mb-2 sm:flex-row justify-between gap-3 sm:gap-0">
          {/* Left Button Group */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              className="flex-1 sm:flex-none whitespace-nowrap px-3 py-2 sm:px-4 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm sm:text-base"
              onClick={handleOpenSubscribersExcel}
            >
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

        {/* Subscriber List Table */}
        <div className="hidden sm:block bg-white shadow-xl rounded-xl overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-600 to-blue-500">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.length === processedSubscribers.length &&
                      processedSubscribers.length > 0
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("subscriber_id")}
                >
                  Sub ID {getSortIcon("subscriber_id")}
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("siteName")}
                >
                  Site Name {getSortIcon("siteName")}
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("siteCode")}
                >
                  Site Code {getSortIcon("siteCode")}
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("siteAddress")}
                >
                  Address {getSortIcon("siteAddress")}
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("ispInfo.broadbandPlan")}
                >
                  Plan {getSortIcon("ispInfo.broadbandPlan")}
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("ispInfo.numberOfMonths")}
                >
                  Months {getSortIcon("ispInfo.numberOfMonths")}
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("ispInfo.mrc")}
                >
                  MRC {getSortIcon("ispInfo.mrc")}
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("activationDate")}
                >
                  Activated {getSortIcon("activationDate")}
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("status")}
                >
                  Status {getSortIcon("status")}
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs sm:text-sm font-semibold text-white uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-6 text-gray-500">
                    <NoData
                      title="No Employees Found"
                      description="Try adjusting your search or filters"
                    />
                  </td>
                </tr>
              ) : (
                currentItems.map((subscriber) => (
                  <tr
                    key={subscriber.subscriber_id}
                    className={
                      selectedRows.includes(subscriber.subscriber_id)
                        ? "bg-blue-100"
                        : ""
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(subscriber._id)}
                        onChange={(e) => handleSelectRow(e, subscriber._id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {subscriber.subscriber_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subscriber.siteName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subscriber.siteCode}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {subscriber.siteAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subscriber.ispInfo.broadbandPlan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {subscriber.ispInfo.numberOfMonths}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{subscriber.ispInfo.mrc}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {/* {new Date(subscriber.activationDate).toLocaleDateString()} */}
                      {subscriber.activationDate?.split("T")[0]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${
                      subscriber.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                      >
                        {subscriber.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="p-1.5 text-green-600 hover:bg-green-500 hover:text-white rounded-md transition-colors"
                        title="Approve"
                        onClick={() =>
                          handleApprove(
                            subscriber._id,
                            subscriber.status,
                            subscriber
                          )
                        }
                        disabled={loadingApprove === subscriber._id}
                      >
                        {loadingApprove === subscriber._id ? (
                          <Loader className="h-5 w-5" />
                        ) : (
                          <FiCheck className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        className="p-1.5 text-red-600 hover:bg-red-500 hover:text-white rounded-md transition-colors"
                        title="Reject"
                        onClick={() =>
                          handleReject(
                            subscriber._id,
                            subscriber.status,
                            subscriber
                          )
                        }
                        disabled={loadingReject === subscriber._id}
                      >
                        {loadingReject === subscriber._id ? (
                          <Loader className="h-5 w-5" />
                        ) : (
                          <FiX className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden space-y-3">
          {currentItems.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <NoData
                title="No Employees Found"
                description="Try adjusting your search or filters"
              />
            </div>
          ) : (
            currentItems.map((subscriber) => (
              <div
                key={subscriber.subscriber_id}
                className={`bg-white p-4 rounded-lg border-2 ${
                  selectedRows.includes(subscriber.subscriber_id)
                    ? "border-blue-500"
                    : "border-gray-200"
                }`}
              >
                {/* Header Row */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(subscriber._id)}
                      onChange={(e) => handleSelectRow(e, subscriber._id)}
                      className="h-4 w-4 text-blue-600 mr-2"
                    />
                    <span className="font-medium">
                      ID: {subscriber.subscriber_id}
                    </span>
                  </div>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
          ${
            subscriber.status === "Active"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
                  >
                    {subscriber.status}
                  </span>
                </div>

                {/* Main Content */}
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Site</p>
                    <p className="font-medium">
                      {subscriber.siteName} ({subscriber.siteCode})
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-gray-700">{subscriber.siteAddress}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div>
                      <p className="text-sm text-gray-500">Plan</p>
                      <p className="font-medium">
                        {subscriber.ispInfo.broadbandPlan}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Months</p>
                      <p className="font-medium">
                        {subscriber.ispInfo.numberOfMonths}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">MRC</p>
                      <p className="font-medium">₹{subscriber.ispInfo.mrc}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Activated</p>
                    <p className="text-gray-700">
                      {subscriber.activationDate?.split("T")[0]}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 mt-3 pt-3 border-t border-gray-100">
                  <button
                    className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center justify-center"
                    onClick={() =>
                      handleApprove(
                        subscriber._id,
                        subscriber.status,
                        subscriber
                      )
                    }
                    disabled={loadingApprove === subscriber._id}
                  >
                    {loadingApprove === subscriber._id ? (
                      <Loader className="h-4 w-4 mr-1" />
                    ) : (
                      <FiCheck className="h-4 w-4 mr-1" />
                    )}
                    Approve
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center justify-center"
                    onClick={() =>
                      handleReject(
                        subscriber._id,
                        subscriber.status,
                        subscriber
                      )
                    }
                    disabled={loadingReject === subscriber._id}
                  >
                    {loadingReject === subscriber._id ? (
                      <Loader className="h-4 w-4 mr-1" />
                    ) : (
                      <FiX className="h-4 w-4 mr-1" />
                    )}
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {processedSubscribers.length > 0 && (
          <div className="mt-6 bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 rounded-b-lg shadow-sm sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Previous
              </button>
              <span className="text-sm text-gray-700 mx-4 flex items-center">
                {/* Page {currentPage} of {totalPages} */}
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">{indexOfFirstItem + 1}</span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, processedSubscribers.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {processedSubscribers.length}
                    </span>{" "}
                    results
                  </p>
                </div>
              </span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </div>

            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, processedSubscribers.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {processedSubscribers.length}
                  </span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <FiChevronLeft className="h-5 w-5" />
                  </button>

                  {/* Page numbers */}
                  {(() => {
                    const pages = [];
                    const maxVisiblePages = 5;
                    let startPage, endPage;

                    if (totalPages <= maxVisiblePages) {
                      startPage = 1;
                      endPage = totalPages;
                    } else {
                      const maxPagesBeforeCurrent = Math.floor(
                        maxVisiblePages / 2
                      );
                      const maxPagesAfterCurrent =
                        Math.ceil(maxVisiblePages / 2) - 1;

                      if (currentPage <= maxPagesBeforeCurrent) {
                        startPage = 1;
                        endPage = maxVisiblePages;
                      } else if (
                        currentPage + maxPagesAfterCurrent >=
                        totalPages
                      ) {
                        startPage = totalPages - maxVisiblePages + 1;
                        endPage = totalPages;
                      } else {
                        startPage = currentPage - maxPagesBeforeCurrent;
                        endPage = currentPage + maxPagesAfterCurrent;
                      }
                    }

                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => paginate(i)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === i
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                    return pages;
                  })()}

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <FiChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriberManagementPanel;
