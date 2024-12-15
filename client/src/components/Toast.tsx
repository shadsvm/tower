import { useSocketStore } from "@/store/socket";
import { useEffect, useRef } from "react";

export default function Toast() {
  const messages = useSocketStore(({state}) => state.messages);
  const toastRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!messages.length || !toastRef.current) return;
    toastRef.current?.classList.replace('opacity-0', 'opacity-100' )

    const timer = setTimeout(() => {
      toastRef.current?.classList.replace('opacity-100', 'opacity-0')
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [messages]);

  return (
    <div ref={toastRef} className="absolute right-3 bottom-3 opacity-0 transition z-50! btn btn-white">
      {messages[messages.length - 1]}
    </div>
  );

}
