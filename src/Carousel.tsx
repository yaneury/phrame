import { useState, useEffect, useRef } from "react";

import Slide from "./Slide.tsx";

import "./Carousel.css";

interface Slide {
  url: string;
  visible: boolean;
}

const DATA = [
  "/release/turtle.jpg",
  "/release/a.jpg",
  "/release/b.jpg",
  "/release/c.jpg",
  "/release/d.jpg",
  "/release/e.jpg"
]

interface Props {
  intervalInMs: number;
}

const Carousel = ({ intervalInMs }: Props) => {
  const [position, setPosition] = useState(0);
  const [slides, _] = useState<Slide[]>(
    DATA.map((url) => ({
      url,
      visible: false
    }))
  )
  const timerIdRef = useRef(0);

  const startTimer = () => {
    timerIdRef.current = setInterval(() => {
      setPosition((position + 1) % slides.length);
    }, intervalInMs);
  }

  const resetTimer = () => {
    clearInterval(timerIdRef.current);
    startTimer();
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerIdRef.current);
  }, [slides, position]);

  const onChangeSlide = (forward: boolean) => {
    const size = slides.length;
    if (forward) {
      setPosition((position + 1) % size);
    } else {
      setPosition((((position - 1) % size) + size) % size);
    }

    resetTimer();
  }

  return (
    <div className="carousel">
      {slides.map((s, i) => (
        <Slide key={i} url={s.url} visible={i === position} />
      ))}
      <div className="carousel-actions">
        <button id="carousel-button-prev" onClick={() => onChangeSlide(false)}></button>
        <button id="carousel-button-next" onClick={() => onChangeSlide(true)}></button>
      </div>
    </div>
  );
}

export default Carousel;
