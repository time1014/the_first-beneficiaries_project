require("dotenv").config({ path: "./database/dbConfig.env" });
const express = require("express");
const cors = require("cors");
const app = express();
const nodemailer = require("./mailer");
app.use(cors());
const port = 3000;
const codeStore = require("./codeStore");
const sysAdminInstitutionRouter = require("./routers/sysadmin_institution_router");

// 미들웨어 등록 영역
// body parser
// content-type : application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// content-type : application/json
app.use(express.json());

// Server 실행
app.listen(port, () => {
  console.log("Server Start");
  console.log(`http://localhost:${port}`);
});

// 라우팅 등록 영역
// - 기본 라우팅
// app.get("/", (req, res) => {
//   res.send("Welcome!!");
// });

app.post("/api/mail", async (req, res) => {
  const { email } = req.body;
  console.log(email);

  const result = await nodemailer.sendEmail(email);

  console.log(result);
  if (result.messageId) {
    res.json({ retCode: "OK" });
  } else {
    res.json({ retCode: "NG" });
  }
});

app.post("/api/verify", (req, res) => {
  const { user_email, code } = req.body;
  try {
    const data = codeStore.get(user_email);
    console.log(data.code);
    console.log(code);

    if (!data) throw new Error("요청없음");

    console.log("현재시간:", Date.now());
    console.log("만료시간:", data.expiresAt);
    if (Date.now() > data.expiresAt) {
      codeStore.delete(user_email);
      throw new Error("만료됨");
    }

    if (data.code !== code) {
      throw new Error("인증번호가 일치하지 않습니다.");
    }
    res.json({ retCode: true });

    codeStore.delete(user_email);
  } catch (err) {
    res.status(400).json({
      retCode: false,
      message: err.message,
    });
  }
});


const userRouter = require("./routers/user_router.js");
app.use("/api", userRouter);
const institutionRouter = require("./routers/institution_router.js");
app.use("/api", institutionRouter);
const mypageRouter = require("./routers/mypage_router"); //마이페이지 지원대상자
app.use("/api/mypage", mypageRouter);
const institutionMyPageRouter = require("./routers/institution_mypage_router"); //마이페이지 기관담당자
app.use("/api/institutionmypage", institutionMyPageRouter);
const infoRouter = require("./routers/info_router");
app.use("/api", infoRouter);
const counselRouter = require("./routers/counsel_router");
app.use("/api", counselRouter);
const managerAssignRouter = require("./routers/manager_assign_router"); // 기관담당자 지정
app.use("/api/managerAssign", managerAssignRouter);
const noticeRouter = require("./routers/notice_router.js"); // 공지사항
app.use("/api", noticeRouter);
const adminMyPageRouter = require("./routers/admin_mypage_router"); //마이페이지 기관관리자
app.use("/api/admin/mypage", adminMyPageRouter);
const listRouter = require("./routers/list_router");
app.use("/api", listRouter);

const surveyRouter = require("./routers/survey_router");
app.use("/api", surveyRouter);
const planRouter = require("./routers/plan_router"); // 지원계획
app.use("/api/plan", planRouter);
const resultRouter = require("./routers/result_router"); // 지원결과
app.use("/api/result", resultRouter);

const mypagRouter = require("./routers/mypage_router"); //마이페이지 일반사용자
app.use("/api", mypagRouter);

const surveyInputRouter = require("./routers/surveyInput_router");
app.use("/api", surveyInputRouter);
const fileRouter = require("./routers/file_router");
app.use("/api", fileRouter);

const priorityRouter = require("./routers/priority_router");
app.use("/api", priorityRouter);
app.use("/api/sysadmin/institutions", sysAdminInstitutionRouter); // 시스템관리자 기관관리

const path = require("path");
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

app.get("/", function (req, res, next) {
  res.sendFile(path.join(__dirname, "./public", "index.html"));
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "./public", "index.html"));
});



