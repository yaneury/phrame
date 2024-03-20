import { useState, useEffect, useRef } from "react";

import Slide, { Category } from "./Slide.tsx";

import "./Carousel.css";

const DATA = [
  {
    url: "/release/covid.mp4",
    category: Category.Video,
  },
  {
    url: "/release/a.jpg",
    category: Category.Picture,
  },
  {
    url: "/release/d.jpg",
    category: Category.Picture,
  },
]

interface Props {
  intervalInMs: number;
}

const Carousel = ({ intervalInMs }: Props) => {
  const [position, setPosition] = useState(0);
  const [slides, _] = useState(DATA);
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
      {slides.map((content, i) => (
        <Slide key={i} content={content} visible={i === position} />
      ))}
      <div className="carousel-actions">
        <button id="carousel-button-prev" onClick={() => onChangeSlide(false)}></button>
        <button id="carousel-button-next" onClick={() => onChangeSlide(true)}></button>
      </div>
    </div>
  );
}

export default Carousel;
