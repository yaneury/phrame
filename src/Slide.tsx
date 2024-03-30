import Picture from "./Picture.tsx";
import Text from "./Text.tsx";

import { Memory, MediaType } from "./models.ts";

import "./Slide.css";

interface Props {
  memory: Memory;
}

const Slide = ({ memory }: Props) => {
  const type = memory.type;

  return (
    <div className="slide">
      {type === MediaType.Picture && (<Picture source={memory.source} />)}
      {type === MediaType.Text && (<Text path={memory.source.path} base={memory.source.base} />)}
    </div>
  );
}

export default Slide;
