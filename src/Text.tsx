import { Quote } from "./models";

import "./Text.css";

interface Props {
  quote: Quote;
}

const Text = ({ quote }: Props) => {
  return (
    <div className="text-container">
      <span className="text">{JSON.stringify(quote)}</span>
    </div>
  )
}

export default Text;
