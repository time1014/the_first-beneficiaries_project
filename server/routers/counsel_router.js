const express = require("express");
const router = express.Router();

const counselService = require("../services/counsel_service");
const upload = require('../upload');


router.get("/counsel/:no", async (req, res) => {
  let surNo = req.params.no
  let result = await counselService.counselInfoService(surNo);
  res.send(result);
});


router.post("/counselUpload", upload.array('file'), async (req, res) => {
  let { surNo, beneNo, userNo, title, content, date, files } = req.body;
  let file = req.files;
  let result = await counselService.counselInsertService(surNo , beneNo, userNo,title, content , date,  file);
  res.send(result);
});

router.put("/counselUpdate",upload.array("files"),async (req, res) => {
    let { no, title, content, date,name, role } = req.body;
    let deleteFiles = JSON.parse(req.body.deleteFiles || "[]");
    let result = await counselService.counselUpdateService(no,title,content,date,name,role,req.files,deleteFiles);
    res.send(result);
  }
);



router.get("/counselHistory/:no", async (req, res) => {
  let no = req.params.no;
  let result = await counselService.counselHistoryService(no);
  res.send(result);
});

router.delete("/counselDelete/:no", async (req, res) => {
  let no = req.params.no;
  let result = await counselService.counselDeleteService(no);
  res.send(result);
});

router.post("/counselSave", async (req, res) => {
  let { date, title, content, surNo, wNo ,beneNo} = req.body;
  let result = await counselService.storageService(date, title, content, surNo, wNo,beneNo)
  res.send(result);
})

router.get("/counselSaveInfo/:sNo/:no", async (req, res) => {
  let surNo  = req.params.sNo;
  let wNo = req.params.no;
  let result = await counselService.counselStorageInfoService( surNo , wNo);
  res.send(result);
});


router.delete("/counselSaveDelete/:no", async (req, res) => {
  let sNo = req.params.no;
  let result = await counselService.counselSaveDeleteService(sNo);
  res.send(result);
})

router.get("/counselBene/:no", async (req, res) => {
  let beneNo = req.params.no
  let result = await counselService.counselBeneInfoService(beneNo);
  res.send(result);
});



module.exports = router;
