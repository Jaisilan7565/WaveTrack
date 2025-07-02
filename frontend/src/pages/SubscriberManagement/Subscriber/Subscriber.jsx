import React from "react";
import { useParams } from "react-router-dom";
import { getSubscriberByIdAPI } from "../../../services/subscriberServices";
import { useQuery } from "@tanstack/react-query";
import SubscriberCard from "../../../components/SubscriberCard";
import PaymentEntriesTable from "../../../components/PaymentEntriesTable";
import { paymentsData } from "../../../constants";
import {
  getPaymentsAPI,
  getPaymentsBySubscriberIdAPI,
} from "../../../services/paymentServices";

const Subscriber = () => {
  const { id } = useParams();
  const {
    data: subscriber,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryFn: () => getSubscriberByIdAPI(id),
    queryKey: ["getSubscriberById", id],
    refetchOnWindowFocus: true,
    enabled: !!id,
  });

  const {
    data: payments,
    isLoading: paymentsLoading,
    error: paymentsError,
    refetch: paymentsRefetch,
  } = useQuery({
    queryFn: () => getPaymentsBySubscriberIdAPI(id),
    queryKey: ["getPaymentsBySubscriberIdAPI", id],
    refetchOnWindowFocus: true,
    enabled: !!id,
  });

  console.log("Subscriber:", subscriber);
  console.log("Payments:", payments);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-4 p-4 h-[90vh]">
      {/* Left Column - Subscriber Card */}
      <div className="col-span-1 md:overflow-y-auto hide-scrollbar rounded-2xl">
        <SubscriberCard subscriber={subscriber?.data} refetch={refetch} />
      </div>

      {/* Right Column - Payments Table */}
      <div className="col-span-2 md:overflow-y-auto hide-scrollbar rounded-2xl">
        <PaymentEntriesTable
          payments={payments?.data}
          refetch={paymentsRefetch}
          subscriber={subscriber?.data}
        />
      </div>
    </div>
  );
};

export default Subscriber;
