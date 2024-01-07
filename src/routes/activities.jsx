import useCallsList from "@/hooks/useCallsList";
import PropTypes from "prop-types";

function Activities() {
  const { data, error, isLoading } = useCallsList();

  if (isLoading) return <div>Loading...</div>;
  if (!data && error) return <div>Some error</div>;

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

Activities.propTypes = {};

export default Activities;
