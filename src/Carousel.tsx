import { useState, useEffect, useRef } from "react";

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
  const [memories, setMemories] = useState<State<Memory[]>>({ status: "pending" });
  const timerIdRef = useRef(0);

  useEffect(() => {
    const fetchContent = async () => {
      const maybeMemories = useDataDir ? await fetchMemoriesFromDataDirectory() : fetchMemoriesFromSampleDirectory();
      console.log(JSON.stringify(maybeMemories))

      if (maybeMemories.kind === "value") {
        setMemories({ status: "success", value: maybeMemories.value })
      } else {
        setMemories({ status: "error", error: maybeMemories.message })
      }
    };

    fetchContent();
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
      {memories.status === "pending" && (
        <p className="white-text">Pending!</p>
      )}
      {memories.status === "loading" && (
        <p className="white-text">Loading!</p>
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
