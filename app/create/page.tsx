"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import Map, { Marker, Source, Layer, MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { MapMouseEvent } from "react-map-gl/mapbox-legacy";
import {
  Search,
  Trash,
  Download,
  Zap,
  Activity,
  MapPin,
  Loader2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { uploadGpxFile } from "../actions/upload-gpx";
import { UploadResult } from "@/types/download-upload";

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1Ijoic2t5YnVybmluZzExIiwiYSI6ImNtYXh3c2ZvcjAycWYya3B0ajExZ2h5c2sifQ.yn0DchWH-H1JxiOoFbwVjA";

// Type definitions

const Create: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [markers, setMarkers] = useState<MarkerType[]>([]);
  const [showMarker, setShowMarker] = useState<boolean>(true);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [routeDistance, setRouteDistance] = useState<number>(0);
  const [isCreatingRoute, setIsCreatingRoute] = useState<boolean>(false);
  const [averagePace, setAveragePace] = useState<number>(5);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const mapRef = useRef<MapRef>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debouncer hook
  function useDebounce<T extends (...args: string[]) => void>(
    callback: T,
    delay: number
  ) {
    return useCallback(
      (...args: Parameters<T>) => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
          callback(...args);
        }, delay);
      },
      [callback, delay]
    );
  }

  // Search for locations using Mapbox Geocoding API
  const searchLocation = async (query: string): Promise<void> => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=5&types=place,locality,neighborhood,address,poi`
      );
      const data: GeocodeResponse = await response.json();

      if (data.features) {
        setSearchResults(data.features);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error("Error searching location:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useDebounce(searchLocation, 300);

  // Handle search input
  const handleSearchInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);

      if (!value.trim()) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }

      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  // Clear search timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Add marker from search result
  const addMarkerFromSearch = (feature: SearchResult): void => {
    const [lng, lat] = feature.center;
    const newMarker: MarkerType = {
      id: Date.now(),
      longitude: lng,
      latitude: lat,
      label: feature.place_name || feature.text,
    };
    const updatedMarkers = [...markers, newMarker];
    setMarkers(updatedMarkers);

    // Fly to the selected location
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 14,
        duration: 1000,
      });
    }

    // Clear search
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);

    // Automatically create route when we have 2+ markers
    if (updatedMarkers.length >= 2) {
      createRouteForAllMarkers(updatedMarkers);
    }
  };

  // Handle map click to add new markers
  const handleMapClick = useCallback(
    (e: MapMouseEvent) => {
      const { lng, lat } = e.lngLat;
      const newMarker: MarkerType = {
        id: Date.now(),
        longitude: lng,
        latitude: lat,
        label: `Point ${markers.length + 1}`,
      };
      const updatedMarkers = [...markers, newMarker];
      setMarkers(updatedMarkers);

      // Automatically create route when we have 2+ markers
      if (updatedMarkers.length >= 2) {
        createRouteForAllMarkers(updatedMarkers);
      }
    },
    [markers]
  );

  // Create route between all markers using Mapbox Directions API
  const createRouteForAllMarkers = async (
    allMarkers: MarkerType[]
  ): Promise<void> => {
    if (allMarkers.length < 2) {
      setRouteData(null);
      setRouteDistance(0);
      return;
    }

    setIsCreatingRoute(true);

    // Create waypoints string for Mapbox API (supports up to 25 waypoints)
    const coordinates = allMarkers
      .slice(0, 25)
      .map((marker) => `${marker.longitude},${marker.latitude}`)
      .join(";");

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`
      );
      const data: DirectionsResponse = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setRouteData({
          type: "Feature",
          properties: {},
          geometry: route.geometry,
        });
        // Convert meters to kilometers
        setRouteDistance(Math.round((route.distance / 1000) * 100) / 100);
      }
    } catch (error) {
      console.error("Error creating route:", error);
    } finally {
      setIsCreatingRoute(false);
    }
  };

  // Clear all markers and route
  const clearAll = (): void => {
    setMarkers([]);
    setRouteData(null);
    setRouteDistance(0);
  };

  // Linear interpolation between coordinates
  const interpolateCoordinates = (
    coordinates: [number, number][],
    totalPoints: number
  ): [number, number][] => {
    const result: [number, number][] = [];
    for (let i = 0; i < coordinates.length - 1; i++) {
      const [startLng, startLat] = coordinates[i];
      const [endLng, endLat] = coordinates[i + 1];

      const segmentPoints = Math.floor(totalPoints / (coordinates.length - 1));
      for (let j = 0; j < segmentPoints; j++) {
        const ratio = j / segmentPoints;
        const lat = startLat + (endLat - startLat) * ratio;
        const lng = startLng + (endLng - startLng) * ratio;
        result.push([lng, lat]);
      }
    }
    result.push(coordinates[coordinates.length - 1]); // add last point
    return result;
  };

  const calculateEstimatedTime = (): string => {
    if (!routeDistance) return "0:00";
    const totalMinutes = routeDistance * averagePace;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, "0")}h`
      : `${minutes}m`;
  };
  const handleClick = () => {
    if (!session?.user) {
      router.push("/sign-in");
    } else {
      exportGPX();
    }
  };
  const exportGPX = async (): Promise<void> => {
    setLoading(true);
    if (!routeData || !routeData.geometry || !routeData.geometry.coordinates) {
      alert("No route available to export!");
      return;
    }

    try {
      const baseCoordinates = routeData.geometry.coordinates;
      const totalSeconds = Math.round(routeDistance * averagePace * 60);
      const now = new Date();

      // Interpolate coordinates to match 1 coordinate per second
      const interpolatedCoords = interpolateCoordinates(
        baseCoordinates,
        totalSeconds
      );

      let gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Your App Name"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 
    http://www.topografix.com/GPX/1/1/gpx.xsd 
    http://www.garmin.com/xmlschemas/GpxExtensions/v3 
    http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd 
    http://www.garmin.com/xmlschemas/TrackPointExtension/v1 
    http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd">
  <metadata>
    <time>${now.toISOString()}</time>
  </metadata>
  <trk>
    <name>Afternoon Run</name>
    <type>running</type>
    <trkseg>`;

      interpolatedCoords.forEach((coord, index) => {
        const [lng, lat] = coord;
        const elevation = 10.0; // Or interpolate elevation too
        const timestamp = new Date(now.getTime() + index * 1000);
        timestamp.setMilliseconds(0);

        gpxContent += `
      <trkpt lat="${lat.toFixed(7)}" lon="${lng.toFixed(7)}">
        <ele>${elevation.toFixed(1)}</ele>
        <time>${timestamp.toISOString()}</time>
        <extensions>
          <gpxtpx:TrackPointExtension>
          </gpxtpx:TrackPointExtension>
        </extensions>
      </trkpt>`;
      });

      gpxContent += `
    </trkseg>
  </trk>
</gpx>`;

      // Create blob and file for upload
      const blob = new Blob([gpxContent], { type: "application/gpx+xml" });
      const file = new File([blob], `${now.toISOString()}.gpx`, {
        type: "application/gpx+xml",
      });

      // Prepare FormData for upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "username",
        session?.user?.name || session?.user?.email || "anonymous"
      );

      // Upload to Cloudinary
      const uploadResult: UploadResult = await uploadGpxFile(formData) as UploadResult;

      if (uploadResult.success) {
        // Calculate estimated time in readable format
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const estimatedTime =
          hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;

        // Prepare data for database storage
        const downloadData = {
          fileName: uploadResult?.data.public_id + ".gpx",
          distance: routeDistance,
          estimatedTime: estimatedTime,
          markers: markers.length, // Assuming markers is available in scope
          fileUrl: uploadResult?.data.secure_url,
          publicId: uploadResult?.data.public_id,
          fileSize: blob.size,
          userId: session?.user?.id,
        };

        // Store in database (you'll need to create this server action)
        const dbResult = await fetch("/api/downloads", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(downloadData),
        });

        if (dbResult.ok) {

          // Optional: Show success message
          // toast.success(`Run uploaded! Distance: ${uploadResult.distanceKm}km`);
        } else {
        }

        // Still trigger local download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${session?.user?.name || "user"}_${
          uploadResult.distanceKm
        }km.gpx`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        console.error("Upload failed:", uploadResult.error);

        // Fallback to original download behavior
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${now.toISOString()}.gpx`;
        a.click();
        URL.revokeObjectURL(url);

        // Optional: Show error message
        // toast.error('Upload failed, but file downloaded locally');
      }
    } catch (error) {
      console.error("Error in exportGPX:", error);

      // Fallback to original behavior on any error
      const baseCoordinates = routeData.geometry.coordinates;
      const totalSeconds = Math.round(routeDistance * averagePace * 60);
      const now = new Date();
      const interpolatedCoords = interpolateCoordinates(
        baseCoordinates,
        totalSeconds
      );

      let gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Your App Name"
  xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>Afternoon Run</name>
    <type>running</type>
    <trkseg>`;

      interpolatedCoords.forEach((coord, index) => {
        const [lng, lat] = coord;
        const elevation = 10.0;
        const timestamp = new Date(now.getTime() + index * 1000);
        timestamp.setMilliseconds(0);

        gpxContent += `
      <trkpt lat="${lat.toFixed(7)}" lon="${lng.toFixed(7)}">
        <ele>${elevation.toFixed(1)}</ele>
        <time>${timestamp.toISOString()}</time>
      </trkpt>`;
      });

      gpxContent += `
    </trkseg>
  </trk>
</gpx>`;

      const blob = new Blob([gpxContent], { type: "application/gpx+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${now.toISOString()}.gpx`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setLoading(false);
  };

  const routeLayerStyle = {
    id: "route",
    type: "line" as const,
    paint: {
      "line-color": "#00FFFF",
      "line-width": 4,
      "line-opacity": 0.8,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex flex-col min-h-screen pt-20">
        {/* Animated background grid */}
        <div className="fixed inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

        <div className="flex flex-1 relative z-10">
          {/* Futuristic Sidebar */}
          <div className="w-80 backdrop-blur-xl bg-gradient-to-b from-slate-900/90 via-purple-900/90 to-slate-900/90 border-r border-cyan-400/30 overflow-y-auto">
            {/* Glowing border effect */}
            <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent" />

            <div className="p-6 space-y-6">
              {/* Instructions Section */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 rounded-lg blur opacity-50" />
                <div className="relative bg-slate-800/50 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-mono">
                      NEURAL INTERFACE
                    </h3>
                  </div>
                  <ul className="text-sm text-gray-300 space-y-2 font-mono">
                    {[
                      "• Quantum search on neural map grid",
                      "• Bio-click to deploy location markers",
                      "• Auto-route with 2+ coordinate locks",
                      "• Pace calibration for time synthesis",
                      "• Export bio-data with elevation scan",
                    ].map((instruction, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 hover:text-cyan-400 transition-colors duration-300"
                      >
                        <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
                        {instruction}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Pace Control */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg blur opacity-50" />
                <div className="relative bg-slate-800/50 backdrop-blur-sm border border-purple-400/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-purple-400 animate-pulse" />
                    <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-mono">
                      PACE MATRIX
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-cyan-400 mb-3 font-mono tracking-wider">
                        RUN PACE: {averagePace} min/km
                      </label>
                      <div className="relative">
                        <Slider
                          value={[averagePace]}
                          onValueChange={(value) => setAveragePace(value[0])}
                          max={12}
                          min={3}
                          step={0.5}
                          className="w-full"
                        />
                        <div className="absolute -top-1 left-0 w-full h-4 bg-gradient-to-r from-cyan-400/20 via-purple-500/20 to-pink-500/20 rounded blur-sm pointer-events-none" />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 mt-2 font-mono">
                        <span className="text-cyan-400">3:00/km</span>
                        <span className="text-pink-400">12:00/km</span>
                      </div>
                    </div>
                    {routeDistance > 0 && (
                      <div className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 border border-cyan-400/20 rounded-lg p-3">
                        <div className="space-y-1 text-sm font-mono">
                          <div className="flex justify-between">
                            <span className="text-gray-300">DISTANCE:</span>
                            <span className="text-cyan-400">
                              {routeDistance}km
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">ETA:</span>
                            <span className="text-purple-400">
                              {calculateEstimatedTime()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Marker Settings */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-lg blur opacity-50" />
                <div className="relative bg-slate-800/50 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-mono">
                      MARKER NODES
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300 font-mono tracking-wider">
                      VISIBILITY TOGGLE
                    </label>
                    <div className="relative">
                      <Switch
                        checked={showMarker}
                        onCheckedChange={(checked) => setShowMarker(checked)}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-cyan-400 data-[state=checked]:to-blue-500"
                      />
                      {showMarker && (
                        <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-pulse pointer-events-none" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Route Status */}
              {/* {routeData && markers.length >= 2 && (
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-400/30 to-emerald-500/30 rounded-lg blur animate-pulse" />
                  <div className="relative bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-sm border border-green-400/40 rounded-lg p-4">
                    <h4 className="font-bold text-green-400 mb-3 font-mono tracking-wider flex items-center gap-2">
                      <Target className="w-4 h-4 animate-pulse" />
                      ROUTE ACTIVE ({markers.length} NODES)
                    </h4>
                    <div className="space-y-2 text-sm font-mono">
                      <div className="flex justify-between">
                        <span className="text-gray-300">DISTANCE:</span>
                        <span className="text-green-400">
                          {routeDistance}km
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">ETA:</span>
                        <span className="text-green-400">
                          {calculateEstimatedTime()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">PACE:</span>
                        <span className="text-green-400">
                          {averagePace}min/km
                        </span>
                      </div>
                      <div className="text-xs mt-3 text-green-300/70 border-t border-green-400/20 pt-2">
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
                          GPX export includes synthetic elevation data (100-150m
                          range)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )} */}

              {/* Control Panel */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-slate-700/30 to-slate-600/30 rounded-lg blur opacity-50" />
                <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-lg p-4">
                  <div className="text-center mb-4">
                    <div className="text-sm text-gray-400 font-mono tracking-wider">
                      {routeDistance > 0 && `${routeDistance}km • `}
                      {markers.length} MARKERS
                      {markers.length >= 2 &&
                        ` • ${
                          isCreatingRoute
                            ? "SYNCING..."
                            : calculateEstimatedTime()
                        }`}
                    </div>
                  </div>
                  <div className="flex gap-3 flex-col">
                    {session?.user ? (
                      <div className="relative flex-1">
                        <div className="absolute -inset-1 bg-gradient-to-r from-green-400/30 to-emerald-500/30 rounded blur opacity-50" />
                        <Button
                          onClick={handleClick}
                          disabled={!routeData || markers.length < 2 || loading}
                          className="relative w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white border border-green-400/50 hover:border-green-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all duration-300 font-mono uppercase tracking-wider disabled:from-gray-600 disabled:to-gray-700 disabled:border-gray-500"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Download Run File
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="relative flex-1">
                        <div className="absolute -inset-1 bg-gradient-to-r from-green-400/30 to-emerald-500/30 rounded blur opacity-50" />
                        <Button
                          onClick={handleClick}
                          disabled={!routeData || markers.length < 2}
                          className="relative w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white border border-green-400/50 hover:border-green-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all duration-300 font-mono uppercase tracking-wider disabled:from-gray-600 disabled:to-gray-700 disabled:border-gray-500"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Sign In to Download
                        </Button>
                      </div>
                    )}
                    <div className="relative flex-1">
                      <div className="absolute -inset-1 bg-gradient-to-r from-red-400/30 to-pink-500/30 rounded blur opacity-50" />
                      <Button
                        onClick={clearAll}
                        className="relative w-full bg-gradient-to-r from-red-600 to-pink-600 text-white border border-red-400/50 hover:border-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all duration-300 font-mono uppercase tracking-wider"
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Futuristic Map Container */}
          <div className="flex-1 relative">
            {/* Holographic Search Interface */}
            <div className="absolute top-6 left-6 right-6 z-20">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/30 via-purple-500/30 to-pink-500/30 rounded-lg blur animate-pulse" />
                <div className="relative backdrop-blur-xl bg-slate-900/80 border border-cyan-400/50 rounded-lg shadow-2xl">
                  <div className="flex items-center p-3 gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="LOCATION SEARCH INTERFACE..."
                        value={searchQuery}
                        onChange={handleSearchInput}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && searchResults.length > 0) {
                            addMarkerFromSearch(searchResults[0]);
                          }
                        }}
                        className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-400/30 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-cyan-400 placeholder:text-gray-500 font-mono backdrop-blur-sm"
                      />
                      {isSearching && (
                        <div className="absolute right-3 top-3.5">
                          <div className="animate-spin h-5 w-5 border-2 border-cyan-400 border-t-transparent rounded-full"></div>
                        </div>
                      )}
                    </div>

                    {/* Search Button */}
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded blur opacity-50" />
                      <Button
                        onClick={() => {
                          if (searchQuery.trim() && searchResults.length > 0) {
                            addMarkerFromSearch(searchResults[0]);
                          } else if (searchQuery.trim()) {
                            searchLocation(searchQuery);
                          }
                        }}
                        disabled={!searchQuery.trim() || isSearching}
                        className="relative bg-gradient-to-r from-cyan-600 to-blue-600 text-white border border-cyan-400/50 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all duration-300 font-mono p-3"
                      >
                        <Search className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Clear Button */}
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-red-400/30 to-pink-500/30 rounded blur opacity-50" />
                      <Button
                        onClick={() => {
                          setSearchQuery("");
                          setSearchResults([]);
                          setShowSearchResults(false);
                        }}
                        disabled={!searchQuery && searchResults.length === 0}
                        className="relative bg-gradient-to-r from-red-600 to-pink-600 text-white border border-red-400/50 hover:border-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all duration-300 font-mono p-3"
                      >
                        <Trash className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Holographic Search Results */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="border-t border-cyan-400/30 max-h-60 overflow-y-auto">
                      {searchResults.map((result, index) => (
                        <button
                          key={index}
                          onClick={() => addMarkerFromSearch(result)}
                          className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-cyan-400/10 hover:to-purple-500/10 border-b border-cyan-400/20 last:border-b-0 focus:outline-none focus:bg-gradient-to-r focus:from-cyan-400/10 focus:to-purple-500/10 transition-all duration-300"
                        >
                          <div className="font-medium text-sm text-cyan-400 font-mono">
                            {result.text}
                          </div>
                          <div className="text-xs text-gray-400 truncate font-mono">
                            {result.place_name}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Map Container */}
            <div className="w-full h-full relative overflow-hidden rounded-lg">
              <Map
                ref={mapRef}
                mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
                initialViewState={{
                  longitude: -122.4,
                  latitude: 37.8,
                  zoom: 12,
                }}
                style={{ width: "100%", height: "100%" }}
                // mapStyle="mapbox://styles/mapbox/dark-v11"
                mapStyle="mapbox://styles/mapbox/streets-v12"
                onClick={handleMapClick}
                cursor="crosshair"
              >
                {/* Render markers */}
                {showMarker && (
                  <>
                    {markers.map((marker) => (
                      <Marker
                        key={marker.id}
                        longitude={marker.longitude}
                        latitude={marker.latitude}
                        anchor="bottom"
                      >
                        <div className="cursor-pointer transform hover:scale-110 transition-transform">
                          <div className="w-8 h-8 rounded-full border-2 bg-cyan-400 border-cyan-600 flex items-center justify-center relative shadow-[0_0_15px_rgba(34,211,238,0.6)]">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            {/* Pulsing ring effect */}
                            <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-30" />
                          </div>
                        </div>
                      </Marker>
                    ))}
                  </>
                )}
                {/* Render route */}
                {routeData && (
                  <Source id="route" type="geojson" data={routeData}>
                    <Layer {...routeLayerStyle} />
                  </Source>
                )}
              </Map>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;
