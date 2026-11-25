// Turn an uploaded File (image, audio…) into a data URL string we can store in a block.
// (Fine for a POC. Later we'll upload to real storage and keep just the URL.)
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
