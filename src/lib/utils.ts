export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Processes an image file for OCR by applying greyscale and thresholding.
 * This is done in the browser using the Canvas API.
 * @param file The image file to process.
 * @param threshold A value between 0 and 255. Pixels with luminance above this value will be white, and below will be black. Defaults to 150.
 * @returns A promise that resolves to an object containing the new processed File and its dimensions.
 */
export const processImageForOCR = (
	file: File,
	threshold: number = 130
): Promise<{ processedFile: File; width: number; height: number }> => {
	return new Promise((resolve, reject) => {
		const img = new Image();

		img.onload = () => {
			const { width, height } = img;
			URL.revokeObjectURL(img.src); // Clean up object URL

			const canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext('2d');

			if (!ctx) {
				return reject(new Error('Could not get canvas context'));
			}

			ctx.drawImage(img, 0, 0);

			try {
				const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
				const data = imageData.data;

				for (let i = 0; i < data.length; i += 4) {
					// Greyscale
					const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
					// Threshold
					const value = luminance > threshold ? 255 : 0;
					data[i] = data[i + 1] = data[i + 2] = value;
				}

				ctx.putImageData(imageData, 0, 0);
			} catch (err) {
				return reject(err);
			}

			canvas.toBlob((blob) => {
				if (!blob) {
					return reject(new Error('Canvas toBlob failed'));
				}
				const processedFile = new File([blob], file.name, { type: 'image/jpeg' });
				resolve({ processedFile, width, height });
			}, 'image/jpeg');
		};

		img.onerror = (err) => {
			URL.revokeObjectURL(img.src); // Clean up object URL
			reject(new Error(`Failed to load image: ${err}`));
		};

		img.src = URL.createObjectURL(file);
	});
};
