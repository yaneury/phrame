import Picture from "./Picture.tsx";
import Text from "./Text.tsx";
import Video from "./Video.tsx";

import Content, { Category } from "./models.ts";

import "./Slide.css";

interface Props {
  content: Content;
  visible: boolean;
}

const Slide = ({ content, visible }: Props) => {
  let classes = ["slide"];
  if (visible) {
    classes.push("fade-visible");
  } else {
    classes.push("hidden")
  }

  return (
    <div className={classes.join(" ")}>
      {content.kind === Category.Picture && (<Picture url={content.url} />)}
      {content.kind === Category.Video && (<Video url={content.url} onUpdate={console.log} />)}
      {content.kind === Category.Text && (<Text path={content.path} base={content.base} />)}
    </div>
  );
}

export default Slide;
