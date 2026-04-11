const multer = require("multer");
const path = require("path");

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const encfile = Buffer.from(file.originalname, "latin1").toString("utf8");
    // 파일명 한글 깨짐 방지
    file.originalname = encfile;
    const fn = path.basename(encfile, path.extname(encfile));
    const ext = path.extname(encfile);
    const uniqueName = `${fn}_${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

module.exports = upload;
