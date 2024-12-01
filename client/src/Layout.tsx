import { ReactNode } from "react";

export default function Layout({
  children,
  slot,
}: {
  children: ReactNode;
  slot?: ReactNode;
}) {
  return (
    <main className="w-[100dvw] h-[100dvh] flex flex-col justify-center items-center  container border mx-auto">
      <nav
        id="navbar"
        className="container mx-auto flex justify-between items-center"
      >
        <h1 className=" p-8 text-4xl">Tower 🏰</h1>
        <div id="nav-slot">{slot}</div>
      </nav>
      {children}
    </main>
  );
}
