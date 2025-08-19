import React, { useEffect, useRef } from "react";
import { Map, Source, Layer } from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import bbox from "@turf/bbox";
import "maplibre-gl/dist/maplibre-gl.css";
import type { HoverPoint } from "./gpxChart";

type Props = {
  geojson?: GeoJSON.FeatureCollection | null;
  hoveredPoint?: HoverPoint | null;
};

export const MapComponent: React.FC<Props> = ({
  geojson = null,
  hoveredPoint = null,
}) => {
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

  console.log("Render map");

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
                "line-color": "green",
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

        <Source
          id="hover-point"
          type="geojson"
          data={
            hoveredPoint
              ? {
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: [hoveredPoint.lon, hoveredPoint.lat],
                  },
                  properties: {
                    elevation: hoveredPoint.elevation,
                  },
                }
              : { type: "FeatureCollection", features: [] }
          }
        >
          <Layer
            id="hover-point"
            type="circle"
            paint={{
              "circle-radius": 12,
              "circle-color": "red",
              "circle-opacity": 0.8,
            }}
          />
        </Source>
      </Map>
    </div>
  );
};
