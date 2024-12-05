import Layout from "@/components/Layout";
import { Dispatch, SetStateAction, useState } from "react";

export default function Start({
  setUsername,
}: {
  setUsername: Dispatch<SetStateAction<string>>;
}) {
  const [input, setInput] = useState("");

  const validateUsername = (name: string) => {
    const trimmed = name.trim();
    return trimmed.length >= 2 && trimmed.length <= 15;
  };

  return (
    <Layout>
      <div className="h-full flex flex-col justify-center items-center gap-8 pb-44">
        <h1 className="text-4xl">What is your name?</h1>
        <div className="nes-field is-inline text-white flex gap-2">
          <input
            id="username-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter username (2-15 chars)"
            className="nes-input is-dark"
          />
          <button
            onClick={() => setUsername(input)}
            className="nes-btn is-primary"
            disabled={!validateUsername(input)}
          >
            Connect
          </button>
        </div>
      </div>
    </Layout>
  );
}
