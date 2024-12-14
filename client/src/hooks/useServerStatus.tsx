import { useEffect, useState } from "react";

export function useServerStatus() {
  const [serverStatus, setServerStatus] = useState(false)

  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch("/api/status");
        setServerStatus(!!res.ok);
      } catch {
        setServerStatus(false);
      }
    };
    checkServer();
  }, []);


  return serverStatus
}
