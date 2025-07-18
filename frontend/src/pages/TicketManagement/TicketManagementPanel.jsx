import React, { useState } from "react";
import {
  FiClock,
  FiMapPin,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiExternalLink,
  FiSearch,
} from "react-icons/fi";
import AddTicketForm from "./AddTicketForm";

const TicketManagementPanel = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [isNewTicketFormOpen, setIsNewTicketFormOpen] = useState(false);

  const handleOpenNewTicketForm = () => {
    setIsNewTicketFormOpen(true);
  };

  const handleCloseNewTicketForm = () => {
    // refetch();
    setIsNewTicketFormOpen(false);
  };

  const tickets = [
    {
      ticketId: "TKT-2023-001",
      ispTicketId: "ISP-45678",
      siteCode: "SC-001",
      siteAddress: "123 Main St, Tech Park, Bangalore, Karnataka 560001",
      issueTitle: "Network Connectivity Issue",
      issueDescription:
        "Customers reporting intermittent network connectivity in the area since morning. Need immediate resolution.",
      ticketRaisedDate: "2023-05-15T09:30:00",
      priority: "High",
      status: "In Progress",
      assignedTo: "John Doe",
      lastUpdated: "2023-05-16T14:20:00",
    },
    {
      ticketId: "TKT-2023-002",
      ispTicketId: "ISP-45679",
      siteCode: "SC-002",
      siteAddress: "456 Oak Ave, Industrial Area, Mumbai, Maharashtra 400001",
      issueTitle: "Slow Internet Speeds",
      issueDescription:
        "Users complaining about slow internet speeds during peak hours. Speed tests show 50% reduction in throughput.",
      ticketRaisedDate: "2023-05-14T14:15:00",
      priority: "Medium",
      status: "Open",
      assignedTo: "Jane Smith",
      lastUpdated: "2023-05-15T10:45:00",
    },
    {
      ticketId: "TKT-2023-003",
      ispTicketId: null,
      siteCode: "SC-003",
      siteAddress: "789 Pine Rd, Commercial Complex, Delhi 110001",
      issueTitle: "Router Configuration",
      issueDescription:
        "New router needs to be configured for the expanded office space. Requires VLAN setup and QoS configuration.",
      ticketRaisedDate: "2023-05-10T11:00:00",
      priority: "Low",
      status: "Resolved",
      assignedTo: "Mike Johnson",
      lastUpdated: "2023-05-12T16:30:00",
    },
    {
      ticketId: "TKT-2023-004",
      ispTicketId: "ISP-45680",
      siteCode: "SC-004",
      siteAddress: "321 Elm Blvd, Tech Zone, Hyderabad, Telangana 500001",
      issueTitle: "Fiber Cable Damage",
      issueDescription:
        "Reported fiber cable damage due to construction work in the area. Approximately 200m of cable needs replacement.",
      ticketRaisedDate: "2023-05-16T08:45:00",
      priority: "High",
      status: "Open",
      assignedTo: "Sarah Williams",
      lastUpdated: "2023-05-16T09:30:00",
    },
    {
      ticketId: "TKT-2023-005",
      ispTicketId: "ISP-45681",
      siteCode: "SC-005",
      siteAddress: "654 Cedar Ln, Business Park, Chennai, Tamil Nadu 600001",
      issueTitle: "Billing Discrepancy",
      issueDescription:
        "Customer reported incorrect billing for the last month. Overcharged by ₹1,200 for premium services not availed.",
      ticketRaisedDate: "2023-05-12T16:20:00",
      priority: "Medium",
      status: "Closed",
      assignedTo: "David Brown",
      lastUpdated: "2023-05-14T11:15:00",
    },
    {
      ticketId: "TKT-2023-006",
      ispTicketId: null,
      siteCode: "SC-006",
      siteAddress: "987 Maple St, IT Hub, Pune, Maharashtra 411001",
      issueTitle: "New Connection Request",
      issueDescription:
        "Request for new broadband connection for office expansion. Requires 1Gbps dedicated line with static IP addresses.",
      ticketRaisedDate: "2023-05-17T10:10:00",
      priority: "Low",
      status: "Open",
      assignedTo: "Unassigned",
      lastUpdated: "2023-05-17T10:10:00",
    },
  ];

  // Filter tickets based on active filter and search term
  const filteredTickets = tickets.filter((ticket) => {
    const matchesFilter =
      activeFilter === "all" ||
      ticket.status.toLowerCase() === activeFilter.toLowerCase() ||
      ticket.priority.toLowerCase() === activeFilter.toLowerCase();

    const matchesSearch =
      searchTerm === "" ||
      Object.values(ticket).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

    return matchesFilter && matchesSearch;
  });

  // Priority styling
  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-500/10 text-red-600 border-red-200";
      case "medium":
        return "bg-amber-500/10 text-amber-600 border-amber-200";
      case "low":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  // Status styling
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-blue-500/10 text-blue-600";
      case "in progress":
        return "bg-purple-500/10 text-purple-600";
      case "resolved":
        return "bg-emerald-500/10 text-emerald-600";
      case "closed":
        return "bg-gray-500/10 text-gray-600";
      default:
        return "bg-gray-500/10 text-gray-600";
    }
  };

  // Status icon
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "open":
        return <FiAlertCircle className="mr-1" />;
      case "in progress":
        return <FiClock className="mr-1" />;
      case "resolved":
      case "closed":
        return <FiCheckCircle className="mr-1" />;
      default:
        return <FiInfo className="mr-1" />;
    }
  };

  // Format date with time
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container pb-8">
      {isNewTicketFormOpen && (
        <AddTicketForm handleClose={handleCloseNewTicketForm} />
      )}
      {/* <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Ticket Management
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredTickets.length}{" "}
            {filteredTickets.length === 1 ? "ticket" : "tickets"} found
          </p>
        </div>

        <div className="mt-4 md:mt-0 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tickets..."
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div> */}

      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 whitespace-nowrap">
              Ticket Directory
            </h2>
            <p className="text-gray-600 mt-1">
              {filteredTickets.length}{" "}
              {filteredTickets.length === 1 ? "ticket" : "tickets"} found
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search with advanced filter dropdown */}
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search tickets..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              onClick={handleOpenNewTicketForm}
              className="whitespace-nowrap px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              New Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 my-4 px-4">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeFilter === "all"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All Tickets
        </button>
        <button
          onClick={() => setActiveFilter("high")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeFilter === "high"
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          High Priority
        </button>
        <button
          onClick={() => setActiveFilter("open")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeFilter === "open"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Open
        </button>
        <button
          onClick={() => setActiveFilter("in progress")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeFilter === "in progress"
              ? "bg-purple-100 text-purple-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          In Progress
        </button>
        <button
          onClick={() => setActiveFilter("resolved")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeFilter === "resolved"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Resolved
        </button>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center px-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FiInfo className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-1">
            No tickets found
          </h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.ticketId}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border-1 border-gray-800 flex flex-col"
            >
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span
                      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {getStatusIcon(ticket.status)}
                      {ticket.status}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getPriorityColor(
                      ticket.priority
                    )}`}
                  >
                    {ticket.priority} priority
                  </span>
                </div>

                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  {ticket.issueTitle}
                </h2>

                <p className="text-gray-600 text-sm mb-4 flex-1">
                  {ticket.issueDescription}
                </p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FiMapPin className="mr-2 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{ticket.siteAddress}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Ticket ID</p>
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {ticket.ticketId}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">ISP Ticket ID</p>
                      <p className="text-sm font-medium text-gray-700">
                        {formatDate(ticket.lastUpdated)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Assigned To</p>
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {ticket.assignedTo}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Raised On</p>
                      <p className="text-sm font-medium text-gray-700">
                        {formatDate(ticket.ticketRaisedDate)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
                  <button className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                    <FiExternalLink className="mr-1" />
                    View Details
                  </button>
                  <span className="text-xs text-gray-500">
                    {ticket.siteCode}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketManagementPanel;
