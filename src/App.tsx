import Carousel from "./Carousel.tsx";

import "./App.css";

const App = () => {
  return (
    <div className="container">
      <Carousel intervalInMs={3000} />
    </div>
  );
}

export default App;
