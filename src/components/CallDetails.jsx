import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import useCall from "@/hooks/useCall";
import { UNKNOWN } from "@/lib/constants";
import {
  cn,
  getCallColorClassName,
  getCallIcon,
  getCallLabel,
  secondsToHms,
} from "@/lib/utils";

import { PlainTooltipWrapper } from "./ui/tooltip";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

function ContentLoader() {
  return (
    <div className="flex flex-col w-full h-full px-4 overflow-auto">
      <div className="flex items-center justify-center w-full p-8">
        <Skeleton className="w-32 h-32 rounded-full" />
      </div>
      <div className="flex flex-col gap-4">
        {[1, 2].map((key) => (
          <div key={key} className="w-full p-2 border rounded-sm border-border">
            {[1, 2].map((nestedKey) => (
              <div
                key={nestedKey}
                className="flex flex-col gap-2 py-2 border-b border-border last:border-b-0"
              >
                <Skeleton className="w-1/2 h-3 rounded-sm" />
                <Skeleton className="w-full h-4 rounded-sm" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function CallContent() {
  const { callId } = useParams();
  const queryClient = useQueryClient();

  const initialData = useMemo(() => {
    const calls = queryClient.getQueryData(["calls"]);
    return calls?.find((call) => call.id === callId);
  }, [callId, queryClient]);

  const { isLoading, error, data, refetch } = useCall(callId, { initialData });

  if (!data && isLoading) return <ContentLoader />;

  if (!data && error) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full gap-2">
        <div className="text-2xl text-red-500">Oops Something went wrong!!</div>
        <Button onClick={refetch}>Retry...</Button>
      </div>
    );
  }

  const {
    direction = UNKNOWN,
    call_type: callType = UNKNOWN,
    from = UNKNOWN,
    to = UNKNOWN,
    via = UNKNOWN,
    created_at: createdAt,
    duration,
  } = data;

  const CallIcon = getCallIcon({ direction, callType });
  const callLabel = getCallLabel({ direction, callType });
  const callColorClassName = getCallColorClassName(callType);

  const sections = [
    {
      key: 1,
      data: [
        {
          label: "on",
          value: dayjs(createdAt).format("MMM d, YYYY hh:mm a"),
          color: "text-foreground",
        },
        {
          label: "for",
          value: duration ? secondsToHms(duration) : undefined,
          color: "text-foreground",
          isHidden: !duration,
        },
      ],
    },
    {
      key: 2,
      data: [
        { label: "from", value: from, color: callColorClassName },
        { label: "to", value: to, color: "text-indigo-400" },
        { label: "via", value: via, color: "text-indigo-400" },
      ],
    },
  ];

  return (
    <main className="flex flex-col flex-1 w-full gap-4 px-4 overflow-auto">
      <div className="flex flex-col items-center gap-2 p-8">
        <div className="p-4 border rounded-full border-border last:border-b-0">
          <CallIcon size={40} className={callColorClassName} />
        </div>
        <h1 className="text-2xl font-medium text-center">{callLabel}</h1>
      </div>

      {sections.map((section) => (
        <section
          key={section.key}
          className="w-full p-2 border rounded-sm border-border"
        >
          {section.data.map((row) =>
            row.isHidden ? null : (
              <div
                key={row.label}
                className="py-1 border-b border-border last:border-b-0"
              >
                <div className="text-sm text-secondary-foreground">
                  {row.label}
                </div>
                <div
                  className={cn(
                    "text-base font-medium text-indigo-400",
                    row.color
                  )}
                >
                  {row.value}
                </div>
              </div>
            )
          )}
        </section>
      ))}
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
        <div className="text-base">Call Details</div>
      </header>
      <CallContent />
    </div>
  );
}

CallDetails.propTypes = {};

export default CallDetails;
