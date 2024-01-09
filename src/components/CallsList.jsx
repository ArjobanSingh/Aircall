import PropTypes from "prop-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { TABS_TYPE } from "@/lib/constants";
import apiInstance from "@/lib/api";

import { Button } from "./ui/button";
import CallItem from "./CallItem";
import { isSameDay } from "@/lib/utils";
import { ArchiveRestore } from "lucide-react";
import { useToast } from "./ui/use-toast";

const mapPropsToTab = {
  [TABS_TYPE.ACTIVITY]: {
    buttonLabel: "Archive all calls",
    emptyLabel: "Active",
  },
  [TABS_TYPE.ARCHIVED]: {
    buttonLabel: "Unarchive all Calls",
    emptyLabel: "Archived",
  },
};

// Not using this function, please check the comments below for explanation
const archiveAll = async (calls) => {
  const promises = calls.map((call) =>
    apiInstance.patch(`activities/${call.id}`, {
      is_archived: true,
    })
  );

  return Promise.all(promises);
};

const unarchiveAll = async () => apiInstance.patch("reset");

/*
  Note: Deliberately didn't add the Archive all button, for following reasons.
  1. There is no Archive all API present.
  2. If we try to use brute force approach of hitting multiple api requests in parallel
    it can have following two issues:
    i. We can hit the Rate-Limit for the API request
    ii. If some api requests passed while others failed, we would have mix result set of
        archived + un-archived calls, which is a bug. As user requested to archive all.
*/

function CallsList({ calls, tab }) {
  const isArchivedTab = tab === TABS_TYPE.ARCHIVED;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: unarchiveAllCalls } = useMutation({
    mutationFn: unarchiveAll,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["calls"] });
      const previousCalls = queryClient.getQueryData(["calls"]);

      queryClient.setQueriesData(["calls"], (old) =>
        old.map((call) => ({
          ...call,
          //   archive all, if current tab is activity tab
          is_archived: !isArchivedTab,
        }))
      );

      return { previousCalls };
    },
    // If the mutation fails, rollback
    onError: (err, updatedCallObj, context) => {
      toast({
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with un-archival of all the calls.",
      });
      queryClient.setQueryData(["calls"], context.previousCalls);
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["calls"] });
    },
  });

  const { buttonLabel, emptyLabel } = mapPropsToTab[tab];

  if (!calls.length) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-4">
        <div className="text-2xl text-center max-w-60">
          {`Looks like there are no ${emptyLabel} calls`}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full gap-2">
      {isArchivedTab && (
        <div className="w-full px-4">
          <Button className="w-full" onClick={unarchiveAllCalls}>
            <ArchiveRestore className="w-4 h-4 mr-2" /> {buttonLabel}
          </Button>
        </div>
      )}
      <div className="relative flex-1">
        <div className="absolute inset-0 flex flex-col gap-4 px-4 py-2 overflow-y-auto">
          {calls.map((call, idx) => {
            const prevCall = calls[idx - 1];

            // Render date in between calls, when different day or at the beginning
            const isDateRowVisible =
              idx === 0 || !isSameDay(call.created_at, prevCall.created_at);

            return (
              <CallItem
                key={call.id}
                call={call}
                tab={tab}
                isDateRowVisible={isDateRowVisible}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

CallsList.propTypes = {
  tab: PropTypes.oneOf(Object.values(TABS_TYPE)).isRequired,
  calls: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default CallsList;
