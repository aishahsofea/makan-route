import { ImageAttachment } from "@/types/message";
import { useState } from "react";

type ImageDisplayProps = {
  images?: ImageAttachment[];
  className?: string;
};

export const ImageDisplay = ({ images, className = "" }: ImageDisplayProps) => {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  const getImageGridClasses = (imageCount: number) => {
    if (imageCount === 1) return "grid-cols-1 max-w-md";
    if (imageCount === 2) return "grid-cols-2 max-w-2xl";
    return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 max-w-4xl";
  };

  return (
    <>
      <div className={`grid gap-2 mt-2 ${getImageGridClasses(images.length)} ${className}`}>
        {images.map((image) => (
          <div key={image.id} className="relative">
            <img
              src={image.url}
              alt={image.originalName}
              className="w-full h-32 sm:h-40 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
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
          <div className="relative">
            <img
              src={expandedImage}
              alt="Expanded view"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-2 right-2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 rounded-full w-8 h-8 flex items-center justify-center transition-all"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};
