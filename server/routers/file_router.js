const express = require("express");
const router = express.Router();


require('dotenv').config();
const path = require('path');
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

router.get('/download/:filename', (req, res) => {
const fileName = decodeURIComponent(req.params.filename);
const filePath = path.join(UPLOAD_DIR, fileName);

  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error(err);
      res.status(404).send('파일 없음');
    }
  });
});


module.exports = router;