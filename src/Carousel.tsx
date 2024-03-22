import { invoke } from '@tauri-apps/api/tauri'
import { BaseDirectory, appDataDir, join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { useState, useEffect, useRef } from "react";

import Slide from "./Slide.tsx";

import Content, { Category, FetchCommandValue } from "./models.ts";
import { DEV } from "./config.ts";

import "./Carousel.css";

interface Props {
  intervalInMs: number;
}

const Carousel = ({ intervalInMs }: Props) => {
  const [position, setPosition] = useState(0);
  const [content, setContent] = useState<Content[]>([]);
  const timerIdRef = useRef(0);

  useEffect(() => {
    const fetchContent = async () => {
      const files: FetchCommandValue[] = await invoke('fetch');
      const appDataDirPath = await appDataDir();
      const results = await Promise.all(files.map(async ({ filename, category }) => {
        const path = `assets/${filename}`;
        if (category === "text") {
          return {
            kind: Category.Text,
            path,
            base: BaseDirectory.AppData,
          }
        } else {
          const filePath = await join(appDataDirPath, path);
          const assetUrl = convertFileSrc(filePath);

          return {
            kind: Category.Picture,
            url: assetUrl,
          }
        }
      }));

      // @ts-ignore: Typescript compiler can't deduce that all elements in this list
      // are of Content[]
      setContent(results);
    };

    fetchContent();
  }, []);

  console.log(content)

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
