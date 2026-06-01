import * as ImagePicker from "expo-image-picker";
import { createUUID } from "./farmUtils";

const CLOUDINARY_CLOUD_NAME = "dsmpclqqa";
const CLOUDINARY_UPLOAD_PRESET = "m6pymz4w";

export async function requestMediaPermissions() {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Permissão de fotos e vídeos negada.");
  }
}

export async function pickMediaAsset({ allowsMultipleSelection = false } = {}) {
  await requestMediaPermissions();
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images", "videos"],
    allowsEditing: false,
    quality: 0.85,
    videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
    allowsMultipleSelection,
    selectionLimit: allowsMultipleSelection ? 4 : 1,
  });

  if (result.canceled) return [];
  return result.assets || [];
}

export async function uploadAssetToCloudinary(asset) {
  const isVideo = String(asset?.type || "").toLowerCase() === "video" || String(asset?.mimeType || "").startsWith("video/");
  const formData = new FormData();
  formData.append("file", {
    uri: asset.uri,
    name: asset.fileName || `${createUUID()}.${isVideo ? "mp4" : "jpg"}`,
    type: asset.mimeType || (isVideo ? "video/mp4" : "image/jpeg"),
  });
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${isVideo ? "video" : "image"}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Falha ao enviar mídia.");
  }

  const payload = await response.json();
  return {
    id: createUUID(),
    type: isVideo ? "video" : "image",
    name: asset.fileName || payload.original_filename || `anexo-${Date.now()}`,
    mimeType: asset.mimeType || payload.resource_type,
    width: asset.width || null,
    height: asset.height || null,
    duration: asset.duration || null,
    url: payload.secure_url,
    thumbnailUrl: isVideo ? payload.secure_url : payload.secure_url,
    uploadedAt: new Date().toISOString(),
  };
}

export function getAttachmentLabelCount(items) {
  const total = Array.isArray(items) ? items.length : 0;
  if (!total) return "Sem anexos";
  return `${total} ${total === 1 ? "anexo" : "anexos"}`;
}
