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
- 게시글 검색(elasticsearch)
- 게시글 목록 조회
- 게시글 작성, 수정, 삭제, 상세 조회
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

## 구현 내용

### 러닝커버를 감수하고 NestJS 도입
+ 서비스 확장 및 유지보수의 장점
+ 아키텍처가 정의 되어 있어 협업에 용의
+ typescript 기반으로 컴파일 에러 방지

### swagger
+ 프론트엔드와의 원활한 협업을 위해 api 문서화 진행

### 게시글 목록 조회
기본 최신순 정렬, 스터디/프로젝트 카테고리 분류, 모집완료 글 추가 조회, 조회수, 북마크 여부, 작성자, 마감여부, 기술스텍 등 확인 가능

![게시글 목록](https://github.com/jennaaaaaaaaa/buddydoc-backend/assets/111362623/e78ea809-7240-4870-80ea-4f420fe09c6b)

- 무한스크롤을 위한 커서 기반 페이지네이션 적용
- OptionalJwtAuthGuard를 사용하여 사용자 인증
- 인증된 사용자 일 경우 게시글 북마크 여부 반환
- isEnd parameter 값을 받아 모집 완료 게시글 필터링(0: 모집중 게시글, 1: 모집완료 게시글)
- postType parameter 값을 받아 게시글 유형 분리(스터디, 프로젝트)
- 페이지네이션을 위해 현재까지 조회된 마지막 게시글id를 lastPostId parameter 값으로 받아 이후 게시글id부터 다음페이지 게시글들을 조회 or (현재까지 조회된 마지막 게시글id인 lastPostId를 통해 다음 페이지의 게시글을 조회)
- where 절을 통해 삭제되지 않은 게시글, 게시글 유형, 마지막 게시글id, 모집 마감일 등을 조건으로 설정
- take 옵션으로 10개씩 게시글을 가져옴
- select를 통해 게시글의 필드 지정
- orderBy로 게시글 내림차순 정렬
- 반환 게시글이 10개 미만일 때 isLastPage를 통해 마지막 페이지임을 알림

### 게시글 검색(elasticsearch)
elasticsearch 매핑, 게시글 검색 기능, 인덱스 생성 및 삭제 기능, document관리(추가, 삭제, 업데이트)기능, 문서 존재 여부 검증 기능들 구현
  - 프로젝트 확장성을 고려해 효율적인 검색 기능을 제공하기 위해 도입

![검색기능](https://github.com/jennaaaaaaaaa/kk/assets/111362623/11747717-26fe-4fa3-969a-dd48d875ea8a)

- 사용자 정의 분석기 및 토크나이저를 통한 고급 검색(공백과 점을 기준으로 분리, 동의어 설정)
- 이전 페이지의 마지막 문서 다음부터 검색을 시작하기 때문에 성능이 효율적이고 무한스크롤을 지원하기 위해 search_after 페이지네이션을 적용
  - search_after: 페이징 처리를 위해 마지막 게시글id, createdAt 정렬 기준을 기반으로 검색 결과 반환
- 사용자가 입력한 검색어로 게시글 제목과 내용을 검색
- 게시글 검색 시 삭제된 게시글 필터링
- 게시글이 추가 작성되거나 수정되면 document도 추가나 수정되어 검색 기능 정확도 향상
- 현재 배포 사이트에 비용적인 문제로 기본 데이터베이스 검색 기능으로 동작

### 상세조회, 작성, 수정, 삭제
북마크 여부, 조회수, 마감여부, 기술스텍, 게시글 유형, 스터디/프로젝트 기간 등등 확인 가능

![게시글 상세조회](https://github.com/jennaaaaaaaaa/buddydoc-backend/assets/111362623/28a1f9d5-5679-401a-bb21-24272571090f)

- OptionalJwtAuthGuard를 사용하여 인증된 사용자인지 확인
- 게시글의 작성자가 아닌 다른 사용자가 조회 했을 경우 조회수 증가
- 인증된 사용자일 경우 게시글을 북마크했는지 여부를 확인
- 게시글 생성 및 수정 시 검색 엔진에 데이터를 업데이트해 추가, 변경된 사항이 검색 결과에 반영
- 삭제 기능은 게시글의 작성자 검증 후 게시글을 softDelete 처리합니다

### 북마크 추가/제거
북마크 추가할 경우 게시글의 선호도가 증가하고 해제할 경우 감소

- 북마크 기능에 선호도 또한 변경되야하는 두가지 동작을 문제 없이 수행하기 위해 트랜잭션을 적용 시켜 데이터의 일관성이 깨지는 걸 방지
- 사용자들의 개인화된 경험을 제공하기 위해 기능 구현


### 실시간 채팅 기능
참여하고 있는 게시글(스터디/사이드프로젝트에 참가)별 실시간 채팅 가능

![채팅](https://github.com/jennaaaaaaaaa/buddydoc-backend/assets/111362623/26ef40e6-dea0-4204-b4ac-1b6921b59a4b)

+ 전송된 메시지는 해당 채팅방에 참여 중인 모든 사용자에게 실시간으로 전달
+ 게시글 작성자는 자동으로 해당 게시글의 채팅방에 참여
+ 게시글 참여 승인된 사용자만 채팅방에 참여
+ 채팅방의 이전 메세지를 최신순으로 조회하고 무한스크롤을 지원하는 페이지네이션 기능 구현
+ 사용자가 webSocket 연결을 시도할 때 JWT를 활용하여 사용자 인증을 수행하며, 인증된 사용자만 채팅 서비스를 이용 가능

## 트러블 슈팅
- 문제: 게시글 목록에서 북마크 추가가 적용되지 않음
- 시도: 프론트쪽에서 캐쉬문제인지 확인
- 해결 방법: 로그인을 해야만 북마크 기능을 사용하도록 해둬서 유저가드로 로그인 여부 판단이 필요했지만 로그인을 안 한 회원도 북마크 기능을 요구하는 게시글 목록에 접근 가능해야하기 때문에 커스텀유저가드를 생성하여 적용

## 회고
- 잘한점
  - 마지막 프로젝트 때 거의 매일 개인적으로 회고록을 기록
  - 파이널 이전 프로젝트 때 Redis, elasticsearch, nodemailer 새로운 기술을 조금이라도 더 사용해보기 위해 노력
- 아쉬운 점(개선방향)
  - 테스트 코드를 구현해보지 못함
    - 기능에 대한 최소한의 테스트 코드라도 작성해보기 
  - 프로젝트 과정을 더 자세하고 깔끔하게 기록하지 못 함
    -  매번 기록하려고 노력하면서 저만의 방법을 터득해 나가기
  - 프로젝트의 확장성을 고려하지 못한거 같은 데이터베이스 설계
    - 데이터베이스 정규화에 맞춰서 확실하게 설계를 한 뒤 성능적인 부분은 따로 고려
- 배운점
  - 프론트와 첫 협업 경험으로 소통이 중요하다는 건 알고 있었지만 어떤 방향으로 소통이 중요한지 깨달았습니다.
예를 들어 반환값에 대한 소통이라던지, 데이터베이스 컬럼명 또는 api명세서가 자주 수정되는 이슈로 swagger를 도입했지만 수정되는 부분들을 계속해서 말해준다던지, 기획했던 부분에서 시간상 빼야할 거 같은 부분들 또는 빼야할거 같다고 생각했는데 구현한 경우 등 이런 것들에 대해 서로 최대한 빠르게 공유해서 의견을 나누고 확실하게 결정을 내리는게 중요하다라는걸 깨달았습니다

