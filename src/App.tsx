import { listen } from '@tauri-apps/api/event'
import { info } from "tauri-plugin-log-api";
import { useEffect } from "react";

import SlideShow from "./SlideShow.tsx";

import "./App.css";

const App = () => {
  const intervalInSeconds = parseInt(import.meta.env.VITE_INTERVAL_IN_SECS ?? 10);
  const useDataDir = import.meta.env.VITE_USE_DATA_DIR === "true";

  console.debug({
    intervalInSeconds,
    useDataDir,
    mode: import.meta.env.MODE,
  })

  info(`Starting app with ${JSON.stringify({
    intervalInSeconds,
    useDataDir,
    mode: import.meta.env.MODE,
  })}`)

  // Only install listener for data directory if envvar |VITE_USE_DATA_DIR| is true.
  if (useDataDir) {
    useEffect(() => {
      const setupEntryListener = async () => {
        const unlisten = await listen('entries_changed', (event) => {
          info("Entries changed!")
          console.log(event)
        })

        console.log(unlisten);
      }

      setupEntryListener();
    });
  }

  return (
    <div className="container">
      <SlideShow intervalInMs={intervalInSeconds * 1000} useDataDir={useDataDir} />
    </div>
  );
}

export default App;
