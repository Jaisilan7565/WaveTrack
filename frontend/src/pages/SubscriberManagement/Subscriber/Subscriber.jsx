import React from "react";
import { useParams } from "react-router-dom";
import { getSubscriberByIdAPI } from "../../../services/subscriberServices";
import { useQuery } from "@tanstack/react-query";
import SubscriberCard from "../../../components/SubscriberCard";
import PaymentEntriesTable from "../../../components/PaymentEntriesTable";
import { paymentsData } from "../../../constants";

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3">
      <SubscriberCard subscriber={subscriber?.data} refetch={refetch} />
      <div className="col-span-2">
        <div className="overflow-y-auto hide-scrollbar max-h-[85vh] rounded-2xl">
          <PaymentEntriesTable payments={paymentsData} />
        </div>
      </div>
    </div>
  );
};

export default Subscriber;
