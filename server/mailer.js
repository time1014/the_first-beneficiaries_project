const nodemailer = require("nodemailer");
const codeStore = require("./codeStore");

const generateRandomNumber = (n) => {
  let code = "";
  for (let i = 0; i < n; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
};

const transport = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  // port: 587,
  // secure: false,
  auth: {
    user: "thdwl525@g.yju.ac.kr",
    pass: "hbwwafryvfubodzy",
  },
});

const sendEmail = (email) => {
  console.log(email);

  const code = generateRandomNumber(6);

  codeStore.set(email, {
    code,
    expiresAt: Date.now() + 3 * 60 * 1000,
  });

  const mailOptions = {
    from: process.env.NODEMAILER_USER,
    to: email,
    subject: "발달장애인지원 프로그램 인증 코드",
    text: `발달장애인지원 프로그램 인증 코드는 ${code}`,
  };
  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });
  return code;
};

module.exports = { generateRandomNumber, sendEmail };
