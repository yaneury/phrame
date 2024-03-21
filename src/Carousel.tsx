import { invoke } from '@tauri-apps/api/tauri'
import { BaseDirectory, appDataDir, join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { useState, useEffect, useRef } from "react";

import Slide from "./Slide.tsx";

import Content, { Category } from "./models.ts";

import "./Carousel.css";

const SEED = [
  {
    filename: "sample.txt",
    category: Category.Text,
  },
  {
    filename: "a.jpg",
    category: Category.Picture,
  },
  {
    filename: "c.jpg",
    category: Category.Picture,
  },
]

interface Props {
  intervalInMs: number;
}

const Carousel = ({ intervalInMs }: Props) => {
  const [position, setPosition] = useState(0);
  const [slides, setSlides] = useState<Content[]>([]);
  const timerIdRef = useRef(0);

  useEffect(() => {
    invoke('fetch').then((message) => console.log(message))

    const fetchAssetUrls = async () => {
      const appDataDirPath = await appDataDir();

      const results: Content[] = await Promise.all(SEED.map(async ({ filename, category }) => {
        const path = `assets/${filename}`;
        if (category === Category.Text) {
          return {
            kind: category,
            path: path,
            base: BaseDirectory.AppData
          }
        }

        const filePath = await join(appDataDirPath, path);
        const assetUrl = convertFileSrc(filePath);

        return {
          kind: category,
          url: assetUrl,
        }
      }));

      setSlides(results);
    };

    fetchAssetUrls();
  }, []);

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
