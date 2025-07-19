import { useFormik } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import Toast from "../../components/Toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getTicketByIdAPI } from "../../services/ticketServices";
import { Loader } from "lucide-react";
import { FiMapPin } from "react-icons/fi";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

const UpdateTicketForm = ({ id, handleClose }) => {
  const [submissionStatus, setSubmissionStatus] = useState(null);

  const {
    data: fetchedTicket,
    isSuccess: fetchedSuccess,
    refetch: refetchSub,
  } = useQuery({
    queryFn: () => getTicketByIdAPI(id),
    queryKey: ["ticketByID", id],
    enabled: !!id,
    refetchOnWindowFocus: true,
    onError: (error) => console.error("Error fetching ticket:", error),
    onSuccess: (data) => console.log("Ticket fetched successfully", data),
  });

  const ticket = fetchedTicket?.data;

  // Update Ticket Mutation
  const {
    mutateAsync: updateTicketMutate,
    isPending,
    isError,
    isSuccess: updateSuccess,
    error,
  } = useMutation({
    // mutationFn: updateTicketAPI,
    mutationKey: ["updateTicket"],
  });

  const formik = useFormik({
    initialValues: {
      subscriber: null, // will store the selected subscriber object
      issueTitle: "",
      issueDescription: "",
      priority: "Medium",
      assignedTo: null, // will store the selected employee object
    },
    validationSchema: Yup.object({
      subscriber: Yup.object().required("Subscriber is required"),
      issueTitle: Yup.string()
        .min(5, "Must be at least 5 characters")
        .max(100, "Must be 100 characters or less")
        .required("Required"),
      issueDescription: Yup.string()
        .min(10, "Must be at least 10 characters")
        .max(500, "Must be 500 characters or less")
        .required("Required"),
      priority: Yup.string().required("Required"),
      assignedTo: Yup.object().required("Assignee is required"),
    }),
    onSubmit: async (values) => {
      try {
        const ticketData = {
          subscriberId: values.subscriber._id,
          issueTitle: values.issueTitle.trim(),
          issueDescription: values.issueDescription.trim(),
          priority: values.priority,
          assignedTo: values.assignedTo._id,
          issueRaisedDate: new Date(),
        };

        await updateTicketMutate(ticketData)
          .then(() => {
            setSubmissionStatus({
              type: "success",
              message: "Ticket created successfully!",
            });
            formik.resetForm();
            setTimeout(() => {
              handleClose();
            }, 2000);
          })
          .catch((error) => {
            console.error("Error creating ticket:", error);
            setSubmissionStatus({
              type: "error",
              message:
                error?.response?.data?.error ??
                error?.message ??
                "Failed to create ticket",
            });
          });
      } catch (error) {
        setSubmissionStatus({
          type: "error",
          message:
            error?.response?.data?.error ??
            error?.message ??
            "Failed to create ticket",
        });
      }
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto hide-scrollbar">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Update Ticket</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {!updateSuccess ? (
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                {ticket?.issueTitle}
              </h2>

              <p className="text-gray-600 text-sm mb-4 flex-1">
                {ticket?.issueDescription}
              </p>
              <div className="flex flex-col items-center text-sm text-gray-600">
                <span className="text-xs text-black font-semibold">
                  {ticket?.subscriberId?.siteCode} {" - "}
                  {ticket?.subscriberId?.siteName}
                </span>
                <div className="flex items-center pt-2 ">
                  <FiMapPin className="mr-2 text-gray-400 flex-shrink-0" />
                  <span className="">{ticket?.subscriberId?.siteAddress}</span>
                </div>
              </div>
              {/* ISP Ticket ID Field */}
              <div>
                <label
                  htmlFor="ispTicketId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ISP Ticket ID <span className="text-red-500">*</span>
                </label>
                <input
                  id="ispTicketId"
                  name="ispTicketId"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.ispTicketId}
                  className={`block w-full rounded-md py-2 px-3.5 shadow-sm border ${
                    formik.touched.ispTicketId && formik.errors.ispTicketId
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  } focus:outline-none focus:ring-2 focus:ring-opacity-50 sm:text-sm`}
                  placeholder="Ticket ID provided by ISP"
                />
                {formik.touched.ispTicketId && formik.errors.ispTicketId && (
                  <p className="mt-1.5 text-sm text-red-600">
                    {formik.errors.ispTicketId}
                  </p>
                )}
              </div>

              {/* Note Description Field */}
              <div>
                <label
                  htmlFor="note"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Note <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="note"
                  name="note"
                  rows={4}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.note}
                  className={`block w-full rounded-md shadow-sm border py-2 px-3.5 ${
                    formik.touched.note && formik.errors.note
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  } focus:outline-none focus:ring-2 focus:ring-opacity-50 sm:text-sm`}
                  placeholder="Some notes toward resolving the issue..."
                />
                {formik.touched.note && formik.errors.note && (
                  <p className="mt-1.5 text-sm text-red-600">
                    {formik.errors.note}
                  </p>
                )}
              </div>
            </div>

            {/* Status and Actions */}
            <div className="space-y-4">
              {submissionStatus && (
                <Toast
                  type={submissionStatus.type}
                  message={submissionStatus.message}
                  onClose={() => setSubmissionStatus(null)}
                />
              )}

              <div className="flex justify-between space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => formik.resetForm()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                  Reset
                </button>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2.5 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formik.isSubmitting}
                    className="px-4 py-2.5 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                  >
                    {formik.isSubmitting ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      "Update Ticket"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">
              Ticket Updated Successfully!
            </h3>
            <div className="mt-2 text-sm text-gray-500">
              <p>The ticket has been updated and In Progress Now.</p>
            </div>
            <div className="mt-5">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateTicketForm;
