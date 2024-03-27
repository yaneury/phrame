import { useState, useEffect, useRef } from "react";
import { info } from "tauri-plugin-log-api";

import Slide from "./Slide.tsx";

import { Memory, AwaitableResult } from "./models.ts";
import { DEV } from "./config.ts";
import { fetchMemoriesFromDataDirectory, fetchMemoriesFromSampleDirectory } from './service.ts';

import "./Carousel.css";

interface Props {
  intervalInMs: number;
  useDataDir: boolean;
}

interface State {
  position: number;
  memories: Memory[];
}

const Carousel = ({ intervalInMs, useDataDir }: Props) => {
  const [state, setState] = useState<AwaitableResult<State>>({ kind: "loading" });
  const timerIdRef = useRef(0);

  useEffect(() => {
    const fetchMemories = async () => {
      info(`Fetching memories`);
      const maybeMemories = useDataDir ? await fetchMemoriesFromDataDirectory() : fetchMemoriesFromSampleDirectory();

      info(`Memories fetched: ${JSON.stringify(maybeMemories)}`)

      if (maybeMemories.kind === "value") {
        info(`Fetched ${maybeMemories.value.length} memories`)
        setState({
          kind: "value", value: {
            position: 0,
            memories: maybeMemories.value
          }
        })
      } else {
        info(`Failed to fetch memories: ${maybeMemories.message}`)
        setState({ kind: "error", message: maybeMemories.message })
      }
    };

    fetchMemories();
  }, []);

  const startTimer = () => {
    if (state.kind !== "value")
      return;

    const { position, memories } = state.value;

    timerIdRef.current = setInterval(() => {
      setState({
        kind: "value",
        value: {
          position: (position + 1) % memories.length,
          memories,
        }
      })
    }, intervalInMs);
  }

  const resetTimer = () => {
    clearInterval(timerIdRef.current);
    startTimer();
  };

  useEffect(() => {
    if (timerIdRef.current === null)
      startTimer();

    return () => clearInterval(timerIdRef.current);
  }, [state]);

  const onChangeSlide = (forward: boolean) => {
    if (state.kind !== "value")
      return;

    const { position, memories } = state.value;

    const size = memories.length;
    const newPosition = forward ? (position + 1) % size : (((position - 1) % size) + size) % size

    setState({
      kind: "value",
      value: {
        position: newPosition,
        memories,
      }
    })

    resetTimer();
  }

  return (
    <div className="carousel">
      {(state.kind === "loading") && (
        <div>
          <p className="white-text">Loading</p>
        </div>
      )}
      {state.kind === "value" && (
        state.value.memories.map((memory, i) => (
          <Slide key={i} memory={memory} visible={i === state.value.position} />
        ))
      )}
      {state.kind === "error" && (
        <p className="red-text">Error: {state.message}</p>
      )}
      {DEV &&
        <div className="carousel-actions">
          <button id="carousel-button-prev" onClick={() => onChangeSlide(false)}></button>
          <button id="carousel-button-next" onClick={() => onChangeSlide(true)}></button>
        </div>
      }
    </div>
  );
}

export default Carousel;
