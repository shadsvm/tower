import { ComponentProps, ReactNode } from "react";
import Toast from "./Toast";

export default function Layout({
  children,
  ...rest
}: {
  children: ReactNode;
} & ComponentProps<"div">) {
  return (
    <main className="w-dvw h-dvh flex flex-col text-white">
      <div {...rest} className="flex-1 flex justify-center items-center">
        {children}
      </div>
      <Toast />
    </main>
  );
}
