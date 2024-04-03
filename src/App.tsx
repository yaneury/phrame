import { useState, useEffect, useContext } from "react";

import { info } from "tauri-plugin-log-api";

import Slideshow from "./Slideshow.tsx";
import { ConfigContext, SortOrder } from "./ConfigProvider.tsx";

import { fetchMemoriesFromDataDirectory, fetchMemoriesFromSampleDirectory, fetchMusingsFromDataDirectory, fetchMusingsFromSampleDirectory } from './service.ts';
import { Memory, AwaitableResult, Musings } from "./models.ts";

import "./App.css";

interface State {
  memories: Memory[];
  musings: Musings;
}

const App = () => {
  const [state, setState] = useState<AwaitableResult<State>>({ kind: "loading" });
  const { intervalInSeconds, useDataDir, sortBy } = useContext(ConfigContext);

  useEffect(() => {
    const fetchMemories = async () => {
      info(`Fetching memories`);
      const maybeMemories = useDataDir ? await fetchMemoriesFromDataDirectory() : fetchMemoriesFromSampleDirectory();

      info(`Memories fetched: ${JSON.stringify(maybeMemories)}`)
      if (maybeMemories.kind === "error") {
        setState(maybeMemories);
        return;
      } 
      
      let memories = sortBy === SortOrder.Random ? shuffle(maybeMemories.value) : sort(maybeMemories.value);

      info(`Fetching musings`)
      const maybeMusings = useDataDir ? await fetchMusingsFromDataDirectory() : fetchMusingsFromSampleDirectory();
      if (maybeMusings.kind === "error") {
        setState(maybeMusings)
        return;
      }

      setState({
        kind: "value",
        value: {
          memories,
          musings: maybeMusings.value,
        }
      })
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
        <Slideshow intervalInMs={intervalInSeconds * 1000} musings={state.value.musings} memories={state.value.memories} />
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
