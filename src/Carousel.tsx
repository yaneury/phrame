import { useState, useEffect, useRef } from "react";
import { info } from "tauri-plugin-log-api";

import Slide from "./Slide.tsx";

import { Memory, State } from "./models.ts";
import { DEV } from "./config.ts";
import { fetchMemoriesFromDataDirectory, fetchMemoriesFromSampleDirectory } from './service.ts';

import "./Carousel.css";

interface Props {
  intervalInMs: number;
  useDataDir: boolean;
}

const Carousel = ({ intervalInMs, useDataDir }: Props) => {
  const [position, setPosition] = useState(0);
  const [memories, setMemories] = useState<State<Memory[]>>({ status: "loading" });
  const timerIdRef = useRef(0);

  useEffect(() => {
    const fetchMemories = async () => {
      info(`Fetching memories`);
      const maybeMemories = useDataDir ? await fetchMemoriesFromDataDirectory() : fetchMemoriesFromSampleDirectory();

      info(`Memories fetched: ${JSON.stringify(maybeMemories)}`)

      if (maybeMemories.kind === "value") {
        info(`Fetched ${maybeMemories.value.length} memories`)
        setMemories({ status: "success", value: maybeMemories.value })
      } else {
        info(`Failed to fetch memories: ${maybeMemories.message}`)
        setMemories({ status: "error", error: maybeMemories.message })
      }
    };

    fetchMemories();
  }, []);

  const startTimer = () => {
    if (memories.status !== "success")
      return;

    timerIdRef.current = setInterval(() => {
      setPosition((position + 1) % memories.value.length);
    }, intervalInMs);
  }

  const resetTimer = () => {
    clearInterval(timerIdRef.current);
    startTimer();
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerIdRef.current);
  }, [memories, position]);

  const onChangeSlide = (forward: boolean) => {
    if (memories.status !== "success")
      return;

    const size = memories.value.length;
    if (forward) {
      setPosition((position + 1) % size);
    } else {
      setPosition((((position - 1) % size) + size) % size);
    }

    resetTimer();
  }

  return (
    <div className="carousel">
      {(memories.status === "loading") && (
        <div>
          <p className="white-text">Loading</p>
        </div>
      )}
      {memories.status === "success" && (
        memories.value.map((memory, i) => (
          <Slide key={i} memory={memory} visible={i === position} />
        ))
      )}
      {memories.status === "error" && (
        <p className="red-text">Error: {memories.error}</p>
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
