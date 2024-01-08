import { memo } from "react";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { TABS_TYPE, UNKNOWN } from "@/lib/constants";
import apiInstance from "@/lib/api";
import { ArchiveRestore, ArchiveX } from "lucide-react";
import { PlainTooltipWrapper } from "./ui/tooltip";
import {
  getCallColorClassName,
  getCallIcon,
  getCallLabel,
  onPressEnter,
} from "@/lib/utils";

const mapArchiveLabel = {
  [TABS_TYPE.ACTIVITY]: "Archive Call",
  [TABS_TYPE.ARCHIVED]: "Unarchive Call",
};

const iconProps = {
  size: 20,
  strokeWidth: 1.5,
};

const DATE_FORMAT = {
  FULL: "MMM, DD YYYY",
  TIME: "hh:mm a",
};

const CallItem = memo(function CallItem({ call, tab, isDateRowVisible }) {
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

  const CallIcon = getCallIcon({ direction, callType });
  const callLabel = getCallLabel({ direction, callType });
  const callColorClassName = getCallColorClassName(callType);

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
    <>
      {isDateRowVisible && (
        <div className="flex items-center justify-center w-full gap-1 text-xs font-medium text-secondary-foreground">
          <div className="flex-1 border border-dashed border-border" />
          {dayjs(createdAt).format(DATE_FORMAT.FULL)}
          <div className="flex-1 border border-dashed border-border" />
        </div>
      )}
      <div
        onClick={navigateToCall}
        tabIndex={0}
        role="link"
        onKeyDown={onPressEnter(navigateToCall)}
        className="flex items-center justify-between w-full gap-2 p-2 border rounded-md cursor-pointer border-border"
      >
        <div className="flex items-center gap-3">
          <div className="text-secondary-foreground shrink-0">
            <PlainTooltipWrapper label={callLabel}>
              <CallIcon {...iconProps} className={callColorClassName} />
            </PlainTooltipWrapper>
          </div>
          <div className="flex flex-col justify-center">
            <div className="text-sm font-medium text-foreground">{from}</div>
            <div className="text-xs break-all text-secondary-foreground line-clamp-1">
              {`to ${to} via ${via}`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <div className="text-xs text-secondary-foreground">
            {dayjs(createdAt).format(DATE_FORMAT.TIME)}
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
    </>
  );
});

CallItem.propTypes = {
  call: PropTypes.object.isRequired,
  isDateRowVisible: PropTypes.bool.isRequired,
  tab: PropTypes.oneOf(Object.values(TABS_TYPE)).isRequired,
};

export default CallItem;
