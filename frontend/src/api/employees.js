// src/api/employees.js
import apiClient from "./client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useEmployees = () => {
  return useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data } = await apiClient.get("/employees");
      return data;
    },
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (employeeData) => apiClient.post("/employees", employeeData),
    onSuccess: () => {
      queryClient.invalidateQueries(["employees"]);
    },
  });
};
