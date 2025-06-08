"use server"

import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Helper function to parse GPX and calculate distance
function parseGpxDistance(gpxContent: string): number {
  try {
    // Simple regex to extract lat/lon coordinates from GPX
    const trackPointRegex = /<trkpt[^>]*lat="([^"]*)"[^>]*lon="([^"]*)"/g
    const points: { lat: number; lon: number }[] = []
    let match

    while ((match = trackPointRegex.exec(gpxContent)) !== null) {
      points.push({
        lat: parseFloat(match[1]),
        lon: parseFloat(match[2])
      })
    }

    if (points.length < 2) return 0

    // Calculate total distance using Haversine formula
    let totalDistance = 0
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      
      const R = 6371 // Earth's radius in km
      const dLat = (curr.lat - prev.lat) * Math.PI / 180
      const dLon = (curr.lon - prev.lon) * Math.PI / 180
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(prev.lat * Math.PI / 180) * Math.cos(curr.lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      totalDistance += R * c
    }

    return Math.round(totalDistance * 100) / 100 // Round to 2 decimal places
  } catch (error) {
    console.error("Error parsing GPX distance:", error)
    return 0
  }
}

export async function uploadGpxFile(formData: FormData) {
  try {
    const file = formData.get("file") as File
    const username = formData.get("username") as string

    if (!file) {
      return { success: false, error: "No file provided" }
    }

    if (!username) {
      return { success: false, error: "Username is required" }
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.gpx') && file.type !== 'application/gpx+xml') {
      return { success: false, error: "Only GPX files are allowed" }
    }

    // Convert file to buffer and get content
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const gpxContent = buffer.toString('utf-8')

    // Calculate distance from GPX content
    const distanceKm = parseGpxDistance(gpxContent)

    // Create filename: username_distanceKm
    const filename = `${username}_${distanceKm}km`

    // Convert buffer to base64
    const fileStr = buffer.toString("base64")
    const fileUri = `data:${file.type || 'application/gpx+xml'};base64,${fileStr}`

    // Upload to Cloudinary with user-specific folder
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        fileUri,
        {
          folder: `run-file-uploads/${username}`, // User-specific folder
          resource_type: "raw", // Use 'raw' for non-image files
          public_id: filename, // Custom filename with distance
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        },
      )
    })

    return {
      success: true,
      data: uploadResult,
      distanceKm,
    }
  } catch (error) {
    console.error("Error uploading GPX file to Cloudinary:", error)
    return {
      success: false,
      error: "Failed to upload GPX file",
    }
  }
}