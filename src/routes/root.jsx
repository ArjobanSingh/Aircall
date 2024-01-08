import { Outlet } from "react-router-dom";

export default function Root() {
  return (
    <div className="flex items-center justify-center w-full h-full bg-neutral-200">
      <div className="w-full max-w-[400px] h-full py-4">
        <div className="w-full h-full overflow-hidden rounded-lg shadow-2xl bg-background">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
