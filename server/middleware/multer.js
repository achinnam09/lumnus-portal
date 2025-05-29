import multer from "multer";

// Store files in memory for Supabase upload
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max upload size
    },
});

export default upload;