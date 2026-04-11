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
![메인화면](./docs/main.png)

### 시스템 구성도
![시스템구성도](./docs/system_flow.png)

### 자료 흐름도
![자료흐름도](./docs/data_flow.png)

### ERD
![ERD](./docs/erd.png)

> 위 이미지는 예시 경로입니다.  
> 실제 이미지 파일명에 맞게 `./docs/...` 경로를 수정해서 사용하세요.

---

## 프로젝트 개요

- **프로젝트명**: 장애인 지원관리 시스템
- **프로젝트 유형**: 팀 프로젝트
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
