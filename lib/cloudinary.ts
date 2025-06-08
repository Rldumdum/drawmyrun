export function buildCloudinaryGpxUrl(publicId: string, username?: string) {
  if (!publicId) return "";

  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    console.error("Cloudinary cloud name is not defined");
    return "";
  }

  // For GPX files, we use the raw resource type and include the username folder if provided
  const folderPath = username ? `run-file-uploads/${username}/` : "";

  return `https://res.cloudinary.com/${cloudName}/raw/upload/${folderPath}${publicId}.gpx`;
}
