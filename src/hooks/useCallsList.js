import { API_URL } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

const getCallsList = async () => {
  const res = await fetch(`${API_URL}/activities`);
  if (!res.ok) {
    console.log("what is response: ", res);
    throw new Error("Something went wrong");
  }
  return res.json();
};

export default function useCallsList() {
  const queryResult = useQuery({
    queryKey: ["calls"],
    queryFn: getCallsList,
  });

  return queryResult;
}
