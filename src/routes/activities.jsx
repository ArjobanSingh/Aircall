import { useMemo } from "react";
import dayjs from "dayjs";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useCallsList from "@/hooks/useCallsList";
import CallsList from "@/components/CallsList";
import { TABS_TYPE } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const tabs = [TABS_TYPE.ACTIVITY, TABS_TYPE.ARCHIVED];

function ContentWrapper() {
  const { data, error, isLoading, refetch } = useCallsList();

  const { activities, archived } = useMemo(() => {
    if (!Array.isArray(data) || !data.length) {
      return { activities: [], archived: [] };
    }

    const descOrderData = [...data].sort((a, b) =>
      dayjs(a.created_at).isAfter(dayjs(b.created_at)) ? -1 : 1
    );

    return descOrderData.reduce(
      (acc, currentCall) => {
        const { activities, archived } = acc;
        const { is_archived } = currentCall;
        const result = is_archived ? archived : activities;
        result.push(currentCall);
        return acc;
      },
      {
        activities: [],
        archived: [],
      }
    );
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex flex-col w-full h-full gap-4 px-4 py-2">
        {Array.from({ length: 8 }, (_, idx) => idx).map((item) => (
          <div
            className="flex items-center w-full gap-3 p-2 border rounded-md border-border"
            key={item}
          >
            <Skeleton className="rounded-full w-7 h-7 shrink-0" />
            <div className="flex flex-col w-full gap-2">
              <Skeleton className="w-48 h-4 rounded-sm" />
              <Skeleton className="w-full h-4 rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data && error) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full gap-2">
        <div className="text-2xl text-red-500">Oops Something went wrong!!</div>
        <Button onClick={refetch}>Retry...</Button>
      </div>
    );
  }

  const mapDataToTab = {
    [TABS_TYPE.ACTIVITY]: activities,
    [TABS_TYPE.ARCHIVED]: archived,
  };

  return tabs.map((tab) => (
    <TabsContent key={tab} value={tab} className="flex-1">
      <CallsList tab={tab} calls={mapDataToTab[tab]} />
    </TabsContent>
  ));
}

// TODO: add footer style
function Activities() {
  return (
    <div className="w-full h-full">
      <Tabs
        defaultValue={TABS_TYPE.ACTIVITY}
        className="flex flex-col w-full h-full"
      >
        <TabsList className="w-full px-4">
          {tabs.map((tab) => (
            <TabsTrigger className="flex-1" key={tab} value={tab}>
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
        <ContentWrapper />
      </Tabs>
    </div>
  );
}

Activities.propTypes = {};

export default Activities;
