import Picture from "./Picture.tsx";
import Text from "./Text.tsx";
import Video from "./Video.tsx";

import "./Slide.css";

export enum Category {
  Picture,
  Video,
  Text
}

export interface Content {
  url: string;
  category: Category;
}

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
      {content.category === Category.Picture && (<Picture url={content.url} />)}
      {content.category === Category.Video && (<Video url={content.url} onUpdate={console.log} />)}
      {content.category === Category.Text && (<Text url={content.url} />)}
    </div>
  );
}

export default Slide;
