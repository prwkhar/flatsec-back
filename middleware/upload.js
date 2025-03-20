import multer from 'multer';

// Use memory storage so we can directly upload the file buffer to Cloudinary.
const storage = multer.memoryStorage();

const upload = multer({ storage });

export default upload;
