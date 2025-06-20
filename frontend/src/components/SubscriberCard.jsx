import { useEffect, useState } from "react";
import { FiUser, FiWifi, FiCalendar, FiMapPin, FiEdit } from "react-icons/fi";
import UpdateSubscriberForm from "../pages/SubscriberManagement/Subscriber/UpdateSubscriberForm";
import UserHoverCard from "./UserHoverCard";

const SubscriberCard = ({ subscriber, refetch }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const fieldDisplayNames = {
    // Site Information
    siteName: "Site Name",
    siteCode: "Site Code",
    siteAddress: "Site Address",

    // Local Contact
    "localContact.name": "Local Contact Name",
    "localContact.contact": "Local Contact Number",

    // ISP Information
    "ispInfo.name": "ISP Provider",
    "ispInfo.contact": "ISP Contact",
    "ispInfo.broadbandPlan": "Broadband Plan",
    "ispInfo.numberOfMonths": "Number of Months",
    "ispInfo.otc": "OTC",
    "ispInfo.mrc": "MRC",

    // Credentials
    "credentials.username": "Username",
    "credentials.password": "Password",
  };

  function getDisplayName(fieldPath) {
    // Check if we have a direct mapping
    if (fieldDisplayNames[fieldPath]) {
      return fieldDisplayNames[fieldPath];
    }

    // Fallback transformation for unlisted fields
    return fieldPath
      .split(".") // Split nested paths
      .map(
        (part) =>
          part
            .replace(/([A-Z])/g, " $1") // Add space before capitals
            .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
            .replace(/Of|And|The/gi, (match) => match.toLowerCase()) // Handle special words
      )
      .join(" "); // Join with spaces
  }

  const [hoveredUser, setHoveredUser] = useState({
    modifiedBy: null,
    subscriberId: null,
  });

  useEffect(() => {
    console.log("Hovered User Updated:", hoveredUser);
  }, [hoveredUser]);

  const [isUpdateSubscriberFormOpen, setIsUpdateSubscriberFormOpen] =
    useState(false);

  const [selectedSubscriberId, setSelectedSubscriberId] = useState(null);

  const handleEdit = async (id) => {
    setSelectedSubscriberId(id);
    setIsUpdateSubscriberFormOpen(true);
  };

  const handleCloseEdit = () => {
    refetch();
    setSelectedSubscriberId(null);
    setIsUpdateSubscriberFormOpen(false);
  };

  return (
    <div className="bg-white h-fit rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition duration-300">
      {isUpdateSubscriberFormOpen && (
        <UpdateSubscriberForm
          id={selectedSubscriberId}
          handleClose={handleCloseEdit}
        />
      )}
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 px-4 py-2 text-white w-full flex items-center justify-between">
        <div>
          <div className="space-x-2">
            <span className="text-lg font-bold">{subscriber?.siteName}</span>
            <span className="text-md opacity-90 font-medium">
              ( {subscriber?.siteCode} )
            </span>
          </div>
          <div className="bg-blue-100 text-blue-700 px-1 rounded text-sm font-mono w-fit">
            ID: {subscriber?.subscriber_id}
          </div>
        </div>
        <div>
          <button
            className="p-1.5 text-white-600 hover:bg-white hover:text-blue-500 rounded-md transition-colors"
            title="Edit"
            onClick={() => handleEdit(subscriber?._id)}
          >
            <FiEdit className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Address */}
        <div className="flex items-start">
          <FiMapPin className="text-gray-400 mt-1 mr-2" />
          <p className="text-sm text-gray-700">{subscriber?.siteAddress}</p>
        </div>
        {/* Grid info */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          {/* Contact Info */}
          <div className="bg-gray-50 rounded-lg p-2 border">
            <h4 className="flex items-center font-semibold text-gray-700 mb-1">
              <FiUser className="mr-2" /> Local Contact
            </h4>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Name:</span>{" "}
              {subscriber?.localContact?.name}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Contact:</span>{" "}
              {subscriber?.localContact?.contact}
            </p>
          </div>

          {/* ISP Info */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h4 className="flex items-center font-semibold text-gray-700 mb-2">
              <FiWifi className="mr-2" /> ISP Details
            </h4>
            <div className="space-y-2 grid grid-cols-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Provider:</span>{" "}
                {subscriber?.ispInfo?.name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Contact:</span>{" "}
                {subscriber?.ispInfo?.contact}
              </p>

              <p className="text-sm text-gray-600">
                <span className="font-medium">Plan:</span>{" "}
                {subscriber?.ispInfo?.broadbandPlan}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Months:</span>{" "}
                {subscriber?.ispInfo?.numberOfMonths}
              </p>

              <p className="text-sm text-gray-600">
                <span className="font-medium">OTC:</span> ₹{" "}
                {subscriber?.ispInfo?.otc}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">MRC:</span> ₹{" "}
                {subscriber?.ispInfo?.mrc}
              </p>
            </div>
          </div>

          {/* Dates + Status */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h4 className="flex items-center font-semibold text-gray-700 mb-2">
              <FiCalendar className="mr-2" /> Dates & Status
            </h4>
            <div className="space-y-2 grid grid-cols-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Delivered:</span>{" "}
                {formatDate(subscriber?.activationDate)}
              </p>
              <p className="text-sm text-gray-600 flex items-center">
                <span className="font-medium mr-1">Status:</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-md font-medium ${
                    subscriber?.status === "Active"
                      ? "bg-green-100 text-green-800" // Green for active
                      : subscriber?.status === "InActive"
                      ? "bg-red-100 text-red-800" // Red for inactive
                      : subscriber?.status === "Added"
                      ? "bg-blue-100 text-blue-800" // Blue for in-process
                      : subscriber?.status === "Rejected"
                      ? "bg-rose-100 text-rose-800" // Rose/deep pink for rejected
                      : subscriber?.status === "Deleted"
                      ? "bg-gray-200 text-gray-800" // Gray for deleted
                      : subscriber?.status === "Modified"
                      ? "bg-amber-100 text-amber-800" // Amber/orange for modified
                      : "bg-gray-100 text-gray-800" // Default fallback
                  }`}
                >
                  {subscriber?.status}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Activation:</span>{" "}
                {formatDate(
                  subscriber?.ispInfo?.currentActivationDate.split("T")[0]
                )}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Renewal:</span>{" "}
                {formatDate(subscriber?.ispInfo?.renewalDate)}
              </p>
            </div>
          </div>
        </div>
        {/* Created / Updated / ID */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-xs text-gray-500 relative">
            <p>
              Created By:{" "}
              <span
                className="text-blue-500 hover:underline hover:cursor-pointer"
                onMouseEnter={() => {
                  setHoveredUser({
                    modifiedBy: subscriber?.created_by,
                    subscriberId: subscriber?._id,
                  });
                }}
                onMouseLeave={() =>
                  setHoveredUser({
                    modifiedBy: null,
                    subscriberId: null,
                  })
                }
              >
                {subscriber?.created_by?.name}
              </span>
            </p>
            {/* Hover Card */}
            {hoveredUser?.modifiedBy?._id === subscriber?.created_by?._id &&
              hoveredUser?.subscriberId === subscriber?._id && (
                <UserHoverCard userData={hoveredUser} />
              )}
            <p>
              Authorized By:{" "}
              <span
                className="text-blue-500 hover:underline hover:cursor-pointer"
                onMouseEnter={() => {
                  setHoveredUser({
                    modifiedBy: subscriber?.decision_by,
                    subscriberId: subscriber?._id,
                  });
                }}
                onMouseLeave={() =>
                  setHoveredUser({
                    modifiedBy: null,
                    subscriberId: null,
                  })
                }
              >
                {subscriber?.decision_by?.name}
              </span>
            </p>
            {/* Hover Card */}
            {hoveredUser?.modifiedBy?._id === subscriber?.decision_by?._id &&
              hoveredUser?.subscriberId === subscriber?._id && (
                <UserHoverCard userData={hoveredUser} />
              )}
          </div>

          <div className="text-xs text-gray-500">
            <p>Created: {formatDate(subscriber?.createdAt)}</p>
            <p>Updated: {formatDate(subscriber?.updatedAt)}</p>
          </div>
        </div>
        {subscriber?.status === "Modified" && (
          <div>
            <div className="w-full px-4 py-3 bg-yellow-50 rounded-lg mb-3">
              <div className="space-y-3">
                {/* Remarks Section */}
                {subscriber.remark && (
                  <div className="flex items-start">
                    <span className="text-yellow-600 mr-2">📝</span>
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">Remarks:</span>{" "}
                      {subscriber.remark}
                    </div>
                  </div>
                )}

                {/* Modified Data Section */}
                {subscriber.modifiedData && (
                  <div className="border-t border-yellow-200 pt-3">
                    <div className="flex items-start mb-2">
                      <span className="text-yellow-600 mr-2">🔄</span>
                      <span className="text-sm font-medium text-gray-700">
                        Changes:
                      </span>
                    </div>

                    {/* Responsive Grid - Stacks on mobile */}
                    <div className="grid grid-cols-1 gap-2">
                      {/* Previous Data */}
                      <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                          <h3 className="font-medium text-gray-700 text-xs">
                            Previous
                          </h3>
                        </div>
                        <div className="space-y-1">
                          {Object.entries(subscriber.modifiedData.previous).map(
                            ([key, value]) => (
                              <div key={`prev-${key}`} className="text-xs">
                                <div className="flex items-baseline">
                                  <span className="inline-block min-w-[60px] text-gray-500 capitalize truncate">
                                    {getDisplayName(key)}:
                                  </span>
                                  <div className="flex-1 ml-1">
                                    {Array.isArray(value) ? (
                                      <div className="flex flex-wrap gap-0.5">
                                        {value.map((item, i) => (
                                          <span
                                            key={i}
                                            className="bg-gray-100 text-gray-700 text-[10px] px-1.5 py-0.5 rounded-full font-semibold break-words"
                                          >
                                            {item}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-gray-800 break-words">
                                        {value}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* Current Data */}
                      <div className="bg-blue-100 p-2 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                          <h3 className="font-medium text-blue-700 text-xs">
                            New
                          </h3>
                        </div>
                        <div className="space-y-1">
                          {Object.entries(subscriber.modifiedData.current).map(
                            ([key, value]) => {
                              const previousValue =
                                subscriber.modifiedData.previous[key];
                              const hasChanged =
                                JSON.stringify(value) !==
                                JSON.stringify(previousValue);
                              return (
                                <div key={`curr-${key}`} className="text-xs">
                                  <div className="flex items-baseline">
                                    <span className="inline-block min-w-[60px] text-blue-600 capitalize truncate">
                                      {getDisplayName(key)}:
                                    </span>
                                    <div className="flex-1 ml-1">
                                      {Array.isArray(value) ? (
                                        <div className="flex flex-wrap gap-0.5">
                                          {value.map((item, i) => (
                                            <span
                                              key={i}
                                              className="bg-blue-50 text-blue-900 text-[10px] px-1.5 py-0.5 rounded-full font-semibold "
                                            >
                                              {item}
                                            </span>
                                          ))}
                                        </div>
                                      ) : (
                                        <span
                                          className={`text-blue-900 break-words ${
                                            hasChanged
                                              ? "bg-green-600 px-2 rounded-xl text-white font-semibold"
                                              : "text-blue-900"
                                          }`}
                                        >
                                          {value}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Metadata - Mobile Optimized */}
                    <div className="mt-3 text-xs text-gray-500 relative">
                      <span
                        className="hover:underline cursor-pointer inline-block"
                        onMouseEnter={() =>
                          setHoveredUser({
                            modifiedBy: subscriber.modifiedData.modified_by,
                            employeeId: subscriber._id,
                          })
                        }
                        onMouseLeave={() =>
                          setHoveredUser({
                            modifiedBy: null,
                            employeeId: null,
                          })
                        }
                      >
                        Modified by:{" "}
                        <span className="text-blue-500 underline">
                          {subscriber?.modifiedData?.modified_by?.name ||
                            "Unknown"}
                        </span>
                      </span>
                      <span className="mx-2">•</span>
                      <span>
                        {new Date(
                          subscriber.modifiedData.modified_at
                        ).toLocaleString()}
                      </span>

                      {/* Mobile-Friendly Hover Card */}
                      {hoveredUser?.modifiedBy?._id ===
                        subscriber?.modifiedData?.modified_by?._id &&
                        hoveredUser?.employeeId === subscriber?._id && (
                          <UserHoverCard userData={hoveredUser} />
                        )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-3 gap-2">
          <button
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded"
            // onClick={handleDelete}
          >
            Delete
          </button>

          <button
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-2 rounded"
            // onClick={handleApprove}
          >
            Approve
          </button>

          <button
            className="bg-rose-500 hover:bg-rose-600 text-white font-semibold py-1 px-2 rounded"
            // onClick={handleApprove}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriberCard;
