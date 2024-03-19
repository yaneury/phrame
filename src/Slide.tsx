import "./Slide.css";

interface Props {
  url: string;
  visible: boolean;
}

const Slide = ({ url, visible }: Props) => {
  let classes = ["slide"];
  if (visible) {
    classes.push("fade-visible");
  } else {
    classes.push("hidden")
  }

  return (
    <div className={classes.join(" ")}>
      <img src={url} />
    </div>
  );
}

export default Slide;
