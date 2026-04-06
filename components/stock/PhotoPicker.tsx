"use client";

import { useRef } from "react";
import { Camera, Images, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { compressImage } from "@/lib/compress";

interface Props {
  photoUrl: string | null;
  uploading: boolean;
  uploadStatus: string;
  onPhotoChange: (url: string) => void;
  onClear: () => void;
  onUploadStart: (status: string) => void;
  onUploadEnd: () => void;
}

export function PhotoPicker({
  photoUrl,
  uploading,
  uploadStatus,
  onPhotoChange,
  onClear,
  onUploadStart,
  onUploadEnd,
}: Props) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onUploadStart("Compressing…");
    try {
      const compressed = await compressImage(file, 200);
      const sizeKB = Math.round(compressed.size / 1024);
      onUploadStart(`Uploading (${sizeKB} KB)…`);
      const fd = new FormData();
      fd.append("file", compressed);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) onPhotoChange(data.url);
    } catch {
      onUploadStart("Upload failed — try again");
    } finally {
      // reset input so same file can be picked again
      e.target.value = "";
      onUploadEnd();
    }
  }

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">Photo</p>

      {/* Preview area */}
      <div className="w-full h-36 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 relative overflow-hidden flex items-center justify-center mb-2">
        {uploading && (
          <div className="flex flex-col items-center gap-1">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            {uploadStatus && <p className="text-xs text-indigo-500">{uploadStatus}</p>}
          </div>
        )}
        {!uploading && photoUrl && (
          <>
            <Image src={photoUrl} alt="Product" fill className="object-cover" />
            <button
              type="button"
              onClick={onClear}
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </>
        )}
        {!uploading && !photoUrl && (
          <p className="text-xs text-gray-400">No photo yet</p>
        )}
      </div>

      {/* Camera / Gallery buttons */}
      {!photoUrl && !uploading && (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="flex items-center justify-center gap-2 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <Camera className="w-4 h-4" /> Camera
          </button>
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="flex items-center justify-center gap-2 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <Images className="w-4 h-4" /> Gallery
          </button>
        </div>
      )}

      {/* Hidden inputs — camera forces capture, gallery does not */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
