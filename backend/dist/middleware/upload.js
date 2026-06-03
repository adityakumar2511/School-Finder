"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.singleImageUpload = exports.uploadMemory = exports.UPLOAD_FOLDERS = exports.ALLOWED_MIME_TYPES = exports.MAX_UPLOAD_BYTES = void 0;
exports.isUploadFolder = isUploadFolder;
exports.detectImageMime = detectImageMime;
exports.validateUploadedFile = validateUploadedFile;
const multer_1 = __importDefault(require("multer"));
const AppError_1 = require("../utils/AppError");
exports.MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
exports.ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
];
exports.UPLOAD_FOLDERS = ["logos", "gallery", "profiles"];
const BLOCKED_EXTENSIONS = /\.(svg|pdf|exe|zip|js|mjs|ts|html|htm|php|bat|cmd|sh|dll|msi)$/i;
const ALLOWED_EXTENSIONS = /\.(jpe?g|png|webp)$/i;
function isUploadFolder(value) {
    return exports.UPLOAD_FOLDERS.includes(value);
}
function detectImageMime(buffer) {
    if (buffer.length < 12)
        return null;
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return "image/jpeg";
    }
    if (buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47) {
        return "image/png";
    }
    if (buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP") {
        return "image/webp";
    }
    return null;
}
function validateUploadedFile(buffer, options = {}) {
    if (buffer.length === 0) {
        throw AppError_1.Errors.BadRequest("Empty files are not allowed");
    }
    if (buffer.length > exports.MAX_UPLOAD_BYTES) {
        throw AppError_1.Errors.BadRequest("File size exceeds 5MB limit");
    }
    const filename = options.originalname?.toLowerCase() ?? "";
    if (filename && BLOCKED_EXTENSIONS.test(filename)) {
        throw AppError_1.Errors.BadRequest("File type is not allowed");
    }
    if (filename && !ALLOWED_EXTENSIONS.test(filename)) {
        throw AppError_1.Errors.BadRequest("Invalid file extension. Only .jpg, .jpeg, .png, and .webp are allowed");
    }
    const detectedMime = detectImageMime(buffer);
    if (!detectedMime) {
        throw AppError_1.Errors.BadRequest("File content does not match an allowed image format");
    }
    if (options.mimetype &&
        !exports.ALLOWED_MIME_TYPES.includes(options.mimetype)) {
        throw AppError_1.Errors.BadRequest("Only JPEG, PNG, and WebP images are allowed");
    }
    if (options.mimetype &&
        options.mimetype !== detectedMime &&
        !(options.mimetype === "image/jpg" && detectedMime === "image/jpeg")) {
        throw AppError_1.Errors.BadRequest("File content does not match the declared MIME type");
    }
}
exports.uploadMemory = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: exports.MAX_UPLOAD_BYTES, files: 1 },
    fileFilter: (_req, file, cb) => {
        if (!exports.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
            return;
        }
        if (BLOCKED_EXTENSIONS.test(file.originalname.toLowerCase())) {
            cb(new Error("File type is not allowed"));
            return;
        }
        cb(null, true);
    },
});
exports.singleImageUpload = exports.uploadMemory.single("file");
