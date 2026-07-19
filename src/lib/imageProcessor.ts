/**
 * Image preprocessing utilities for optimizing handwritten & printed notes before OCR.
 * Implements client-side Grayscale, Contrast Stretching, Sharpen, Box Denoise, and Adaptive Thresholding.
 */

export interface PreprocessOptions {
  grayscale?: boolean;
  contrast?: number; // 0 to 100
  sharpen?: boolean;
  denoise?: boolean;
  adaptiveThreshold?: boolean;
  autoScale?: boolean;
}

/**
 * Loads a image URL or base64 into an HTMLImageElement
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error("Failed to load image: " + err));
    img.src = src;
  });
}

/**
 * High-performance canvas preprocessing pipeline
 */
export async function preprocessImage(
  imageSrc: string,
  options: PreprocessOptions = {}
): Promise<string> {
  const defaults: PreprocessOptions = {
    grayscale: true,
    contrast: 35,
    sharpen: true,
    denoise: true,
    adaptiveThreshold: true,
    autoScale: true,
  };
  const config = { ...defaults, ...options };

  const img = await loadImage(imageSrc);
  
  // Setup Canvas
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D canvas context");

  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;

  // Auto Scale: OCR accuracy drops significantly if text is too small.
  // Upscale if either dimension is below 1500px, keeping aspect ratio.
  if (config.autoScale && (width < 1500 || height < 1500)) {
    const scaleFactor = Math.max(1500 / width, 1500 / height, 1.5);
    width = Math.round(width * scaleFactor);
    height = Math.round(height * scaleFactor);
  }

  canvas.width = width;
  canvas.height = height;

  // Draw image with smooth scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const len = data.length;

  // 1. Convert to Grayscale & Adjust Contrast
  if (config.grayscale) {
    const contrastFactor = config.contrast ? (259 * (config.contrast + 255)) / (255 * (259 - config.contrast)) : 1;

    for (let i = 0; i < len; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Grayscale using standard relative luminance weights
      let gray = 0.299 * r + 0.587 * g + 0.114 * b;

      // Contrast Adjustment
      if (config.contrast) {
        gray = contrastFactor * (gray - 128) + 128;
      }

      // Clamp values
      gray = Math.max(0, Math.min(255, gray));

      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // 2. Convolution-based operations: Sharpen and Denoise (Blur)
  // We extract pixel channel data to perform clean kernel passes
  if (config.sharpen || config.denoise) {
    const tempImageData = ctx.getImageData(0, 0, width, height);
    const tempData = tempImageData.data;
    const outputImageData = ctx.createImageData(width, height);
    const outData = outputImageData.data;

    // Use a sharpen or blur kernel
    // Denoise (Box Blur):
    const blurKernel = [
      1/9, 1/9, 1/9,
      1/9, 1/9, 1/9,
      1/9, 1/9, 1/9
    ];
    // Sharpen kernel:
    const sharpenKernel = [
       0, -1,  0,
      -1,  5, -1,
       0, -1,  0
    ];

    const activeKernel = config.sharpen ? sharpenKernel : blurKernel;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sumVal = 0;
        
        // Apply 3x3 kernel on single channel (since grayscale, R=G=B)
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixelIdx = ((y + ky) * width + (x + kx)) * 4;
            const kernelVal = activeKernel[(ky + 1) * 3 + (kx + 1)];
            sumVal += tempData[pixelIdx] * kernelVal;
          }
        }

        const outIdx = (y * width + x) * 4;
        const clampedVal = Math.max(0, Math.min(255, sumVal));
        outData[outIdx] = clampedVal;
        outData[outIdx + 1] = clampedVal;
        outData[outIdx + 2] = clampedVal;
        outData[outIdx + 3] = tempData[outIdx + 3]; // Preserve alpha
      }
    }
    
    // Copy margins over
    for (let x = 0; x < width; x++) {
      const topIdx = x * 4;
      const bottomIdx = ((height - 1) * width + x) * 4;
      outData[topIdx] = tempData[topIdx];
      outData[topIdx+1] = tempData[topIdx+1];
      outData[topIdx+2] = tempData[topIdx+2];
      outData[topIdx+3] = tempData[topIdx+3];
      outData[bottomIdx] = tempData[bottomIdx];
      outData[bottomIdx+1] = tempData[bottomIdx+1];
      outData[bottomIdx+2] = tempData[bottomIdx+2];
      outData[bottomIdx+3] = tempData[bottomIdx+3];
    }
    for (let y = 0; y < height; y++) {
      const leftIdx = y * width * 4;
      const rightIdx = (y * width + width - 1) * 4;
      outData[leftIdx] = tempData[leftIdx];
      outData[leftIdx+1] = tempData[leftIdx+1];
      outData[leftIdx+2] = tempData[leftIdx+2];
      outData[leftIdx+3] = tempData[leftIdx+3];
      outData[rightIdx] = tempData[rightIdx];
      outData[rightIdx+1] = tempData[rightIdx+1];
      outData[rightIdx+2] = tempData[rightIdx+2];
      outData[rightIdx+3] = tempData[rightIdx+3];
    }

    ctx.putImageData(outputImageData, 0, 0);
  }

  // 3. Adaptive Thresholding (Bradley-Roth Local Thresholding)
  // Essential for scanned documents with lighting gradients / shadows
  if (config.adaptiveThreshold) {
    const finalImageData = ctx.getImageData(0, 0, width, height);
    const pixels = finalImageData.data;
    
    // Integral image calculation
    const integral = new Int32Array(width * height);
    let index = 0;

    for (let y = 0; y < height; y++) {
      let sum = 0;
      for (let x = 0; x < width; x++) {
        index = y * width + x;
        sum += pixels[index * 4]; // R channel
        if (y === 0) {
          integral[index] = sum;
        } else {
          integral[index] = integral[index - width] + sum;
        }
      }
    }

    // Adaptive threshold calculation
    const S = Math.round(width / 8); // Window size
    const T = 0.15; // Threshold percentage deviation (15% darker than local average is black)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        index = y * width + x;
        
        // Find local bounds
        const x1 = Math.max(0, x - Math.round(S / 2));
        const x2 = Math.min(width - 1, x + Math.round(S / 2));
        const y1 = Math.max(0, y - Math.round(S / 2));
        const y2 = Math.min(height - 1, y + Math.round(S / 2));

        const count = (x2 - x1) * (y2 - y1);

        // Sum of pixels within window using integral image
        const sum = integral[y2 * width + x2] 
                  - integral[y1 * width + x2] 
                  - integral[y2 * width + x1] 
                  + integral[y1 * width + x1];

        const pixelVal = pixels[index * 4];
        const localAverage = sum / count;

        const isWhite = pixelVal >= localAverage * (1.0 - T);
        const finalVal = isWhite ? 255 : 0;

        const pIdx = index * 4;
        pixels[pIdx] = finalVal;
        pixels[pIdx + 1] = finalVal;
        pixels[pIdx + 2] = finalVal;
      }
    }
    
    ctx.putImageData(finalImageData, 0, 0);
  }

  // Convert back to base64 with slight compression for speed
  return canvas.toDataURL("image/jpeg", 0.85);
}
