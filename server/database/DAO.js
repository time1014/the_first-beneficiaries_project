// MariaDB에 접속할 모듈
const mariadb = require("mariadb");

// ConnectionPool 생성
const connectionPool = mariadb.createPool({
  // DB에 접속하는 정보
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectionLimit: 10,
  // Object의 필드정보(Entiry)를 Query문에 있는 '?'에 자동변환 설정
  permitSetMultiParamEntries: true,
  // DML(insert, update, delete)를 실행할 경우 // 반환되는 Object의 insertId 속성을 Number 타입으로 자동 변환
  insertIdAsNumber: true,
  // MariaDB의 데이터 타입 중 bigInt 타입을 Javascript의 Number 타입으로 자동 변환
  // 해당 타입을 Javascript에선 자동으로 변환하지 못함
  bigIntAsNumber: true,
  // logger 등록
  logger: {
    // 실제 실행되는 SQL문이 console.log로 출력되도록 설정
    // error 발생 시 처리함수
    error: console.log,
  },
});

module.exports = {
  pool: connectionPool,
};
