import Carousel from "./Carousel.tsx";

import "./App.css";

const App = () => {
  const intervalInSeconds = parseInt(import.meta.env.VITE_INTERVAL_IN_SECS ?? 10);

  console.debug({
    intervalInSeconds,
    mode: import.meta.env.MODE,
  })

  return (
    <div className="container">
      <Carousel intervalInMs={intervalInSeconds * 1000} />
    </div>
  );
}

export default App;
