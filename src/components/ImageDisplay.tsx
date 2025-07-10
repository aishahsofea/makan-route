import { ImageAttachment } from "@/types/message";
import { useState } from "react";

type ImageDisplayProps = {
  images?: ImageAttachment[];
  className?: string;
};

export const ImageDisplay = ({ images, className = "" }: ImageDisplayProps) => {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className={`flex flex-wrap gap-2 mt-2 ${className}`}>
        {images.map((image) => (
          <div key={image.id} className="relative">
            <img
              src={image.url}
              alt={image.originalName}
              className="max-w-xs max-h-48 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setExpandedImage(image.url)}
            />
          </div>
        ))}
      </div>

      {expandedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setExpandedImage(null)}
        >
          <img
            src={expandedImage}
            alt="Expanded view"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </>
  );
};
