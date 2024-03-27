import { useState, useEffect, useRef } from "react";

import Slide from "./Slide.tsx";

import { Memory } from "./models.ts";
import { DEV } from "./config.ts";

import "./Slideshow.css";

interface Props {
  memories: Memory[];
  intervalInMs: number;
}

const Slideshow = ({ memories, intervalInMs }: Props) => {
  const [position, setPosition] = useState(0);
  const timerIdRef = useRef<number | null>(null);

  const startTimer = () => {
    if (timerIdRef.current !== null)
      clearInterval(timerIdRef.current);

    timerIdRef.current = setInterval(() => {
      setPosition((position + 1) % memories.length);
    }, intervalInMs);
  }

  useEffect(() => {
    startTimer();
    return /*cleanup*/ () => {
      if (timerIdRef.current !== null)
        clearInterval(timerIdRef.current);
    }
  }, [position]);

  const onChangeSlide = (forward: boolean) => {
    const size = memories.length;
    const newPosition = forward ? (position + 1) % size : (((position - 1) % size) + size) % size
    setPosition(newPosition);
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

export default Slideshow;
