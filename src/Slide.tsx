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

export enum Visibility {
  FadeIn,
  Active,
  FadeOut,
  Hide
}

interface Props {
  content: Content;
  visibility: Visibility;
}

const Slide = ({ content, visibility }: Props) => {
  return (
    <div className="slide">
      {content.category === Category.Picture
        ? <img src={content.url} />
        : <Video url={content.url} onUpdate={console.log} />
      }
    </div>
  );
}

export default Slide;
