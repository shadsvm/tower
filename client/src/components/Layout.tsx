import { ComponentProps, ReactNode } from "react";
import Toast from "./Toast";

export default function Layout({
  children,
  slot,
  ...rest
}: {
  children: ReactNode;
  slot?: ReactNode;
} & ComponentProps<"div">) {
  return (
    <main className="w-dvw h-dvh flex flex-col text-white">
      <nav className="flex-none container mx-auto flex flex-row justify-around items-end">

        <div id="layoutPortal" className="">
          {slot}
        </div>
      </nav>

      <div {...rest} className="flex-1 flex justify-center items-center">
        {children}
      </div>
      <Toast />
    </main>
  );
}
