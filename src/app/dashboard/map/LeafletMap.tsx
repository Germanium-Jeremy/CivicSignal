"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import * as L from "leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import { IconType } from "react-icons";
import { renderToString } from "react-dom/server";

// Define the Issue interface to match the map page data structure
interface Issue {
  id: string;
  title: string;
  location: string;
  coordinates: { lat: number; lng: number };
  status: string;
  priority: string;
  reportedAt: string;
  category: string;
  description: string;
  trackingNumber?: string;
}

interface LeafletMapProps {
  issues: Issue[];
  statusColors: { [key: string]: string };
  statusIcons: { [key: string]: IconType };
  onIssueClick: (issue: Issue) => void;
  center?: [number, number];
  zoom?: number;
}

export default function LeafletMap({
  issues,
  statusColors,
  statusIcons,
  onIssueClick,
  center = [-1.94995, 30.05885],
  zoom = 13,
}: LeafletMapProps) {
  // Fix Leaflet icon path issue on some builds
  useEffect(() => {
    // Remove default icon override to use custom icons
    delete (L.Icon.Default.prototype as any)._getIconUrl;
  }, []);

  // Create custom icon for each status
  const createCustomIcon = (status: string) => {
    const StatusIcon = statusIcons[status] || statusIcons.submitted; // Changed from 'reported' to 'submitted'
    const color = statusColors[status] || statusColors.submitted; // Changed from 'reported' to 'submitted'

    return L.divIcon({
      className: "custom-icon",
      html: renderToString(
        <div
          style={{
            backgroundColor: color,
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            border: "2px solid white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          <StatusIcon style={{ color: "white", fontSize: "14px" }} />
        </div>,
      ),
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        zoomControl={true}
        doubleClickZoom={true}
        dragging={true}
        minZoom={8}
        maxZoom={18}
        maxBounds={[
          [-1.033023, 28.352711],
          [-3.008813, 31.305375],
        ]}
      >
        {/* Base map using OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Add issue markers */}
        {issues.map((issue) => (
          <Marker
            key={issue.id}
            position={[issue.coordinates.lat, issue.coordinates.lng]}
            icon={createCustomIcon(issue.status)}
            eventHandlers={{
              click: () => onIssueClick(issue),
            }}
          >
            <Popup maxWidth={250}>
              <div className="p-2">
                <h4 className="font-semibold text-sm mb-1">{issue.title}</h4>
                <p className="text-xs text-gray-600 mb-1">{issue.location}</p>
                {issue.trackingNumber && (
                  <p className="text-xs text-gray-500 mb-1">
                    <strong>Tracking:</strong> {issue.trackingNumber}
                  </p>
                )}
                <p className="text-xs text-gray-500 mb-1">
                  <strong>Status:</strong>
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                      issue.status === "resolved"
                        ? "bg-green-100 text-green-800"
                        : issue.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : issue.status === "acknowledged"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                    }`}
                  >
                    {issue.status}
                  </span>
                </p>
                <p className="text-xs text-gray-500 mb-1">
                  <strong>Priority:</strong>
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                      issue.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : issue.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {issue.priority}
                  </span>
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  <strong>Category:</strong> {issue.category}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  <strong>Reported:</strong> {formatDate(issue.reportedAt)}
                </p>
                {issue.description && (
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {issue.description}
                  </p>
                )}
                <button
                  onClick={() => {
                    window.open(
                      `/dashboard/issues/details/${issue.id}`,
                      "_blank",
                    );
                  }}
                  className="w-full bg-accent2 hover:bg-accent text-white text-xs font-medium py-1.5 px-3 rounded transition-colors duration-200"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
