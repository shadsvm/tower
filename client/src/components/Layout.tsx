import { ReactNode } from "react";

export default function Layout({
  children,
  slot,
}: {
  children: ReactNode;
  slot?: ReactNode;
}) {
  return (
    <main className="w-[100dvw] h-[100dvh] flex flex-col">
      <div className="w-full container mx-auto flex  flex-row justify-around items-end">
        <div className="  w-fit p-8 text-4xl">Tower 🏰</div>
        <div className="">{slot}</div>
      </div>
      {children}
    </main>
  );
}
