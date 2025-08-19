import { useState } from "react";
import { ElevationChart } from "./components/gpxChart";
import { GPXUploader } from "./components/gpxUploader";
import { MapComponent } from "./components/map";

export type GPXData = {
  gpx: string | null;
  geojson: GeoJSON.FeatureCollection | null;
};

function App() {
  const [gpxData, setGpxData] = useState<GPXData>({ gpx: null, geojson: null });

  console.log("gpxData", gpxData);
  return (
    <>
      <div>
        <GPXUploader onGeoJSON={setGpxData} />
        <MapComponent geojson={gpxData.geojson} />
      </div>
      <div>
        <div className="p-8 max-w-4xl mx-auto">
          {gpxData.geojson && (
            <div className="space-y-4">
              <ElevationChart
                geoJson={gpxData.geojson}
                onHover={(point) => {
                  console.log("Hovered Point:", point);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
