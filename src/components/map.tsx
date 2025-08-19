import React, { useEffect, useRef } from "react";
import { Map, Source, Layer } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import bbox from "@turf/bbox";
import "maplibre-gl/dist/maplibre-gl.css";

type Props = {
  geojson?: GeoJSON.FeatureCollection | null;
};

export const MapComponent: React.FC<Props> = ({ geojson = null }) => {
  const mapRef = useRef<MapRef | null>(null);

  useEffect(() => {
    if (!geojson) return;

    try {
      const b = bbox(geojson);
      if (!b || b.length !== 4 || !b.every(Number.isFinite)) return;
      mapRef.current
        ?.getMap()
        ?.fitBounds(b, { padding: 40, maxZoom: 16, duration: 600 });
    } catch {
      // ignore
    }
  }, [geojson]);

  return (
    <div className="w-full h-96">
      <Map
        ref={mapRef}
        initialViewState={{ latitude: 40, longitude: -100, zoom: 3 }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        interactiveLayerIds={["gpx-line"]}
      >
        {geojson && (
          <Source id="gpx-source" type="geojson" data={geojson}>
            <Layer
              id="gpx-line"
              type="line"
              paint={{
                "line-color": "#ef4444",
                "line-width": 4,
                "line-opacity": 0.95,
              }}
              layout={{
                "line-join": "round",
                "line-cap": "round",
              }}
            />
          </Source>
        )}
      </Map>
    </div>
  );
};
