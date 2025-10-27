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
}

interface LeafletMapProps {
    issues: Issue[];
    statusColors: { [key: string]: string };
    statusIcons: { [key: string]: IconType };
    onIssueClick: (issue: Issue) => void;
    center?: [number, number];
    zoom?: number;
}

export default function LeafletMap({ issues, statusColors, statusIcons, onIssueClick, center = [-1.94995, 30.05885], zoom = 13 }: LeafletMapProps) {
    // Fix Leaflet icon path issue on some builds
    useEffect(() => {
        // Remove default icon override to use custom icons
        delete (L.Icon.Default.prototype as any)._getIconUrl;
    }, []);

    // Create custom icon for each status
    const createCustomIcon = (status: string) => {
        const StatusIcon = statusIcons[status] || statusIcons.reported;
        const color = statusColors[status] || statusColors.reported;

        return L.divIcon({
            className: "custom-icon",
            html: renderToString(
                <div
                    style={{
                        backgroundColor: color,width: "32px", height: "32px", borderRadius: "50%", border: "2px solid white", 
                        display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                >
                    <StatusIcon style={{ color: "white", fontSize: "14px" }} />
                </div>
            ),
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            popupAnchor: [0, -16],
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
                maxBounds={[[-1.033023, 28.352711], [-3.008813, 31.305375]]}
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
                        <Popup>
                            <div>
                                <h4 className="font-semibold">{issue.title}</h4>
                                <p className="text-sm text-gray-600">{issue.location}</p>
                                <p className="text-xs mt-1 text-gray-500">Status: {issue.status}</p>
                                <button
                                    onClick={() => {
                                        const statusRoute = issue.status === 'reported' ? 'reported' :
                                                            issue.status === 'acknowledged' ? 'acknowledged' :
                                                            issue.status === 'pending' ? 'pending' : 'resolved';
                                        window.open(`/dashboard/issues/${statusRoute}`, '_blank');
                                    }}
                                    className="text-accent2 hover:text-accent text-xs font-medium mt-2"
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