import Picture from "./Picture.tsx";
import Text from "./Text.tsx";

import { Memory, MediaType } from "./models.ts";

import "./Slide.css";

interface Props {
  memory: Memory;
  visible: boolean;
}

const Slide = ({ memory, visible }: Props) => {
  let classes = ["slide"];
  if (visible) {
    classes.push("fade-visible");
  } else {
    classes.push("hidden")
  }

  const source = memory.source;

  return (
    <div className={classes.join(" ")}>
      {source.kind === MediaType.Picture && (<Picture url={source.url} />)}
      {source.kind === MediaType.Text && (<Text path={source.path} base={source.base} />)}
    </div>
  );
}

export default Slide;
