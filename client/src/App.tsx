function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-4">Tower Defense RTS</h1>

      {/* Test API endpoint */}
      <button
        onClick={async () => {
          const res = await fetch("/api/health");
          console.log(await res.text());
        }}
        className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
      >
        Test API
      </button>

      {/* Test WebSocket */}
      <button
        onClick={() => {
          const ws = new WebSocket("ws://localhost:3000");
          ws.onopen = () => console.log("Connected!");
          ws.onmessage = (e) => console.log("Got message:", e.data);
          ws.onerror = (e) => console.log("WS Error:", e);
        }}
        className="ml-4 px-4 py-2 bg-green-500 rounded hover:bg-green-600"
      >
        Test WebSocket
      </button>
    </div>
  );
}

export default App;
