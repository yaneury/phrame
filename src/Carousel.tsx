import { useState } from "react";

import Slide from "./Slide.tsx";

import ImageWithBackground from "./ImageWithBackground.tsx";

import "./Carousel.css";

interface Slide {
  url: string;
  visible: boolean;
}

const DATA = [
  "https://images.unsplash.com/photo-1537211261771-e525b9e4049b?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=450&q=80",
  "https://images.unsplash.com/photo-1503925802536-c9451dcd87b5?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=450&q=80",
  "https://images.unsplash.com/photo-1509558567730-6c838437b06b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=450&q=80",
  "/release/a.jpg",
  "/release/b.jpg",
  "/release/c.jpg",
  "/release/d.jpg",
  "/release/e.jpg"
]

const Carousel = () => {
  const [position, setPosition] = useState(0);
  const [slides, _] = useState<Slide[]>(
    DATA.map((url) => ({
      url,
      visible: false
    }))
  );

  const onChangeSlide = (forward: boolean) => {
    const size = slides.length;
    if (forward) {
      setPosition((position + 1) % size);
    } else {
      setPosition((((position - 1) % size) + size) % size);
    }
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
