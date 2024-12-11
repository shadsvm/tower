import { UseSocket } from "@/hooks/useSocket";
import { useEffect, useRef } from "react";

export default function Toast({ socket }: { socket: UseSocket; }) {

  const toastRef = useRef<HTMLDivElement | null>(null);
  console.group('Toast')

  useEffect(() => {
    if (!toastRef.current) return;
    toastRef.current.innerText = socket.state.message;
    toastRef.current?.classList.replace('opacity-0', 'opacity-100' )
    console.debug(toastRef.current.innerText)

    const timer = setTimeout(() => {
      toastRef.current?.classList.replace('opacity-100', 'opacity-0')
      console.debug('toggleAttribute: hidden')

    }, 3000); // delay

    return () => {
      clearTimeout(timer);
    };
  }, [socket.state.message]);

  console.groupEnd()

  return (
    <div ref={toastRef} className="absolute right-3 bottom-3 opacity-0 transition z-50! btn btn-white">
    </div>
  );

}
