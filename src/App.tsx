import { useState } from "react";
import { resolveLayout } from "./resolver";
import { productAd } from "./spec";
import { allSurfaces } from "./surfaces";
import type { SurfaceProfile } from "./surfaces";

function App() {
  const [selectedSurface, setSelectedSurface] = useState<SurfaceProfile>(
    allSurfaces[0]
  );

  const layout = resolveLayout(productAd, selectedSurface);

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <div style={{ marginBottom: 20 }}>
        {allSurfaces.map((surface) => (
          <button
            key={surface.id}
            onClick={() => setSelectedSurface(surface)}
            style={{
              marginRight: 8,
              padding: "8px 12px",
              fontWeight: surface.id === selectedSurface.id ? "bold" : "normal",
            }}
          >
            {surface.id}
          </button>
        ))}
      </div>

      <div
        style={{
          position: "relative",
          width: selectedSurface.width,
          height: selectedSurface.height,
          border: "2px solid black",
          background: "#f0f0f0",
          maxWidth: "100%",
        }}
      >
        {layout
          .filter((el) => el.visible)
          .map((el) => (
            <div
              key={el.id}
              style={{
                position: "absolute",
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                background: "steelblue",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                boxSizing: "border-box",
                border: "1px solid white",
                overflow: "hidden",
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