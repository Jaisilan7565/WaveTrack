import {
  FiUser,
  FiPhone,
  FiWifi,
  FiCalendar,
  FiMapPin,
  FiDollarSign,
  FiShield,
} from "react-icons/fi";

const SubscriberCard = ({ subscriber }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition duration-300">
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
          <button>Edit</button>
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
                      ? "bg-green-200 text-green-800"
                      : "bg-red-100 text-red-700"
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
          <div className="text-xs text-gray-500">
            <p>
              Created By:{" "}
              <span className="underline hover:cursor-pointer">
                {subscriber?.created_by?.name}
              </span>
            </p>
            <p>
              Authorized By:{" "}
              <span className="underline hover:cursor-pointer">
                {subscriber?.decision_by?.name}
              </span>
            </p>
          </div>
          <div className="text-xs text-gray-500">
            <p>Created: {formatDate(subscriber?.createdAt)}</p>
            <p>Updated: {formatDate(subscriber?.updatedAt)}</p>
          </div>
        </div>
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
