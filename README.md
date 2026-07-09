# the_first


 
# 장애인 지원관리 시스템

장애인 지원관리 시스템은 **보호자, 기관담당자, 기관관리자, 시스템관리자**의 역할에 따라  
지원대상자 관리, 조사지 작성, 담당자 지정, 우선순위 설정, 지원계획 및 지원결과 작성과 승인까지  
하나의 흐름으로 관리할 수 있도록 구현한 **역할 기반 업무관리 웹 시스템**입니다.

본 프로젝트는 장애인 지원 업무를 보다 체계적이고 효율적으로 관리할 수 있도록  
업무 절차를 전산화하고, 사용자 권한에 맞는 기능을 제공하는 것을 목표로 개발되었습니다.

---


## 팀 구성 및 역할

<table align="center">
  <tr> 
    <td align="center"><a href=https://github.com/time1014><img src="https://avatars.githubusercontent.com/u/64236748?v=4" width="100px;" alt=""/><br /><sub><b>방진영</b></sub></a><br />
    </td>
    <td align="center"><a href=https://github.com/crescentia0011><img src="https://avatars.githubusercontent.com/u/254889839?v=4" width="100px;" alt=""/><br /><sub><b>김병완</b></sub></a><br />
    </td>
    <td align="center"><a href=https://github.com/kimeunji806><img src="https://avatars.githubusercontent.com/u/258710580?v=4" width="100px;" alt=""/><br /><sub><b>김은지</b></sub></a><br />
    </td>
   <td align="center"><a href=https://github.com/ryusongji><img src="https://avatars.githubusercontent.com/u/53076307?v=4" width="100px;" alt=""/><br /><sub><b>류송지</b></sub></a><br />
    </td>
  </tr>
  <tr>
    <th align="center">팀장</th>
    <th align="center">부팀장</th>
    <th align="center">팀원</th>
    <th align="center">팀원</th>
  </tr>
 <tr>
   <td align="center">배포</td>
   <td align="center">GIT</td>
   <td align="center">DB</td>
  <td align="center">개발환경</td>
 </tr>
</table>

---
## 프로젝트 미리보기

### 메인 화면
<img width="2559" height="1293" alt="image" src="https://github.com/user-attachments/assets/77750b03-ea47-4bf1-a582-c631eebcb712" />


### 프로그램 흐름도
<img width="1249" height="702" alt="image" src="https://github.com/user-attachments/assets/befbdda9-47ee-4ee5-aad6-993f8c73328e" />

### ERD
<img width="1166" height="618" alt="image" src="https://github.com/user-attachments/assets/927186df-a881-4b56-b1ff-46bfa5d073e8" />



---

## 프로젝트 개요

- **프로젝트명**: 장애인 지원관리 시스템
- **프로젝트 유형**: 팀 프로젝트
- **프로젝트 기간**:2026/03/10~2026/04/10
- **개발 목적**
  - 장애인 지원 업무의 전산화
  - 역할별 업무 프로세스 분리 및 권한 기반 처리
  - 지원계획 및 지원결과 승인 흐름 구현
  - 첨부파일 및 수정이력 관리 기능 제공

---



## 주요 기능

### 일반 사용자(보호자)
- 지원대상자 등록 / 조회 / 수정
- 조사지 작성
- 지원계획 열람
- 지원결과 열람

### 기관담당자
- 대기자 목록 확인
- 조사지 조회
- 상담 기록
- 우선순위 작성
- 지원계획 작성 / 수정 / 삭제 / 임시저장
- 지원결과 작성 / 수정 / 삭제 / 임시저장
- 첨부파일 관리
- 수정이력 관리
- 본인정보 조회 / 수정

### 기관관리자
- 담당자 지정
- 우선순위 승인 / 반려
- 지원계획 승인 / 반려
- 지원결과 승인 / 반려
- 본인정보 조회 / 수정

### 시스템관리자
- 기관 목록 조회
- 기관 상세조회
- 기관 등록 / 수정
- 기관 운영관리

---

## 업무 흐름

1. 일반 사용자가 지원대상자를 등록하고 조사지 정보를 입력합니다.
2. 기관관리자가 대상자에게 담당자 및 부담당자를 지정합니다.
3. 기관담당자가 조사지와 상담기록을 바탕으로 우선순위를 작성합니다.
4. 기관관리자가 우선순위를 승인합니다.
5. 기관담당자가 지원계획을 작성하고 승인 요청을 보냅니다.
6. 기관관리자가 지원계획을 승인 또는 반려합니다.
7. 기관담당자가 지원결과를 작성하고 승인 요청을 보냅니다.
8. 기관관리자가 지원결과를 승인 또는 반려합니다.
9. 각 단계에서 첨부파일 및 수정이력이 함께 관리됩니다.

---

## 기술 스택

### Frontend
- Vue 3
- Vite
- PrimeVue
- Tailwind CSS

### Backend
- Node.js
- Express

### Database
- MariaDB

### Dev Tools
- VS Code
- MySQL Workbench

### Collaboration
- Git
- GitHub

