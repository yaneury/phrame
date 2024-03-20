import { useState, useEffect, useRef } from "react";
import { TransitionGroup } from "react-transition-group";

import Slide, { Category, Visibility } from "./Slide.tsx";

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
  const slides = useRef(DATA);
  const timerIdRef = useRef(0);

  const [position, setPosition] = useState(0);
  const [visibility, setVisibility] = useState(Visibility.FadeIn);

  const startTimer = () => {
    timerIdRef.current = setInterval(() => {
      setPosition((position + 1) % slides.current.length);
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

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisibility(Visibility.Active);
    }, 500)

    return () => clearTimeout(timeout);
  }, [visibility])

  const fadeToSlide = (forward: boolean) => {
    const size = slides.current.length;
    setVisibility(Visibility.FadeOut);
    setTimeout(() => {
      setVisibility(Visibility.Hide);
      if (forward) {
        setPosition((position + 1) % size);
        setVisibility(Visibility.FadeIn);
      } else {
        setPosition((((position - 1) % size) + size) % size);
        setVisibility(Visibility.FadeIn);
      }
      setTimeout(() => {
        setVisibility(Visibility.Active);
      }, 500)
    }, 500);

  }

  const onChangeSlide = (forward: boolean) => {
    const size = slides.current.length;
    if (forward) {
      setPosition((position + 1) % size);
    } else {
      setPosition((((position - 1) % size) + size) % size);
    }

    resetTimer();
  }

  return (
    <div className="carousel">
      <TransitionGroup>
        <Slide content={slides.current[position]} visibility={visibility} />
      </TransitionGroup>
      <div className="carousel-actions">
        <button id="carousel-button-prev" onClick={() => onChangeSlide(false)}></button>
        <button id="carousel-button-next" onClick={() => onChangeSlide(true)}></button>
      </div>
    </div>
  );
}

export default Carousel;
