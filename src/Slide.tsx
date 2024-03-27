import Picture from "./Picture.tsx";
import Text from "./Text.tsx";

import { Memory, MediaType } from "./models.ts";

import "./Slide.css";

interface Props {
  memory: Memory;
}

const Slide = ({ memory }: Props) => {
  const source = memory.source;

  return (
    <div className="slide">
      {source.kind === MediaType.Picture && (<Picture url={source.url} />)}
      {source.kind === MediaType.Text && (<Text path={source.path} base={source.base} />)}
    </div>
  );
}

export default Slide;
