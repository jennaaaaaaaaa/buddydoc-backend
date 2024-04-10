# BuddyDoc
- 항해99에서 진행한 최종프로젝트
- 프로젝트 기간: 2024.01 ~ 2024.03 / 6주
- 프로젝트 사이트: [버디독](https://buddydoc.vercel.app/)
- 백엔드: 2명
- 프론트엔드 : 2명
- 팀노션: [버디독 팀노션](https://maddening-shelf-99c.notion.site/BuddyDoc-dbaa1a9eb8c346c0b7c24f3ffab27faa)

### 프로젝트 개요
- 개발자들의 스터디/사이드 프로젝트 매칭 서비스
- 회원가입 시
  - 스터디나 사이드 프로젝트에 참여 또는 등록 기능
  - 북마크 기능
  - 스터디 참여시 채팅 기능
 
### 역할
- 게시글 검색(elasticsearch), 목록 조회, 게시글 작성, 수정, 삭제, 상세 조회
- 게시물에 참여한 프로필조회
- 북마크 추가/제거
- 실시간 채팅

### 기술 스택
- NestJS, Prisma, Socket.IO, Elasticsearch, Elastic Cloud, AWS EC2

### 프로젝트 진행 단계
1. 게시글 목록 조회, 게시글 작성, 수정, 삭제, 상세 조회, 내 정보 관련 api 구축
2. 게시글 검색(elasticsearch) 구현
3. 소셜 로그인 기능 구현
4. 북마크 추가/제거 기능 구현
5. 채팅 기능, 스터디/사이트프로젝트 신청 기능 구현
6. 배포

### 구현 내용
1. 게시글 목록 조회, 상세조회, 작성, 수정, 삭제
  - 최신순 정렬, 스터디/프로젝트 카테고리 분류, 모집완료 글 추가 조회, 조회수, 북마크
     ![게시글 목록](https://github.com/jennaaaaaaaaa/buddydoc-backend/assets/111362623/e78ea809-7240-4870-80ea-4f420fe09c6b)
     ![게시글 상세조회](https://github.com/jennaaaaaaaaa/buddydoc-backend/assets/111362623/28a1f9d5-5679-401a-bb21-24272571090f)

2. 채팅 기능
   - 참여하고 있는 스터디나 사이드프로젝트별로 채팅 가능
   ![채팅](https://github.com/jennaaaaaaaaa/buddydoc-backend/assets/111362623/26ef40e6-dea0-4204-b4ac-1b6921b59a4b)

### 트러블 슈팅
- 문제: 게시글 목록에서 북마크 추가가 적용되지 않음
- 시도: 프론트쪽에서 캐쉬문제인지 확인
- 해결 방법: 로그인을 해야만 북마크 기능을 사용하도록 해둬서 유저가드로 로그인 여부 판단이 필요했지만 로그인을 안 한 회원도 북마크 기능을 요구하는 게시글 목록에 접근 가능해야하기 때문에 커스텀유저가드를 생성하여 적용
