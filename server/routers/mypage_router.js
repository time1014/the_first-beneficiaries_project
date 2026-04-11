// express 사용
const express = require("express");

// 라우터 객체 생성
const router = express.Router();

// 서비스 파일 가져오기
// 실제 DB 작업은 service 쪽에서 처리함
const service = require("../services/mypage_service");

// =====================================
// 로그인 사용자 번호 기준 지원대상자 목록 조회
// GET /api/mypage/targets/:userNo
// =====================================
router.get("/targets/:userNo", async (req, res) => {
  try {
    // 주소에 들어있는 userNo를 숫자로 변환
    // 예: /targets/1002 -> 1002
    const userNo = Number(req.params.userNo);

    // service 호출해서 DB 조회
    const rows = await service.findAllTargets(userNo);

    // 프론트로 성공 응답 보내기
    res.json({
      retCode: "OK",
      data: rows,
    });
  } catch (err) {
    // 서버 콘솔에 에러 출력
    console.error("지원대상자 목록 조회 오류:", err);

    // 프론트로 실패 응답 보내기
    res.status(500).json({
      retCode: "FAIL",
      message: "지원대상자 목록 조회 실패",
    });
  }
});

// =====================================
// 지원대상자 등록
// POST /api/mypage/targets/:userNo
// =====================================
router.post("/targets/:userNo", async (req, res) => {
  try {
    // 로그인 사용자 번호
    const userNo = Number(req.params.userNo);

    // 보호자 기관번호 조회
    const guardianInstitutionNo =
      await service.findGuardianInstitutionNo(userNo);

    if (!guardianInstitutionNo) {
      return res.status(400).json({
        retCode: "FAIL",
        message: "보호자 기관 정보를 찾을 수 없습니다.",
      });
    }

    // 프론트에서 넘어온 값 + 서버 조회값 조합
    const target = {
      userNo, // guardian_no
      managerNo: req.body.managerNo ? Number(req.body.managerNo) : null, //담당자
      subManagerNo: req.body.subManagerNo
        ? Number(req.body.subManagerNo)
        : null, //부담당자
      institutionNo: guardianInstitutionNo, // 보호자 기관번호로 고정

      name: req.body.name,
      birth: req.body.birth,
      phone: req.body.phone,
      gender: req.body.gender,
      address: req.body.address,
      disability_type: req.body.disability_type,
      relation: req.body.relation,
    };

    console.log("지원대상자 등록 userNo:", userNo);
    console.log("보호자 기관번호:", guardianInstitutionNo);
    console.log("등록 target:", target);

    const result = await service.createTarget(target);

    res.json({
      retCode: "OK",
      message: "등록 완료",
      insertId: result.insertId,
    });
  } catch (err) {
    console.error("지원대상자 등록 오류:", err);

    res.status(500).json({
      retCode: "FAIL",
      message: "지원대상자 등록 실패",
    });
  }
});

// =====================================
// 로그인 사용자 기준 지원대상자 수정
// PUT /api/mypage/targets/:id/:userNo
// =====================================
router.put("/targets/:id/:userNo", async (req, res) => {
  try {
    // 수정할 대상자 번호
    const id = Number(req.params.id);

    // 로그인 사용자 번호
    const userNo = Number(req.params.userNo);

    // 프론트에서 넘어온 수정값 정리
    const target = {
      id, // beneficiaries_no
      userNo, // guardian_no
      name: req.body.name,
      birth: req.body.birth,
      phone: req.body.phone,
      gender: req.body.gender, // 성별 코드
      address: req.body.address,
      disability_type: req.body.disability_type, // 장애유형
      relation: req.body.relation, // 관계
    };

    // service 호출해서 UPDATE 실행
    await service.modifyTarget(target);

    // 수정 성공 응답
    res.json({
      retCode: "OK",
      message: "수정 완료",
    });
  } catch (err) {
    console.error("지원대상자 수정 오류:", err);

    res.status(500).json({
      retCode: "FAIL",
      message: "지원대상자 수정 실패",
    });
  }
});

router.get("/myPageInfo/:no", async (req, res) => {
  let uNo = req.params.no;

  try {
    let result = await service.myPageInfoService(uNo);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "서버 에러" });
  }
});

router.put("/myPageInfo", async (req, res) => {
  try {
    // 로그인 사용자 번호
    // let userNo = req.params.no;

    // 프론트에서 넘어온 수정값 정리
    const target = {
      // userNo, // guardian_no
      user_no: req.body.user_no,
      name: req.body.user_name,
      tel: req.body.tel,
      address: req.body.address,
    };

    // service 호출해서 UPDATE 실행
    await service.myPageTarget(target);

    // 수정 성공 응답
    res.json({
      retCode: "OK",
      message: "수정 완료",
    });
  } catch (err) {
    console.error("사용자 수정 오류:", err);

    res.status(500).json({
      retCode: "FAIL",
      message: "사용자 수정 실패",
    });
  }
});

// router 내보내기
module.exports = router;
