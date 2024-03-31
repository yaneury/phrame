import { useState, useEffect, useContext } from "react";

import { info } from "tauri-plugin-log-api";

import Slideshow from "./Slideshow.tsx";
import { ConfigContext, SortOrder } from "./ConfigProvider.tsx";

import { fetchMemoriesFromDataDirectory, fetchMemoriesFromSampleDirectory } from './service.ts';
import { Memory, AwaitableResult } from "./models.ts";

import "./App.css";

const App = () => {
  const [state, setState] = useState<AwaitableResult<Memory[]>>({ kind: "loading" });
  const { intervalInSeconds, useDataDir, sortBy } = useContext(ConfigContext);

  useEffect(() => {
    const fetchMemories = async () => {
      info(`Fetching memories`);
      const maybeMemories = useDataDir ? await fetchMemoriesFromDataDirectory() : fetchMemoriesFromSampleDirectory();

      info(`Memories fetched: ${JSON.stringify(maybeMemories)}`)
      if (maybeMemories.kind === "error") {
        setState(maybeMemories);
      } else if (sortBy == SortOrder.Random) {
        setState({
          kind: "value",
          value: shuffle(maybeMemories.value)
        })
      } else {
        setState({
          kind: "value",
          value: sort(maybeMemories.value)
        })
      }
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
        <Slideshow intervalInMs={intervalInSeconds * 1000} memories={state.value} />
      )}
      {state.kind === "error" && (
        <p className="red-text">Error: {state.message}</p>
      )}
    </div>
  );
}

const shuffle = (elements: Memory[]): Memory[] => {
  for (let i = 0; i < elements.length; i++) {
    const j = Math.floor(Math.random() * (i + 1));
    [elements[i], elements[j]] = [elements[j], elements[i]];
  }

  return elements;
}

const sort = (elements: Memory[]): Memory[] => {
  const copy = [...elements]
  copy.sort((a: Memory, b: Memory) => {
    const aSeconds = a.created.getTime() / 1000;
    const bSeconds = b.created.getTime() / 1000;
    return bSeconds - aSeconds;
  });

  return copy;
}

export default App;
