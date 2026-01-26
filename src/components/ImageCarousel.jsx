import React, { useState } from "react";

export default function ImageCarousel({ images, title }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Handle empty or invalid images
  const imageArray = Array.isArray(images) && images.length > 0 ? images : [];
  const hasImages = imageArray.length > 0;

  const nextImage = () => {
    if (hasImages) {
      setCurrentIndex((prev) => (prev + 1) % imageArray.length);
    }
  };

  const prevImage = () => {
    if (hasImages) {
      setCurrentIndex((prev) => (prev - 1 + imageArray.length) % imageArray.length);
    }
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div
      className="relative w-full aspect-square bg-gray-100 flex items-center justify-center group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Image */}
      {hasImages ? (
        <img
          src={imageArray[currentIndex].image}
          alt={`${title} - Image ${currentIndex + 1}`}
          className="w-full h-full object-contain p-4"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm">No image available</p>
        </div>
      )}

      {/* Left Arrow - Visible on Hover */}
      {hasImages && imageArray.length > 1 && (
        <button
          onClick={prevImage}
          className={`absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 shadow-lg transition-all duration-200 backdrop-blur-sm ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Previous image"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Right Arrow - Visible on Hover */}
      {hasImages && imageArray.length > 1 && (
        <button
          onClick={nextImage}
          className={`absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 shadow-lg transition-all duration-200 backdrop-blur-sm ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Next image"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Dots - Always Visible */}
      {hasImages && imageArray.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/20 px-3 py-2 rounded-full backdrop-blur-sm">
          {imageArray.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? "bg-green-600 w-6"
                  : "bg-white/80 hover:bg-white"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
