import { useState, useEffect, useContext } from "react";

import { info } from "tauri-plugin-log-api";

import SlideShow from "./Slideshow.tsx";
import { ConfigContext } from "./ConfigProvider.tsx";

import { fetchMemoriesFromDataDirectory, fetchMemoriesFromSampleDirectory } from './service.ts';
import { Memory, AwaitableResult } from "./models.ts";

import "./App.css";

const App = () => {
  const [state, setState] = useState<AwaitableResult<Memory[]>>({ kind: "loading" });
  const { intervalInSeconds, useDataDir } = useContext(ConfigContext);

  useEffect(() => {
    const fetchMemories = async () => {
      info(`Fetching memories`);
      const maybeMemories = useDataDir ? await fetchMemoriesFromDataDirectory() : fetchMemoriesFromSampleDirectory();

      info(`Memories fetched: ${JSON.stringify(maybeMemories)}`)
      setState(maybeMemories);
    };

    fetchMemories();
  }, []);

  return (
    <div className="container">
      {(state.kind === "loading") && (
        <div>
          <p className="white-text">Loading</p>
        </div>
      )}
      {state.kind === "value" && (
        <SlideShow intervalInMs={intervalInSeconds * 1000} memories={state.value} />
      )}
      {state.kind === "error" && (
        <p className="red-text">Error: {state.message}</p>
      )}
    </div>
  );
}

export default App;
