import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/dni/');
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const nombre = file.fieldname + '-' + Date.now() + ext;
    cb(null, nombre);
  }
});

export const subirDNI = multer({ storage });
