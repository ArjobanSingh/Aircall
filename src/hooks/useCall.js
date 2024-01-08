import apiInstance from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const getCallDetails = async (callId) => {
  const response = await apiInstance.get(`activities/${callId}`);
  return response.data;
};

export default function useCall(callId, otherQueryProps) {
  const queryResult = useQuery({
    queryKey: ["call", callId],
    queryFn: () => getCallDetails(callId),
    ...otherQueryProps,
  });

  return queryResult;
}
