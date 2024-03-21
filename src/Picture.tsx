import { useState, useEffect, useRef } from "react";

import "./Picture.css";

enum Orientation {
  Pending,
  Landscape,
  Portrait
}

interface Props {
  url: string;
}

const Picture = ({ url }: Props) => {
  const [orientation, setOrientation] = useState<Orientation>(Orientation.Pending);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = imgRef.current;

    if (img) {
      img.onload = () => {
        const isLandscape = img.naturalWidth > img.naturalHeight;
        setOrientation(isLandscape ? Orientation.Landscape : Orientation.Portrait);
      };

      img.src = url;
    }
  }, [url]);

  const getClass = (() => {
    switch (orientation) {
      case Orientation.Pending:
        return "img-display-none"
      case Orientation.Portrait:
        return "img-display-portrait"
      case Orientation.Landscape:
        return "img-display-landscape"
    }
  });

  return (
    <img ref={imgRef} src={url} className={getClass()} />
  );
}

export default Picture;
