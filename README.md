# Twitter 클론 프로젝트

Firebase와 React를 사용하여 Twitter의 핵심 기능을 클론하는 프로젝트입니다.

## 기술 스택

*   **프론트엔드:** React, TypeScript, Vite
*   **스타일링:** Tailwind CSS
*   **백엔드 및 데이터베이스:** Firebase (Authentication, Firestore, Storage)
*   **라우팅:** React Router DOM
*   **상태 관리:** React Context API
*   **기타 라이브러리:**
    *   `react-icons`: 아이콘 사용
    *   `date-fns`: 날짜 포매팅
    *   `react-easy-crop`: 프로필 이미지 크롭

## 주요 기능

*   Firebase 이메일/비밀번호 인증 (회원가입, 로그인, 로그아웃)
*   게시물 작성 (텍스트, 이미지/GIF 첨부)
*   타임라인 (최신 게시물 표시, 무한 스크롤)
*   프로필 페이지
    *   사용자 정보 표시
    *   사용자가 작성한 게시물 표시
    *   프로필 사진 업로드 및 수정 (이미지 크롭 기능 포함)
*   기본 아바타 표시
*   보호된 라우트 (로그인 필요)

## 설정 및 실행

1.  **Firebase 프로젝트 설정:**
    *   Firebase 콘솔에서 새 프로젝트를 생성합니다.
    *   웹 앱을 추가하고 Firebase 구성 정보(apiKey, authDomain 등)를 얻습니다.
    *   Authentication을 활성화하고 '이메일/비밀번호' 로그인 제공업체를 사용 설정합니다.
    *   Firestore Database를 생성합니다. (테스트 모드 또는 프로덕션 모드 보안 규칙 설정 필요)
    *   Storage를 활성화합니다. (Storage 보안 규칙 설정 필요)

2.  **프로젝트 설정:**
    *   저장소를 클론합니다:
        ```bash
        git clone <repository-url>
        cd twitter-clone
        ```
    *   필요한 패키지를 설치합니다:
        ```bash
        npm install
        # 또는
        yarn install
        ```
    *   프로젝트 루트에 `.env` 파일을 생성하고 Firebase 구성 정보를 추가합니다:
        ```dotenv
        VITE_API_KEY=your_api_key
        VITE_AUTH_DOMAIN=your_auth_domain
        VITE_PROJECT_ID=your_project_id
        VITE_STORAGE_BUCKET=your_storage_bucket
        VITE_MESSAGING_SENDER_ID=your_messaging_sender_id
        VITE_APP_ID=your_app_id
        ```
        (실제 환경 변수 이름은 `src/firebase.ts` 파일의 `firebaseConfig`를 참조하여 일치시켜야 합니다.)

3.  **개발 서버 실행:**
    ```bash
    npm run dev
    # 또는
    yarn dev
    ```
    이제 브라우저에서 앱을 확인할 수 있습니다 (기본적으로 `http://localhost:5173`).

## 향후 개선 사항

*   게시물 좋아요, 리트윗, 댓글 기능
*   사용자 팔로우/언팔로우 기능
*   알림 기능
*   Firestore 보안 규칙 강화
*   Storage 보안 규칙 강화
*   탐색 페이지 기능 구현
*   북마크 기능 구현
*   테스트 코드 작성
*   컴포넌트 및 로직 최적화
