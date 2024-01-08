import { clsx } from "clsx";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";
import {
  PhoneCall,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  ShieldQuestion,
} from "lucide-react";

import { CALL_DIRECTION, CALL_TYPE, UNKNOWN } from "./constants";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function isSameDay(date1, date2) {
  return dayjs(date1).isSame(date2, "day");
}

export function onPressEnter(cb) {
  return (e) => {
    if (e.key === "Enter") cb(e);
  };
}

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

export const getCallLabel = ({ direction, callType }) => {
  switch (callType) {
    case CALL_TYPE.MISSED:
      return "Missed call";
    case CALL_TYPE.VOICEMAIL:
      return "Voicemail";
    case CALL_TYPE.ANSWERED: {
      return MAP_PROPS_TO_DIRECTION[direction]?.label ?? UNKNOWN;
    }
    default:
      return UNKNOWN;
  }
};

export const getCallIcon = ({ direction, callType }) => {
  switch (callType) {
    case CALL_TYPE.MISSED:
      return PhoneMissed;
    case CALL_TYPE.VOICEMAIL:
      return PhoneCall;
    case CALL_TYPE.ANSWERED: {
      return MAP_PROPS_TO_DIRECTION[direction]?.Icon ?? ShieldQuestion;
    }
    default:
      return ShieldQuestion;
  }
};

const mapCallColorToCallType = {
  [CALL_TYPE.MISSED]: "text-red-500",
  [CALL_TYPE.VOICEMAIL]: "text-blue-500",
  [CALL_TYPE.ANSWERED]: "text-green-500",
};

export const getCallColorClassName = (callType) => {
  return mapCallColorToCallType[callType] ?? "text-secondary-foreground";
};
