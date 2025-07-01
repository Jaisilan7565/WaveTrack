import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { format, addMonths, parseISO } from "date-fns";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  FiEdit,
  FiSearch,
  FiFilter,
  FiDownload,
  FiPlus,
  FiChevronUp,
  FiChevronDown,
  FiCheck,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
// import { useMutation } from "@tanstack/react-query";
// import { createSubscriberAPI } from "../../services/subscriberServices";
import { deepTrim } from "../../../../utils/trim";
import Toast from "../../../../components/Toast";

const AddPaymentForm = ({ handleClose, subscriber }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);

  // New Payment Mutation

  // Form validation schema
  const validationSchema = Yup.object().shape({
    transactionType: Yup.string()
      .required("Transaction type is required")
      .oneOf(["Income", "Expense"], "Invalid transaction type"),
    transactionDate: Yup.date()
      .required("Transaction date is required")
      .max(new Date(), "Transaction date cannot be in the future"),
    amount: Yup.number()
      .required("Amount is required")
      .min(1, "Amount must be at least 1"),
    activationDate: Yup.date()
      .required("Activation date is required")
      .max(new Date(), "Activation date cannot be in the future"),
    expiryDate: Yup.date().required("Expiry date is required"),
  });

  const formik = useFormik({
    initialValues: {
      transactionType: "",
      transactionDate: "",
      amount: "",
      activationDate: "",
      expiryDate: "",
    },

    validationSchema, // Make sure to update your validation schema accordingly
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        // Trim all string values (including nested ones) before processing
        const trimmedValues = deepTrim(values);

        console.log(trimmedValues);

        // await addSubMutate(newSubs)
        //   .then(() => {
        //     setSubmissionStatus({
        //       type: "success",
        //       message: "Subscriber added successfully!",
        //     });
        //     formik.resetForm();
        //     setTimeout(() => {
        //       setIsSubmitting(false);
        //       handleClose();
        //     }, 3000);
        //   })
        //   .catch((error) => {
        //     console.error("Error adding Subscriber:", error);
        //     setIsSubmitting(false);
        //     setSubmissionStatus({
        //       type: "error",
        //       message:
        //         error?.response?.data?.error ??
        //         error?.message ??
        //         "Failed to add subscriber",
        //     });
        //   });
      } catch (error) {
        setIsSubmitting(false);
        setSubmissionStatus({
          type: "error",
          message:
            error?.response?.data?.error ??
            error?.message ??
            "Failed to add subscriber",
        });
      }
    },
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto hide-scrollbar">
        {submissionStatus && (
          <Toast
            type={submissionStatus.type}
            message={submissionStatus.message}
            onClose={() => setSubmissionStatus(null)}
          />
        )}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 underline">
            Register New Payment
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>
        {/* Form goes here */}
        <div>
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div
                className={`${!formik.values.transactionType && "col-span-2"}`}
              >
                <div>
                  <label
                    htmlFor="transactionType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Transaction Type
                  </label>
                  <select
                    className={`block w-full rounded-md py-2 px-3.5 shadow-sm border ${
                      formik.touched.transactionType &&
                      formik.errors.transactionType
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } ${
                      formik.values.transactionType === "Income"
                        ? "border-2 ring-green-500 border-green-500"
                        : formik.values.transactionType === "Expense"
                        ? "border-2 ring-rose-500 border-rose-500"
                        : ""
                    } focus:outline-none focus:ring-2 focus:ring-opacity-50 sm:text-sm`}
                    name="transactionType"
                    value={formik.values.transactionType}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <option value="">Select Type</option>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
                {formik.touched.transactionType &&
                  formik.errors.transactionType && (
                    <p className="mt-1.5 text-sm text-red-600">
                      {formik.errors.transactionType}
                    </p>
                  )}
              </div>

              {formik.values.transactionType && (
                <>
                  <div>
                    <label
                      htmlFor="amount"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <div>
                      <div className="relative flex items-center gap-2">
                        <span className="text-gray-900 sm:text-lg">₹</span>
                        <input
                          type="number"
                          id="amount"
                          name="amount"
                          min="0"
                          value={formik.values.amount}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          disabled={formik.values.transactionType === "Expense"}
                          className={`block w-full rounded-md py-2 px-3.5 shadow-sm border ${
                            formik.touched.amount && formik.errors.amount
                              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          } ${
                            formik.values.transactionType === "Expense" &&
                            "bg-gray-100"
                          } focus:outline-none focus:ring-2 focus:ring-opacity-50 sm:text-sm`}
                        />
                      </div>
                    </div>
                    {formik.touched.amount && formik.errors.amount && (
                      <p className="mt-1 text-sm text-red-600">
                        {formik.errors.amount}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="activationDate"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Activation Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center gap-2">
                      <input
                        type="date"
                        id="activationDate"
                        name="activationDate"
                        value={formik.values.activationDate}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={formik.values.transactionType === "Expense"}
                        className={`block w-full rounded-md py-2 px-3.5 shadow-sm border ${
                          formik.touched.activationDate &&
                          formik.errors.activationDate
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        } ${
                          formik.values.transactionType === "Expense" &&
                          "bg-gray-100"
                        }  focus:outline-none focus:ring-2 focus:ring-opacity-50 sm:text-sm`}
                      />
                    </div>
                    {formik.touched.activationDate &&
                      formik.errors.activationDate && (
                        <p className="mt-1 text-sm text-red-600">
                          {formik.errors.activationDate}
                        </p>
                      )}
                  </div>

                  <div>
                    <label
                      htmlFor="expiryDate"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Expiry Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center gap-2">
                      <input
                        type="date"
                        id="expiryDate"
                        name="expiryDate"
                        value={formik.values.expiryDate}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={formik.values.transactionType === "Expense"}
                        className={`block w-full rounded-md py-2 px-3.5 shadow-sm border ${
                          formik.touched.expiryDate && formik.errors.expiryDate
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        } ${
                          formik.values.transactionType === "Expense" &&
                          "bg-gray-100"
                        }  focus:outline-none focus:ring-2 focus:ring-opacity-50 sm:text-sm`}
                      />
                    </div>
                    {formik.touched.expiryDate && formik.errors.expiryDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {formik.errors.expiryDate}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Form buttons remain the same */}
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
                  disabled={isSubmitting || !formik.isValid}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : formik.values.transactionType === "Expense" ? (
                    "Plan Renewed"
                  ) : (
                    "Payment Received"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPaymentForm;
