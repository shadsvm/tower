import { useServerStatus } from "@/hooks/useServerStatus";
import { useSocketStore } from "@/store/socket";
import { useUserStore } from "@/store/user";
import { FormEvent, useState } from "react";

export default function Start() {
  const {connect} = useSocketStore()
  const {username, setUsername} = useUserStore();
  const [input, setInput] = useState(username ?? '');
  const serverStatus = useServerStatus()

  const validateUsername = () => {
    const trimmed = input.trim();
    return trimmed.length >= 3 && trimmed.length <= 9;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (validateUsername()) {
      setUsername(input);
      connect(username)
    }
  };

  return (
    <div className="card">
      <header className="text-center space-y-3 p-6">
        <div className="text-4xl">Tower</div>
        <div className={ `flex flex-row gap-2 justify-center items-center  ${serverStatus ? 'text-green-700' : 'text-red-400'}`}>
          <div className="size-3 rounded-full border bg-current" />
          <p className="text-sm">Servers Status</p>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 max-w-64"
      >
        <input
          id="username-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          minLength={3}
          maxLength={9}
          placeholder="Username"
          className={``}
        />
        <button
          type="submit"
          disabled={!serverStatus || !validateUsername()}
          className={`btn btn-success disabled:btn-outline-error `}
        >
          Connect
        </button>
      </form>
    </div>
  );
}
