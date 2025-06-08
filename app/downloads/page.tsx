"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Calendar, MapPin, Clock } from "lucide-react";

interface DownloadRecord {
  id: string;
  fileName: string;
  distance: number;
  estimatedTime: string;
  createdAt: Date | string;
  markers: number;
}

const Downloads = () => {
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const fetchData = async () => {
    try {
      const dbResult = await fetch("/api/user/downloads", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!dbResult.ok) {
        throw new Error(`HTTP error! status: ${dbResult.status}`);
      }

      const data = await dbResult.json();

      if (data.success) {
        // Fix: Access the correct nested data structure
        setDownloads(data.data.downloads);
      } else {
        console.error("Failed to fetch downloads:", data.error);
        // Optionally set an error state here
      }
    } catch (error) {
      console.error("Network error fetching downloads:", error);
      // Handle network errors appropriately
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  // const handleDelete = (id: string) => {
  //   setDownloads(downloads.filter((download) => download.id !== id));
  // };

  const handleRedownload = (fileName: string) => {
    // Create a mock GPX content for re-download
    const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Draw My Run">
  <metadata>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>My Run Route</name>
    <type>running</type>
    <trkseg>
      <trkpt lat="37.7749" lon="-122.4194">
        <ele>10.0</ele>
        <time>${new Date().toISOString()}</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`;

    const blob = new Blob([gpxContent], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto p-6">
        {/* Header Section */}
        <div className="relative mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-lg blur opacity-20" />
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-cyan-400/30 rounded-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full blur-md opacity-70" />
                <div className="relative bg-slate-900 rounded-full p-3 border border-cyan-400/50">
                  <Download className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-wide font-mono">
                  MISSION ARCHIVES
                </h1>
                <p className="text-gray-400 font-mono text-sm">
                  Downloaded route data files
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
              <div className="bg-slate-800/50 rounded-lg p-3 border border-cyan-400/20">
                <div className="text-2xl font-bold text-cyan-400 font-mono">
                  {downloads.length}
                </div>
                <div className="text-xs text-gray-400 font-mono uppercase">
                  Total Downloads
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 border border-purple-400/20">
                <div className="text-2xl font-bold text-purple-400 font-mono">
                  {downloads.reduce((sum, d) => sum + d.distance, 0).toFixed(1)}
                  km
                </div>
                <div className="text-xs text-gray-400 font-mono uppercase">
                  Total Distance
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Downloads Table */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-lg blur opacity-20" />
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-cyan-400/30 rounded-lg overflow-hidden">
            {downloads.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 border-2 border-gray-600 border-dashed rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Download className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-gray-400 font-mono">
                  No mission data files found
                </p>
                <p className="text-sm text-gray-500 font-mono mt-2">
                  Export routes from the Create page to see them here
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-cyan-400/30 hover:bg-slate-800/50">
                    <TableHead className="text-cyan-400 font-mono uppercase tracking-wider">
                      File Name
                    </TableHead>
                    <TableHead className="text-cyan-400 font-mono uppercase tracking-wider">
                      Distance
                    </TableHead>
                    <TableHead className="text-cyan-400 font-mono uppercase tracking-wider">
                      Duration
                    </TableHead>
                    <TableHead className="text-cyan-400 font-mono uppercase tracking-wider">
                      Waypoints
                    </TableHead>
                    <TableHead className="text-cyan-400 font-mono uppercase tracking-wider">
                      Downloaded
                    </TableHead>
                    <TableHead className="text-cyan-400 font-mono uppercase tracking-wider">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {downloads.map((download) => (
                    <TableRow
                      key={download.id}
                      className="border-cyan-400/20 hover:bg-slate-800/30 transition-colors"
                    >
                      <TableCell className="font-mono text-gray-300">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-cyan-400" />
                          {download.fileName}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-purple-400">
                        {download.distance}km
                      </TableCell>
                      <TableCell className="font-mono text-green-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {download.estimatedTime}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-pink-400">
                        {download.markers}
                      </TableCell>
                      <TableCell className="font-mono text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(download.createdAt).toLocaleString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleRedownload(download.fileName)}
                            className="bg-gradient-to-r from-green-600 to-green-700 border border-green-400/50 text-green-100 hover:border-green-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all duration-300 font-mono"
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Re-download
                          </Button>
                          {/* <Button
                            size="sm"
                            onClick={() => handleDelete(download.id)}
                            className="bg-gradient-to-r from-red-600 to-red-700 border border-red-400/50 text-red-100 hover:border-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all duration-300 font-mono"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button> */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Downloads;
