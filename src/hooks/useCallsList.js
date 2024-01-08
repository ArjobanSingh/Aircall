import apiInstance from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const getCallsList = async () => {
  const response = await apiInstance.get("activities");
  return response.data;
};

export default function useCallsList() {
  const queryResult = useQuery({
    queryKey: ["calls"],
    queryFn: getCallsList,
  });

  return queryResult;
}
