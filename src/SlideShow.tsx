import { useState, useEffect, useRef } from "react";

import Slide from "./Slide.tsx";

import { Memory, AwaitableResult } from "./models.ts";
import { DEV } from "./config.ts";

import "./Slideshow.css";

interface Props {
  memories: Memory[];
  intervalInMs: number;
}

const SlideShow = ({ memories, intervalInMs }: Props) => {
  const [position, setPosition] = useState(0);
  const timerIdRef = useRef(0);

  const startTimer = () => {
    timerIdRef.current = setInterval(() => {
      setPosition((position + 1) % memories.length);
    }, intervalInMs);
  }

  const resetTimer = () => {
    clearInterval(timerIdRef.current);
    startTimer();
  };

  useEffect(() => {
    console.log("Effected")
    startTimer();

    return () => clearInterval(timerIdRef.current);
  }, []);

  const onChangeSlide = (forward: boolean) => {
    clearInterval(timerIdRef.current);

    const size = memories.length;
    const newPosition = forward ? (position + 1) % size : (((position - 1) % size) + size) % size

    setPosition(newPosition);

    resetTimer();
  }

  return (
    <div className="slideshow">
      <Slide memory={memories[position]} />
      {DEV &&
        <div className="slideshow-actions">
          <button id="slideshow-button-prev" onClick={() => onChangeSlide(false)}></button>
          <button id="slideshow-button-next" onClick={() => onChangeSlide(true)}></button>
        </div>
      }
    </div>
  );
}

export default SlideShow;
