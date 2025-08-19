import { useState, useCallback } from "react";
import { ElevationChart, type HoverPoint } from "./components/gpxChart";
import { GPXUploader } from "./components/gpxUploader";
import { MapComponent } from "./components/map";

export type GPXData = {
  gpx: string | null;
  geojson: GeoJSON.FeatureCollection | null;
};

function App() {
  const [gpxData, setGpxData] = useState<GPXData>({ gpx: null, geojson: null });
  const [hoveredPoint, setHoveredPoint] = useState<HoverPoint | null>(null);

  // Memoize callbacks to prevent unnecessary re-renders
  const onPointHover = useCallback((point: HoverPoint | null) => {
    console.log("Hovered Point:", point);
    setHoveredPoint(point);
  }, []);

  return (
    <>
      <div>
        <GPXUploader onGeoJSON={setGpxData} />
        <MapComponent geojson={gpxData.geojson} hoveredPoint={hoveredPoint} />
      </div>
      <div>
        <div className="p-8 max-w-4xl mx-auto">
          {gpxData.geojson && (
            <div className="space-y-4">
              <ElevationChart
                geoJson={gpxData.geojson}
                onPointHover={onPointHover}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
