import React from "react";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import useCall from "@/hooks/useCall";

function CallDetails() {
  const { callId } = useParams();
  const { isLoading, error, data } = useCall(callId);

  if (isLoading) return <div>Loading...</div>;
  if (!data && error) return <div>Error</div>;

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

CallDetails.propTypes = {};

export default CallDetails;
