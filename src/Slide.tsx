import Video from "./Video.tsx";

import "./Slide.css";

export enum Category {
  Picture,
  Video,
  Note,
  Quote
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
      {content.category === Category.Picture
        ? <img src={content.url} />
        : <Video url={content.url} onUpdate={console.log} />
      }
    </div>
  );
}

export default Slide;
