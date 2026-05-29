"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = uploadImage;
exports.extractPublicIdFromUrl = extractPublicIdFromUrl;
exports.deleteImage = deleteImage;
exports.deleteImageByUrl = deleteImageByUrl;
const cloudinary_1 = require("cloudinary");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const OPTIMIZATION = {
    quality: "auto:good",
    fetch_format: "auto",
    flags: "strip_profile.force_strip.progressive",
};
function folderPath(folder) {
    return `school-platform/${folder}`;
}
function bufferToDataUri(buffer, mime) {
    return `data:${mime};base64,${buffer.toString("base64")}`;
}
/**
 * Upload an image buffer to Cloudinary with automatic optimization.
 */
async function uploadImage(file, folder = "logos", mime = "image/jpeg") {
    return new Promise((resolve, reject) => {
        const uploadSource = bufferToDataUri(file, mime);
        const stream = cloudinary_1.v2.uploader.upload_stream({
            folder: folderPath(folder),
            resource_type: "image",
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
            transformation: [OPTIMIZATION],
            eager: [{ ...OPTIMIZATION, width: 1200, crop: "limit" }],
            eager_async: false,
        }, (error, result) => {
            if (error || !result) {
                reject(error ?? new Error("Cloudinary upload failed"));
                return;
            }
            resolve({
                url: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
            });
        });
        stream.end(file);
    });
}
function extractPublicIdFromUrl(url) {
    try {
        const pathname = new URL(url).pathname;
        const marker = "/upload/";
        const index = pathname.indexOf(marker);
        if (index === -1)
            return null;
        let remainder = pathname.slice(index + marker.length);
        if (remainder.startsWith("v") && /^\/?v\d+/.test(remainder)) {
            remainder = remainder.replace(/^\/?v\d+\//, "");
        }
        return decodeURIComponent(remainder.replace(/\.[^/.]+$/, ""));
    }
    catch {
        return null;
    }
}
async function deleteImage(publicId) {
    await cloudinary_1.v2.uploader.destroy(publicId, { resource_type: "image" });
}
async function deleteImageByUrl(url) {
    const publicId = extractPublicIdFromUrl(url);
    if (publicId) {
        await deleteImage(publicId);
    }
}
exports.default = cloudinary_1.v2;
