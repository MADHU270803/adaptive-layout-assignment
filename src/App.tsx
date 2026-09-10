import { useState } from "react";
import { resolveLayout } from "./resolver";
import { productAd } from "./spec";
import { allSurfaces } from "./surfaces";
import type { SurfaceProfile } from "./surfaces";
import "./App.css";

function App() {
  const [selectedSurface, setSelectedSurface] = useState<SurfaceProfile>(
    allSurfaces[0]
  );

  const layout = resolveLayout(productAd, selectedSurface);

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <div className="picker">
        {allSurfaces.map((surface) => (
          <button
            key={surface.id}
            onClick={() => setSelectedSurface(surface)}
            className={surface.id === selectedSurface.id ? "active" : ""}
          >
            {surface.id}
          </button>
        ))}
      </div>

      <div
        className="surface-box"
        style={{
          width: selectedSurface.width,
          height: selectedSurface.height,
        }}
      >
        {layout
          .filter((el) => el.visible)
          .map((el) => (
            <div
              key={el.id}
              className="element-box"
              style={{
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
              }}
            >
              {el.id}
            </div>
          ))}
      </div>
    </div>
  );
}

export default App;