import { getAuthHeaders } from "../utils/authHeaders";
import { BASE_URL } from "../utils/url";
import axios from "axios";

export const createSubscriberAPI = async (subscriberData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/subscribers`,
      subscriberData,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error creating Subscriber:", error);
    throw error;
  }
};

export const createBulkSubscribersAPI = async (subscribersData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/subscribers/bulk`,
      subscribersData,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error creating Bulk Subscribers:", error);
    throw error;
  }
};

export const getSubscribersAPI = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/subscribers`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }
};

export const approveSubscriberAPI = async (id, status, subscriber) => {
  try {
    let payload;

    if (status === "Added") {
      payload = {
        request_status: "approved",
        status: "Active",
      };
    } else if (status === "InActive") {
      payload = {
        request_status: "approved",
        status: "InActive",
      };
    }
    // else if (status === "Modified") {
    //   payload = {
    //     name: employee?.modifiedData?.current?.name,
    //     email: employee?.modifiedData?.current?.email,
    //     contact: employee?.modifiedData?.current?.contact,
    //     roles: employee?.modifiedData?.current?.roles,
    //     request_status: "approved",
    //     status: "Active",
    //   };
    // } else if (status === "InActive") {
    //   payload = {
    //     request_status: "approved",
    //     status: "InActive",
    //   };
    // } else if (status === "Active") {
    //   payload = {
    //     request_status: "approved",
    //     status: "Active",
    //   };
    // }

    const response = await axios.patch(
      `${BASE_URL}/subscribers/${id}/approve`,
      payload,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error :", error);
    throw error;
  }
};

export const rejectSubscriberAPI = async (id, status, subscriber) => {
  try {
    let payload;

    if (status === "Added") {
      payload = {
        request_status: "rejected",
        status: "Rejected",
      };
    }
    // else if (status === "Modified") {
    //   payload = {
    //     request_status: "rejected",
    //     status: "Rejected",
    //   };
    // } else if (status === "InActive") {
    //   payload = {
    //     request_status: "approved",
    //     status: "Active",
    //   };
    // } else if (status === "Active") {
    //   payload = {
    //     request_status: "approved",
    //     status: "InActive",
    //   };
    // }

    const response = await axios.patch(
      `${BASE_URL}/subscribers/${id}/reject`,
      payload,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error rejecting subscriber:", error);
    throw error;
  }
};

export const bulkApproveSubscriberAPI = async (subscribersToApprove) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/subscribers/bulk-approve`,
      subscribersToApprove,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error Approving Bulk Subscribers:", error);
    throw error;
  }
};

export const bulkRejectSubscriberAPI = async (subscribersToReject) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/subscribers/bulk-reject`,
      subscribersToReject,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error Rejecting Bulk Subscribers:", error);
    throw error;
  }
};

export const bulkDeleteSubscriberAPI = async (subscribersToDelete) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/subscribers/bulk-delete`,
      subscribersToDelete,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error Deleting Bulk Subscribers:", error);
    throw error;
  }
};

export const getSubscriberByIdAPI = async (id) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/subscribers/${id}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching subscriber:", error);
    throw error;
  }
};
