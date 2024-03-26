import { listen } from '@tauri-apps/api/event'
import { useEffect } from "react";

import Carousel from "./Carousel.tsx";

import "./App.css";

const App = () => {
  const intervalInSeconds = parseInt(import.meta.env.VITE_INTERVAL_IN_SECS ?? 10);
  const useDataDir = import.meta.env.VITE_USE_DATA_DIR === "true";

  console.debug({
    intervalInSeconds,
    useDataDir,
    mode: import.meta.env.MODE,
  })

  // Only install listener for data directory if envvar |VITE_USE_DATA_DIR| is true.
  if (useDataDir) {
    useEffect(() => {
      const setupEntryListener = async () => {
        const unlisten = await listen('entries_changed', (event) => {
          console.log(event)
        })

        console.log(unlisten);
      }

      setupEntryListener();
    });
  }

  return (
    <div className="container">
      <Carousel intervalInMs={intervalInSeconds * 1000} useDataDir={useDataDir} />
    </div>
  );
}

export default App;
