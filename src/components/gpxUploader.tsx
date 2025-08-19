import React, { useRef } from "react";
import { gpx } from "@tmcw/togeojson";
import type { GPXData } from "../App";

type Props = {
  onGeoJSON?: (data: GPXData) => void;
};

export const GPXUploader: React.FC<Props> = ({ onGeoJSON }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "application/xml");
        const geojson = gpx(xml);
        console.log("Converted GeoJSON:", geojson);
        if (onGeoJSON) onGeoJSON({ gpx: text, geojson });
      } catch (err) {
        console.error("Error converting GPX to GeoJSON", err);
        alert("Failed to convert GPX file to GeoJSON");
      }
    };
    reader.onerror = () => {
      console.error("FileReader error", reader.error);
      alert("Failed to read file");
    };

    reader.readAsText(file);
    // reset input so the same file can be re-selected if needed
    e.currentTarget.value = "";
  };

  return (
    <div className="absolute top-2 left-2 z-10">
      <input
        ref={inputRef}
        type="file"
        accept=".gpx,application/gpx+xml,application/xml,text/xml"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <button
        type="button"
        onClick={openFilePicker}
        aria-label="Upload GPX file"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transform transition-transform duration-150 active:translate-y-0.5 font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
      >
        <svg
          className="w-5 h-5 text-gray-700"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M12 3v10"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 7l4-4 4 4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 21H3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>Upload GPX</span>
      </button>
    </div>
  );
};
