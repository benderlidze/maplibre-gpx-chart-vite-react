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

  // Extract elevation data from GeoJSON
  const elevationData = useMemo(() => {
    const trackFeature = geoJson.features.find(
      (f): f is Feature<LineString> => f.geometry.type === "LineString"
    );

    if (!trackFeature) return [];

    // Extract elevations from coordinates [lon, lat, elevation]
    return trackFeature.geometry.coordinates
      .map((coord, index) => ({
        elevation: coord[2],
        index,
        lat: coord[1],
        lon: coord[0],
      }))
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

    // Create simple labels (just point numbers)
    const labels = elevationData.map((_, i) => i.toString());
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
            pointRadius: 0, // Hide points by default
            pointHoverRadius: 8, // Show larger point on hover
            pointHoverBackgroundColor: "rgb(239, 68, 68)", // Red dot on hover
            pointHoverBorderColor: "rgb(255, 255, 255)", // White border for contrast
            pointHoverBorderWidth: 2, // Border width
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false, // Allow hover anywhere near the line
          mode: "nearest", // Find the nearest point
        },
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: { title: { display: true, text: "Point Index" } },
          y: { title: { display: true, text: "Elevation (m)" } },
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

    // Cleanup
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
