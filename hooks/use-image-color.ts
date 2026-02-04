"use client";

import { useState, useEffect } from "react";

export function useImageColor(imageUrl: string | undefined, defaultColor = "#F5F5F5") {
  const [color, setColor] = useState(defaultColor);

  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 1;
      canvas.height = 1;

      // Draw only the TOP-LEFT pixel (0,0) to catch the background color
      // Logic: drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
      ctx.drawImage(img, 0, 0, 1, 1, 0, 0, 1, 1);
      
      try {
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        setColor(`rgb(${r},${g},${b})`);
      } catch (e) {
        // Fallback if CORS prevents reading data
        // console.warn("Could not extract image color due to CORS", e);
      }
    };
  }, [imageUrl]);

  return color;
}
