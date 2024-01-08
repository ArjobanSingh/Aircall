import apiInstance from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const getCallDetails = async (callId) => {
  const response = await apiInstance.get(`activities/${callId}`);
  return response.data;
};

export default function useCall(callId) {
  const queryResult = useQuery({
    queryKey: ["call", callId],
    queryFn: () => getCallDetails(callId),
  });

  return queryResult;
}
