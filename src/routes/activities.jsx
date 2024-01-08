import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useCallsList from "@/hooks/useCallsList";
import CallsList from "@/components/CallsList";
import { TABS_TYPE } from "@/lib/constants";

const tabs = [TABS_TYPE.ACTIVITY, TABS_TYPE.ARCHIVED];

function ContentWrapper() {
  const { data, error, isLoading } = useCallsList();

  const { activities, archived } = useMemo(() => {
    if (!Array.isArray(data) || !data.length) {
      return { activities: [], archived: [] };
    }

    return data.reduce(
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

  if (isLoading) return <div>Loading...</div>;
  if (!data && error) return <div>Some error</div>;

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
        <div className="w-full h-10">Footer</div>
      </Tabs>
    </div>
  );
}

Activities.propTypes = {};

export default Activities;
