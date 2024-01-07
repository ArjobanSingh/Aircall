import { Outlet } from "react-router-dom";

export default function Root() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="w-full max-w-[400px] h-full">
        <Outlet />
      </div>
    </div>
  );
}
