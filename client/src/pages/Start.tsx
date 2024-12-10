import { Dispatch, FormEvent, SetStateAction, useEffect, useState } from "react";

export default function Start({
  setUsername,
}: {
  setUsername: Dispatch<SetStateAction<string>>;
}) {
  const [input, setInput] = useState('');

  const [serverStatus, setServerStatus] = useState(false);


  useEffect(() => {
    console.log(`${window.location.hostname}:3000`)
  const getServerStatus = async () => {
    try {
      const data = await fetch(`/api/status`)
      const status = await data.text()
      setServerStatus(!!status)
    } catch {
      setServerStatus(false)
    }
  }

  getServerStatus()
  }, [])

  const validateUsername = () => {
    const trimmed = input.trim();
    return trimmed.length >= 3 && trimmed.length <= 9;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (validateUsername()) {
      setUsername(input);
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
          // disabled={!serverStatus || !validateUsername()}
          className={`btn btn-success disabled:btn-outline-error `}
        >
          Connect
        </button>
      </form>
    </div>
  );
}
