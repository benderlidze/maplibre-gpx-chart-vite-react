// SimpleElevationChart.tsx
import React, { useRef, useEffect, useMemo } from "react";
import {
  Chart as ChartJS,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
} from "chart.js";
import { length, lineString } from "@turf/turf";
import type { FeatureCollection, Feature, LineString } from "geojson";

// Register required components
ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale
);

export type HoverPoint = {
  elevation: number;
  index: number;
  lat: number;
  lon: number;
  distance: number;
};

interface SimpleElevationChartProps {
  geoJson: FeatureCollection;
  onPointHover?: (hoverPoint: HoverPoint) => void;
}

export const ElevationChart: React.FC<SimpleElevationChartProps> = ({
  geoJson,
  onPointHover,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  // Extract elevation data from GeoJSON and calculate cumulative distances
  const elevationData = useMemo(() => {
    const trackFeature = geoJson.features.find(
      (f): f is Feature<LineString> => f.geometry.type === "LineString"
    );

    if (!trackFeature) return [];

    const coordinates = trackFeature.geometry.coordinates;

    return coordinates
      .map((coord, index) => {
        // Calculate cumulative distance up to this point
        const segmentCoords = coordinates.slice(0, index + 1);
        const distance =
          index === 0
            ? 0
            : length(lineString(segmentCoords), { units: "kilometers" });

        return {
          elevation: coord[2],
          index,
          lat: coord[1],
          lon: coord[0],
          distance,
        };
      })
      .filter(
        (point) =>
          typeof point.elevation === "number" &&
          Number.isFinite(point.elevation)
      );
  }, [geoJson]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || elevationData.length === 0) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Create labels with distances (rounded to 2 decimal places)
    const labels = elevationData.map((point) => point.distance.toFixed(2));
    const elevations = elevationData.map((point) => point.elevation);

    // Create chart
    chartRef.current = new ChartJS(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            data: elevations,
            borderColor: "rgb(34, 197, 94)",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: "rgb(239, 68, 68)",
            pointHoverBorderColor: "rgb(255, 255, 255)",
            pointHoverBorderWidth: 2,
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: {
          intersect: false,
          mode: "nearest",
        },
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Distance (km)",
            },
          },
          y: {
            title: {
              display: true,
              text: "Elevation (m)",
            },
          },
        },
        onHover: (_event, activeElements) => {
          if (activeElements.length > 0) {
            const index = activeElements[0].index;
            const point = elevationData[index];
            onPointHover?.(point);
          }
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [elevationData, onPointHover]);

  if (elevationData.length === 0) {
    return (
      <div
        style={{
          height: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <p>No elevation data found</p>
      </div>
    );
  }

  return (
    <div style={{ height: "300px" }}>
      <canvas ref={canvasRef} />
    </div>
  );
};
