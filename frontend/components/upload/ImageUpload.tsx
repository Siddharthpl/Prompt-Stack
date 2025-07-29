"use client";

import React, { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
};

export default function ImageUpload({ value, onChange }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSelect = () => {
    inputRef.current?.click();
  };

  const handleRemove = () => {
    onChange(null);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast("File too large", {
        description: "Please select an image smaller than 10MB.",
      });
      return;
    }

    setIsUploading(true);

    try {
      // 🗜️ Compress the image
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });

      const formData = new FormData();
      formData.append("file", compressed);

      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.url) throw new Error("Upload failed");

      onChange(data.url);
      toast("Image uploaded!", { description: "Successfully attached image." });
    } catch (err: any) {
      console.error(err);
      toast("Upload failed", { description: err.message || "Unknown error." });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      {value ? (
        <div className="relative w-full h-48 border border-border rounded-lg overflow-hidden">
          <img src={value} alt="Uploaded preview" className="w-full h-full object-cover" />
          <Button
            variant="outline"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="w-full h-40 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
          <div className="text-center">
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <Button variant="outline" onClick={handleSelect} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload Image"}
            </Button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}