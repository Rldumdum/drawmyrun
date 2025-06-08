// Base types for the download data structure
type DownloadData = {
  fileName: string;
  distance: number;
  estimatedTime: string;
  markers: number;
  fileUrl: string;
  publicId: string;
  fileSize: number;
  userId: string;
};

// Optional version for when creating download data (handles undefined values)
type CreateDownloadData = {
  fileName?: string;
  distance: number;
  estimatedTime: string;
  markers: number;
  fileUrl?: string;
  publicId?: string;
  fileSize: number;
  userId?: string;
};

// Complete download record (what comes back from API)
type Download = DownloadData & {
  id: string;
  downloadedAt: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

// Upload result structure (from Cloudinary or similar service)
type UploadData = {
  public_id: string;
  secure_url: string;
  // Add other properties you might use from upload result
  resource_type?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  created_at?: string;
  etag?: string;
  placeholder?: boolean;
  url?: string;
  version?: number;
  version_id?: string;
};

// Union type for upload result that can be success or error
export type UploadResult =
  | {
      success: true;
      data: UploadData;
      distanceKm: number;
      error?: undefined;
    }
  | {
      success: false;
      error: string;
      data?: undefined;
      distanceKm?: undefined;
    };

// Session user structure (adjust based on your auth system)
type SessionUser = {
  id: string;
  email?: string;
  name?: string;
  // Add other user properties as needed
};

type Session = {
  user: SessionUser;
  // Add other session properties as needed
  expires?: string;
  accessToken?: string;
};

// Marker structure (if you have marker data)
type Marker = {
  id?: string;
  lat: number;
  lng: number;
  title?: string;
  description?: string;
  // Add other marker properties as needed
};

// API Response structures
type DownloadsApiResponse = {
  success: boolean;
  data: {
    downloads: Download[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    stats: {
      totalRuns: number;
      totalDistance: number;
      averageDistance: number;
      totalMarkers: number;
    };
    filters: {
      sortBy: string;
      sortOrder: "asc" | "desc";
    };
  };
  error?: string;
};

type CreateDownloadApiResponse = {
  success: boolean;
  data?: Download;
  error?: string;
};

// Usage with your downloadData object (with proper error handling):
const createDownloadData = (
  uploadResult: UploadResult,
  routeDistance: number,
  estimatedTime: string,
  markers: Marker[],
  blob: Blob,
  session: Session | null
): DownloadData | null => {
  // Type guard to check if upload was successful
  if (!uploadResult.success) {
    console.error("Upload failed:", uploadResult.error);
    return null;
  }

  if (!session?.user?.id) {
    console.error("No user session");
    return null;
  }

  return {
    fileName: uploadResult.data.public_id + ".gpx",
    distance: routeDistance,
    estimatedTime: estimatedTime,
    markers: markers.length,
    fileUrl: uploadResult.data.secure_url,
    publicId: uploadResult.data.public_id,
    fileSize: blob.size,
    userId: session.user.id,
  };
};

// Alternative: Direct object creation with type assertion and validation
const downloadData: CreateDownloadData = {
  fileName: uploadResult?.success
    ? uploadResult.data.public_id + ".gpx"
    : undefined,
  distance: routeDistance,
  estimatedTime: estimatedTime,
  markers: markers.length,
  fileUrl: uploadResult?.success ? uploadResult.data.secure_url : undefined,
  publicId: uploadResult?.success ? uploadResult.data.public_id : undefined,
  fileSize: blob.size,
  userId: session?.user?.id,
};

// Function parameter types for your existing functions
type FetchDownloadsFunction = () => Promise<void>;
type HandleDeleteFunction = (id: string) => Promise<void>;
type FormatDateFunction = (dateString: string) => string;

// Props for components that use downloads
type DownloadItemProps = {
  download: Download;
  onDelete: HandleDeleteFunction;
};

type DownloadsListProps = {
  downloads: Download[];
  onDelete: HandleDeleteFunction;
  isLoading?: boolean;
};
