import Picture from "./Picture.tsx";

import { Memory, MediaType } from "./models.ts";

import "./Slide.css";

interface Props {
  memory: Memory;
}

const Slide = ({ memory }: Props) => {
  const type = memory.type;

  return (
    <div className="slide">
      {type === MediaType.Picture && (<Picture location={memory.location} />)}
    </div>
  );
}

export default Slide;
