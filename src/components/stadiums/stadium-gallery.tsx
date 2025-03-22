"use client";

import { useState } from "react";
import Image from "next/image";

interface StadiumImage {
  id: string;
  url: string;
  stadiumId: string;
}

interface StadiumGalleryProps {
  images: StadiumImage[];
  name: string;
}

export default function StadiumGallery({ images, name }: StadiumGalleryProps) {
  const [currentImage, setCurrentImage] = useState(0);

  // If there are no images, show a placeholder
  if (images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500 text-lg">No images available</span>
      </div>
    );
  }

  return (
    <div>
      <div className="relative h-96 w-full">
        <Image
          src={images[currentImage].url}
          alt={`${name} - Image ${currentImage + 1}`}
          fill
          className="object-cover"
          priority
        />
      </div>
      
      {images.length > 1 && (
        <div className="p-2 overflow-x-auto">
          <div className="flex space-x-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setCurrentImage(index)}
                className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 ${
                  index === currentImage
                    ? "border-blue-500"
                    : "border-transparent"
                }`}
              >
                <Image
                  src={image.url}
                  alt={`${name} - Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 