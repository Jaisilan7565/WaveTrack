import {
  FiEdit,
  FiSearch,
  FiFilter,
  FiDownload,
  FiPlus,
  FiChevronUp,
  FiChevronDown,
} from "react-icons/fi";
import { useEffect, useRef, useState } from "react";

const PaymentEntriesTable = ({ payments }) => {
  const [horizontalScroll, setHorizontalScroll] = useState(0);
  const tableRef = useRef(null);
  const div1Ref = useRef(null);
  const [div1Height, setDiv1Height] = useState(0);

  useEffect(() => {
    if (div1Ref.current) {
      setDiv1Height(div1Ref.current.offsetHeight);
    }

    const handleResize = () => {
      if (div1Ref.current) {
        setDiv1Height(div1Ref.current.offsetHeight);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleScroll = (direction) => {
    const table = tableRef.current;
    if (table) {
      const scrollAmount = 200; // Adjust this value as needed
      if (direction === "left") {
        table.scrollLeft -= scrollAmount;
      } else {
        table.scrollLeft += scrollAmount;
      }
      setHorizontalScroll(table.scrollLeft);
    }
  };

  const exportToExcel = () => {
    // Implement your Excel export logic here
    console.log("Exporting to Excel:", processedPayments);
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "activationDate",
    direction: "asc",
  });

  const processedPayments = payments
    .filter((payment) => {
      const matchesSearch =
        payment.subscriberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.amountPaid.toString().includes(searchTerm);
      const matchesStatus =
        statusFilter === "all" || payment.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Table Controls */}
      <div
        ref={div1Ref}
        className="sticky top-0 bg-white z-20 p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div className="flex items-center w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center">
            <FiFilter className="text-gray-500 mr-2" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FiDownload /> <span className="hidden sm:inline">Export</span>
          </button>

          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <FiPlus /> <span className="hidden sm:inline">Add Payment</span>
          </button>
        </div>
      </div>

      {/* Mobile Table Container */}
      <div className="relative">
        {/* Scroll buttons for mobile */}
        {horizontalScroll > 0 && (
          <button
            onClick={() => handleScroll("left")}
            className="absolute left-2 top-1/2 z-10 bg-white border border-gray-300 rounded-full p-2 shadow-md transform -translate-y-1/2"
          >
            <FiChevronUp className="rotate-90" />
          </button>
        )}

        <div
          ref={tableRef}
          className="overflow-x-auto hide-scrollbar"
          onScroll={(e) => setHorizontalScroll(e.target.scrollLeft)}
        >
          {/* Table */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead
              className="bg-gray-50 sticky top-0 z-10"
              // style={{ top: `${div1Height}px` }}
            >
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer min-w-[120px]"
                  onClick={() => requestSort("activationDate")}
                >
                  <div className="flex items-center">
                    <span className="truncate">Activation</span>
                    {sortConfig.key === "activationDate" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? (
                          <FiChevronUp size={14} />
                        ) : (
                          <FiChevronDown size={14} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer min-w-[120px]"
                  onClick={() => requestSort("renewalDate")}
                >
                  <div className="flex items-center">
                    <span className="truncate">Renewal</span>
                    {sortConfig.key === "renewalDate" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? (
                          <FiChevronUp size={14} />
                        ) : (
                          <FiChevronDown size={14} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                  <span className="truncate">Subscriber</span>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer min-w-[100px]"
                  onClick={() => requestSort("amountPaid")}
                >
                  <div className="flex items-center">
                    <span className="truncate">Amount</span>
                    {sortConfig.key === "amountPaid" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? (
                          <FiChevronUp size={14} />
                        ) : (
                          <FiChevronDown size={14} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer min-w-[90px]"
                  onClick={() => requestSort("status")}
                >
                  <div className="flex items-center">
                    <span className="truncate">Status</span>
                    {sortConfig.key === "status" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? (
                          <FiChevronUp size={14} />
                        ) : (
                          <FiChevronDown size={14} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">
                  <span className="truncate">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processedPayments.length > 0 ? (
                processedPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 min-w-[120px]">
                      <span className="truncate">
                        {formatDate(payment.activationDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 min-w-[120px]">
                      <span className="truncate">
                        {formatDate(payment.renewalDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 min-w-[100px]">
                      <span className="truncate">{payment.subscriberId}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 min-w-[100px]">
                      <span className="truncate">
                        ₹{payment.amountPaid.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap min-w-[90px]">
                      <span
                        className={`px-2 py-1 text-xs rounded-full truncate ${
                          payment.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {payment.status.charAt(0).toUpperCase() +
                          payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium min-w-[80px]">
                      <button
                        onClick={() => handleEditPayment(payment._id)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <FiEdit className="inline" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-4 text-center text-sm text-gray-500"
                  >
                    No payment entries found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {tableRef.current &&
          tableRef.current.scrollWidth > tableRef.current.clientWidth &&
          horizontalScroll <
            tableRef.current.scrollWidth - tableRef.current.clientWidth && (
            <button
              onClick={() => handleScroll("right")}
              className="absolute right-2 top-1/2 z-10 bg-white border border-gray-300 rounded-full p-2 shadow-md transform -translate-y-1/2"
            >
              <FiChevronUp className="-rotate-90" />
            </button>
          )}
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to{" "}
            <span className="font-medium">10</span> of{" "}
            <span className="font-medium">{processedPayments.length}</span>{" "}
            results
          </div>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="px-3 py-1 border border-blue-500 bg-blue-50 text-blue-600 rounded-md text-sm font-medium">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              2
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentEntriesTable;
