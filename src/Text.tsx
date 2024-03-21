import { useState, useEffect } from "react";

import { readTextFile, BaseDirectory } from '@tauri-apps/api/fs';

import "./Text.css";

interface Props {
  path: string;
  base: BaseDirectory;
}

const Text = ({ path, base }: Props) => {
  const [text, setText] = useState("");

  useEffect(() => {
    const fetchText = async () => {
      const content = await readTextFile(path, { dir: base });
      setText(content);
    };

    fetchText();
  });

  return (
    <p className="text">{text}</p>
  )
}

export default Text;