### Deployment
- NCP (Naver Cloud Platform)
- Nginx
- PM2
- GitHub Actions

---

구현 파트
## 로그인
<img width="2557" height="1304" alt="image" src="https://github.com/user-attachments/assets/9b83e9d7-6ff7-432f-8f43-e0d42f118fd3" />

- bcrypt의 compare 메소드를 활용해 단반향 암호화로 DB의 암호화 된 비밀번호와 자체 비교
- 아이디 비밀번호 체크 후 로그인 성공시 피니아에 로그인 정보 저장

## 페이지 권한 처리
<img width="1047" height="481" alt="image" src="https://github.com/user-attachments/assets/e624e34d-5743-403a-8f46-46439fc1e788" />
<img width="756" height="530" alt="image" src="https://github.com/user-attachments/assets/d02c5536-a2b7-44fb-804d-3a2148fa508a" />

- 권한에 따라 접근 불가능한 페이지 접근시 접근을 막음
- pinia의 role 값을 바탕으로 권한 확인

## 승인대기 / 승인요청승인
<img width="542" height="537" alt="image" src="https://github.com/user-attachments/assets/c84e8cae-2b5b-4099-a8ae-8ab1793b150b" />
<img width="2559" height="1297" alt="image" src="https://github.com/user-attachments/assets/b8dc4a21-6433-495d-b014-e883900b6e83" />

- 회원가입 후 로그인 시 승인대기 상태
- 관리자의 승인 이후 부터 로그인 가능
- 관리자는 본인이 소속한 기관에 회원가입한 사용자의 회원가입 승인 요청을 승인/반려할 수 있음


## 마이페이지 (일반사용자)
<img width="913" height="500" alt="image" src="https://github.com/user-attachments/assets/a59878b2-c835-4ff5-9917-d0a76f62220b" />

- 일반사용자는 마이페이지에서 자신의 계정 정보를 조회할 수 있고 일부 계정 정보를 수정할 수 있음

## 상담기록

<img width="1099" height="531" alt="image" src="https://github.com/user-attachments/assets/9148ad05-d403-4ddb-b38f-e3cdb100acc6" />

- 담당자는 지원대상자와의 상담기록을 등록할 수 있음
- 등록시 상담날짜 , 제목 , 내용을 임시저장하고 불러올수 있음 (임시기록은 지원신청서와 작성자를 기준으로 저장)
- 등록시 첨부파일을 여러건 등록할 수 있음
- 상담기록을 수정할 수 있고 수정시에 수정 이력에서 수정자와 날짜 등의 정보를 조회할 수 있고 DB에서 수정 내용도 관리하고 있음
- 삭제시 확인 메세지 출력
- 수정은 담당자와 부담당자만 가능 / 삭제는 등록한 당사자만 가능
- 관리자는 등록 / 수정 / 삭제 모두 불가능

## 일반사용자 (조회 모달창)

<img width="431" height="218" alt="image" src="https://github.com/user-attachments/assets/51f2e389-2817-4c86-9d00-7de7361c83e9" />
<img width="418" height="185" alt="image" src="https://github.com/user-attachments/assets/953fb248-8ffd-4f8a-9710-c5b694083c6d" />

- 일반사용자는 지원 과정의 결과를 메인페이지에서 보기 버튼을 통해 조회 가능
- 지원 계획과 결과는 승인 + 종결된 결과만 확인 가능


## 기술 스택 시각화

| 구분 | 사용 기술 |
|------|----------|
| Frontend | ![Vue](https://img.shields.io/badge/Vue%203-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white),![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white),![PrimeVue](https://img.shields.io/badge/PrimeVue-3B82F6?style=for-the-badge&logo=vue.js&logoColor=white),![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white) |
| Backend | ![Node.js](https://img.shields.io/badge/Node.js-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white),![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white) |
| Database | ![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white) |
| Dev Tools | <img src="https://img.shields.io/badge/아이콘내용-바탕색?style=flat&logo=vscode&logoColor=white"/>, MySQL Workbench |
| Collaboration | ![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white),![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)|
| Deployment | ![Naver Cloud](https://img.shields.io/badge/NCP-03C75A?style=for-the-badge&logo=naver&logoColor=white),![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white),![PM2](https://img.shields.io/badge/PM2-2B037A?style=for-the-badge&logo=pm2&logoColor=white),![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white) |
















---

## 프로젝트 구조

```bash
the_first/
├── client/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── counsel/
│   │   │   ├── plan/
│   │   │   ├── priority/
│   │   │   ├── result/
│   │   │   └── survey/
│   │   ├── layout/
│   │   ├── router/
│   │   ├── service/
│   │   ├── stores/
│   │   └── views/
│   └── package.json
│
├── server/
│   ├── database/
│   │   ├── sql/
│   │   ├── mappers/
│   │   └── DAO.js
│   ├── routers/
│   ├── services/
│   ├── uploads/
│   ├── app.js
│   └── package.json
│
├── docs/
│   ├── main.png
│   ├── system_flow.png
│   ├── data_flow.png
│   └── erd.png
│
└── README.md
