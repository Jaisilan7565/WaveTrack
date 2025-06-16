import React from "react";
import { useParams } from "react-router-dom";
import { getSubscriberByIdAPI } from "../../../services/subscriberServices";
import { useQuery } from "@tanstack/react-query";
import SubscriberCard from "../../../components/SubscriberCard";

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

  console.log(JSON.stringify(subscriber?.data));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3">
      <SubscriberCard subscriber={subscriber?.data} />
    </div>
  );
};

export default Subscriber;
