import { clsx } from "clsx";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";

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
