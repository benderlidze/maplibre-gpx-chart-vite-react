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

interface SimpleElevationChartProps {
  geoJson: FeatureCollection;
  onHover?: (elevation: number | null, pointIndex: number | null) => void;
  // called with { lat, lng } or null when not hovering
  onPointHover?: (coords: { lat: number; lng: number } | null, pointIndex: number | null) => void;
}

export const ElevationChart: React.FC<SimpleElevationChartProps> = ({
  geoJson,
  onHover,
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
            pointRadius: 0,
            pointHoverRadius: 4,
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: { title: { display: true, text: "Point Index" } },
          y: { title: { display: true, text: "Elevation (m)" } },
        },
        onHover: (event, activeElements) => {
          if (activeElements.length > 0) {
            const index = activeElements[0].index;
            const elevation = elevations[index];
            onHover?.(elevation, index);
            const pt = elevationData[index];
            if (pt && typeof pt.lat === 'number' && typeof pt.lon === 'number') {
              onPointHover?.({ lat: pt.lat, lng: pt.lon }, index);
            } else {
              onPointHover?.(null, index);
            }
          } else {
            onHover?.(null, null);
            onPointHover?.(null, null);
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
  }, [elevationData, onHover]);

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
