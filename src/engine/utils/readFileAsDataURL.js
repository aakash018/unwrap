// Turn an uploaded File (image, audio…) into a data URL string we can store in a block.
// Photos are made smaller first (at most LONGEST px on their longer side, as
// WebP or JPEG): a phone photo of 4–5 MB becomes a few hundred KB, which is
// plenty on a phone screen, and keeps the draft small enough to save.
// (Until photos are uploaded to real storage and only their address is kept.)

const LONGEST = 1600; // px
const QUALITY = 0.85;

const asDataURL = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const toBlob = (canvas, type) => new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));

// A smaller copy of a photo, or null if it can't be made (then the original is kept).
async function smaller(file) {
  try {
    const picture = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, LONGEST / Math.max(picture.width, picture.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(picture.width * scale);
    canvas.height = Math.round(picture.height * scale);
    canvas.getContext('2d').drawImage(picture, 0, 0, canvas.width, canvas.height);
    picture.close();
    let blob = await toBlob(canvas, 'image/webp');
    if (blob?.type !== 'image/webp') blob = await toBlob(canvas, 'image/jpeg'); // (a browser that can't write WebP)
    return blob && blob.size < file.size ? blob : null;
  } catch {
    return null;
  }
}

export async function readFileAsDataURL(file) {
  // (animated GIFs and drawings stay as they are)
  const photo = file.type?.startsWith('image/') && !/gif|svg/.test(file.type);
  return asDataURL((photo && (await smaller(file))) || file);
}
