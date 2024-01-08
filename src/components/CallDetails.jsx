import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { useNavigate, useParams } from "react-router-dom";
import useCall from "@/hooks/useCall";
import { PlainTooltipWrapper } from "./ui/tooltip";
import { ChevronLeft } from "lucide-react";
import {
  cn,
  getCallColorClassName,
  getCallIcon,
  getCallLabel,
} from "@/lib/utils";
import { UNKNOWN } from "@/lib/constants";
import { useQueryClient } from "@tanstack/react-query";

function CallContent() {
  const { callId } = useParams();
  const queryClient = useQueryClient();

  const initialData = useMemo(() => {
    const calls = queryClient.getQueryData(["calls"]);
    return calls?.find((call) => call.id === callId);
  }, [callId, queryClient]);

  const { isLoading, error, data } = useCall(callId, { initialData });

  if (!data && isLoading) return <div>Loading...</div>;
  if (!data && error) return <div>Error</div>;

  const {
    direction = UNKNOWN,
    call_type: callType = UNKNOWN,
    from = UNKNOWN,
    to = UNKNOWN,
    via = UNKNOWN,
  } = data;

  const CallIcon = getCallIcon({ direction, callType });
  const callLabel = getCallLabel({ direction, callType });
  const callColorClassName = getCallColorClassName(callType);

  const dataRows = [
    { label: "from", value: from, color: callColorClassName },
    { label: "to", value: to, color: "text-indigo-400" },
    { label: "via", value: via, color: "text-indigo-400" },
  ];

  return (
    <main className="flex flex-col flex-1 w-full gap-4 px-4">
      <div className="flex flex-col items-center gap-2 p-8">
        <div className="p-4 border rounded-full border-border">
          <CallIcon size={40} className={callColorClassName} />
        </div>
        <h1 className="text-2xl font-medium text-center">{callLabel}</h1>
      </div>

      <div className="w-full p-2 ">
        {dataRows.map((row) => (
          <div key={row.label} className="py-1 border-b border-border ">
            <div className="text-sm text-secondary-foreground">{row.label}</div>
            <div
              className={cn("text-base font-medium text-indigo-400", row.color)}
            >
              {row.value}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
function CallDetails() {
  const navigate = useNavigate();
  const onBackButtonPress = () => navigate(-1);

  return (
    <div className="flex flex-col w-full h-full py-2">
      <header className="relative flex items-center justify-center h-10 px-2 shrink-0">
        <PlainTooltipWrapper label="Go back">
          <button
            className="absolute p-2 rounded-sm cursor-pointer left-2 hover:bg-secondary"
            onClick={onBackButtonPress}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </PlainTooltipWrapper>
        <div>Call Details</div>
      </header>
      <CallContent />
    </div>
  );
}

CallDetails.propTypes = {};

export default CallDetails;
