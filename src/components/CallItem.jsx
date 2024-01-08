import PropTypes from "prop-types";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CALL_DIRECTION, CALL_TYPE, TABS_TYPE } from "@/lib/constants";
import apiInstance from "@/lib/api";
import {
  ArchiveRestore,
  ArchiveX,
  PhoneCall,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  ShieldQuestion,
} from "lucide-react";
import { PlainTooltipWrapper } from "./ui/tooltip";

const mapArchiveLabel = {
  [TABS_TYPE.ACTIVITY]: "Archive Call",
  [TABS_TYPE.ARCHIVED]: "Unarchive Call",
};

const MAP_PROPS_TO_DIRECTION = {
  [CALL_DIRECTION.INBOUND]: {
    Icon: PhoneIncoming,
    label: "Incoming call",
  },
  [CALL_DIRECTION.OUTBOUND]: {
    Icon: PhoneOutgoing,
    label: "Outgoing call",
  },
};

const iconProps = {
  size: 20,
  strokeWidth: 1.5,
};

const getIcon = ({ direction, callType }) => {
  switch (callType) {
    case CALL_TYPE.MISSED:
      return (
        <PlainTooltipWrapper label="Missed call">
          <PhoneMissed className="text-red-500" {...iconProps} />
        </PlainTooltipWrapper>
      );
    case CALL_TYPE.VOICEMAIL:
      return (
        <PlainTooltipWrapper label="Voicemail">
          <PhoneCall className="text-blue-500" {...iconProps} />
        </PlainTooltipWrapper>
      );
    case CALL_TYPE.ANSWERED: {
      const { Icon, label } = MAP_PROPS_TO_DIRECTION[direction] ?? {
        Icon: ShieldQuestion,
        label: "Unknown call",
      };

      const className = MAP_PROPS_TO_DIRECTION[direction]
        ? "text-green-500"
        : "text-secondary-foreground";

      return (
        <PlainTooltipWrapper label={label}>
          <Icon className={className} {...iconProps} />
        </PlainTooltipWrapper>
      );
    }
    default:
      // for unknown type, when backend didn't sent correct callType
      return (
        <PlainTooltipWrapper label="Unknown call">
          <ShieldQuestion
            className="text-secondary-foreground"
            {...iconProps}
          />
        </PlainTooltipWrapper>
      );
  }
};

const UNKNOWN = "unknown";
const TIME_FORMAT = "hh:mm a";

function CallItem({ call, tab }) {
  const {
    id: callId,
    is_archived: isArchived,
    from = UNKNOWN,
    to = UNKNOWN,
    via = UNKNOWN,
    direction = UNKNOWN,
    call_type: callType = UNKNOWN,
    created_at: createdAt,
  } = call;

  const callIcon = getIcon({ direction, callType });
  const ArchivedIcon = isArchived ? ArchiveRestore : ArchiveX;

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const navigateToCall = () => {
    navigate(`calls/${callId}`);
  };

  const mutation = useMutation({
    mutationFn: ({ callId, nextArchiveState }) =>
      apiInstance.patch(`activities/${callId}`, {
        is_archived: nextArchiveState,
      }),
    onMutate: async ({ callId, nextArchiveState }) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["calls"] });

      // Snapshot the previous value
      const previousCalls = queryClient.getQueryData(["calls"]);

      // Optimistically update to the new value
      queryClient.setQueriesData(["calls"], (old) =>
        old.map((call) =>
          call.id === callId ? { ...call, is_archived: nextArchiveState } : call
        )
      );

      // Return a context object with the snapshotted value
      return { previousCalls };
    },
    // If the mutation fails, rollback
    onError: (err, updatedCallObj, context) => {
      // TODO: show toast on mutation failure
      queryClient.setQueryData(["calls"], context.previousCalls);
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["calls"] });
    },
  });

  const onToggleArchive = (e) => {
    e.stopPropagation();
    mutation.mutate({ callId, nextArchiveState: !isArchived });
  };

  return (
    <div
      onClick={navigateToCall}
      className="flex items-center justify-between w-full p-2 border rounded-md border-border"
    >
      <div className="flex items-center gap-3">
        <div className="text-secondary-foreground">{callIcon}</div>
        <div className="flex flex-col justify-center">
          <div className="text-sm font-medium text-foreground">{from}</div>
          <div className="text-xs text-secondary-foreground">
            {`to ${to} via ${via}`}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <div className="text-xs text-secondary-foreground">
          {dayjs(createdAt).format(TIME_FORMAT)}
        </div>

        <PlainTooltipWrapper label={mapArchiveLabel[tab]}>
          <button
            className="p-2 rounded-sm cursor-pointer hover:bg-secondary"
            onClick={onToggleArchive}
          >
            <ArchivedIcon strokeWidth={1.5} className="w-4 h-4" />
          </button>
        </PlainTooltipWrapper>
      </div>
    </div>
  );
}

CallItem.propTypes = {
  call: PropTypes.object.isRequired,
  tab: PropTypes.oneOf(Object.values(TABS_TYPE)).isRequired,
};

export default CallItem;
