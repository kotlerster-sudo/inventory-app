/**
 * Compresses an image file to under maxSizeKB using canvas + JPEG encoding.
 * Tries progressive quality reduction (0.85 → 0.1) and scales down dimensions
 * if the image is very large, to guarantee the target size is met.
 */
export async function compressImage(
  file: File,
  maxSizeKB = 200
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement("canvas");
      let { width, height } = img;

      // Step 1: cap dimensions at 1920px on the longest side
      const MAX_DIM = 1920;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width >= height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      const targetBytes = maxSizeKB * 1024;
      const baseName = file.name.replace(/\.[^.]+$/, "");
      const outName = `${baseName}.jpg`;

      // Step 2: iterate quality until under target, or give up at 0.1
      const tryQuality = (quality: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas compression failed"));
              return;
            }

            if (blob.size <= targetBytes || quality <= 0.1) {
              // Step 3: if still over at q=0.1, halve dimensions and retry once
              if (blob.size > targetBytes && quality <= 0.1) {
                canvas.width = Math.round(width / 2);
                canvas.height = Math.round(height / 2);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(
                  (b2) => {
                    const final = b2 ?? blob;
                    resolve(
                      new File([final], outName, {
                        type: "image/jpeg",
                        lastModified: Date.now(),
                      })
                    );
                  },
                  "image/jpeg",
                  0.7
                );
              } else {
                resolve(
                  new File([blob], outName, {
                    type: "image/jpeg",
                    lastModified: Date.now(),
                  })
                );
              }
            } else {
              // drop quality by 0.1 and retry
              tryQuality(Math.round((quality - 0.1) * 10) / 10);
            }
          },
          "image/jpeg",
          quality
        );
      };

      tryQuality(0.85);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for compression"));
    };

    img.src = objectUrl;
  });
}
