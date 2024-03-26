import { invoke } from '@tauri-apps/api/tauri'
import { BaseDirectory, appDataDir, join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { useState, useEffect, useRef } from "react";

import Slide from "./Slide.tsx";

import Content, { Category, FetchCommandValue } from "./models.ts";
import { DEV } from "./config.ts";
import { fetchSlidesFromDataDirectory, fetchSlidesFromSampleDirectory } from './service.ts';

import "./Carousel.css";

interface Props {
  intervalInMs: number;
  useDataDir: boolean;
}

const Carousel = ({ intervalInMs, useDataDir }: Props) => {
  const [position, setPosition] = useState(0);
  const [content, setContent] = useState<Content[]>([]);
  const timerIdRef = useRef(0);

  useEffect(() => {
    const fetchContent = async () => {
      const results = useDataDir ? await fetchSlidesFromDataDirectory() : fetchSlidesFromSampleDirectory();
      setContent(results);
    };

    fetchContent();
  }, []);

  const startTimer = () => {
    timerIdRef.current = setInterval(() => {
      setPosition((position + 1) % content.length);
    }, intervalInMs);
  }

  const resetTimer = () => {
    clearInterval(timerIdRef.current);
    startTimer();
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerIdRef.current);
  }, [content, position]);

  const onChangeSlide = (forward: boolean) => {
    const size = content.length;
    if (forward) {
      setPosition((position + 1) % size);
    } else {
      setPosition((((position - 1) % size) + size) % size);
    }

    resetTimer();
  }

  return (
    <div className="carousel">
      {content.map((c, i) => (
        <Slide key={i} content={c} visible={i === position} />
      ))}
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
