# Cine-Catch 백엔드 개발 가이드

백엔드 개발자를 위한 A to Z 완벽 가이드

## 목차
1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [프로젝트 구조](#3-프로젝트-구조)
4. [데이터베이스 설계](#4-데이터베이스-설계)
5. [도메인별 상세 설명](#5-도메인별-상세-설명)
6. [API 엔드포인트](#6-api-엔드포인트)
7. [개발 환경 설정](#7-개발-환경-설정)
8. [실행 방법](#8-실행-방법)
9. [CI/CD 파이프라인](#9-cicd-파이프라인)
10. [학습 포인트](#10-학습-포인트)

---

## 1. 프로젝트 개요

### 1.1 프로젝트 소개
**Cine-Catch**는 영화관 이벤트 및 프로모션 알림 서비스입니다.

**핵심 기능**:
- 영화관별 이벤트 정보 조회
- 위치 기반 주변 영화관 검색
- 영화별 이벤트 조회
- 사용자 위치 기반 맞춤 알림

**실제 사용 시나리오**:
```
1. 사용자가 앱을 열면 현재 위치 기반으로 주변 영화관을 보여줍니다.
2. 특정 영화관에서 진행 중인 이벤트(굿즈, 쿠폰, GV)를 확인할 수 있습니다.
3. 좋아하는 영화의 프로모션 이벤트를 검색할 수 있습니다.
4. 관심 영화관을 구독하면 새 이벤트 알림을 받습니다.
```

### 1.2 프로젝트 구성

```
cine-catch/
├── backend/              # Spring Boot 백엔드 서버
├── frontend/             # React 프론트엔드
├── event-crawler/        # Python 크롤러 (이벤트 수집)
├── infra/                # 인프라 설정 (Docker Compose)
└── .github/workflows/    # CI/CD 파이프라인
```

---

## 2. 기술 스택

### 2.1 백엔드 핵심 기술

**언어 및 프레임워크**:
- **Java 17**: 최신 LTS 버전, Record 타입, Pattern Matching 등 모던 Java 기능 사용
- **Spring Boot 3.5**: 최신 Spring 프레임워크
  - Spring Web: RESTful API 개발
  - Spring Data JPA: 데이터베이스 ORM
  - Spring Security: 인증/인가

**데이터베이스**:
- **PostgreSQL 15**: 관계형 데이터베이스
- **PostGIS**: PostgreSQL의 공간 데이터 확장 (위치 기반 기능)

**빌드 도구**:
- **Gradle**: 의존성 관리 및 빌드 자동화

**주요 라이브러리**:
```gradle
// 웹 API 개발
implementation 'org.springframework.boot:spring-boot-starter-web'

// 데이터베이스 (JPA)
implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
runtimeOnly 'org.postgresql:postgresql'

// 공간 데이터 처리
implementation 'org.hibernate.orm:hibernate-spatial'
implementation 'org.locationtech.jts:jts-core:1.19.0'

// 보안
implementation 'org.springframework.boot:spring-boot-starter-security'

// 검증
implementation 'org.springframework.boot:spring-boot-starter-validation'

// 보일러플레이트 코드 제거
compileOnly 'org.projectlombok:lombok'

// API 문서화 (Swagger)
implementation 'org.springdoc:springdoc-openapi-starter-webmvc-ui:2.3.0'

// 테스트
testImplementation 'org.springframework.boot:spring-boot-starter-test'
testImplementation 'org.springframework.restdocs:spring-restdocs-mockmvc'
```

### 2.2 각 기술을 선택한 이유

**Spring Boot를 선택한 이유**:
- 엔터프라이즈급 애플리케이션 개발에 최적화
- 방대한 생태계와 커뮤니티
- 자동 설정으로 빠른 개발 가능
- 실무에서 가장 많이 사용하는 Java 프레임워크

**PostgreSQL + PostGIS를 선택한 이유**:
- 위치 기반 기능이 핵심이므로 공간 데이터 처리 필요
- PostGIS는 지리 데이터 처리에 최적화된 확장
- "위도/경도로부터 반경 N km 내 영화관 찾기" 같은 쿼리를 효율적으로 처리

**Lombok을 선택한 이유**:
- Getter/Setter, Constructor 등 반복 코드 자동 생성
- 코드가 간결해지고 가독성 향상

---

## 3. 프로젝트 구조

### 3.1 디렉토리 구조

```
backend/cine-catch-server/src/main/java/com/project/cinecatch/
├── CineCatchApplication.java          # 애플리케이션 진입점
├── domain/                             # 도메인 계층 (비즈니스 로직)
│   ├── event/                          # 이벤트 도메인
│   │   ├── controller/
│   │   │   └── EventController.java    # 이벤트 API 엔드포인트
│   │   ├── service/
│   │   │   └── EventService.java       # 이벤트 비즈니스 로직
│   │   ├── repository/
│   │   │   ├── EventRepository.java    # 이벤트 데이터 접근
│   │   │   └── EventLocationRepository.java
│   │   ├── entity/
│   │   │   ├── Event.java              # 이벤트 엔티티 (DB 테이블)
│   │   │   └── EventLocation.java
│   │   └── dto/
│   │       ├── EventRequest.java       # 요청 데이터 구조
│   │       └── EventResponse.java      # 응답 데이터 구조
│   │
│   ├── theater/                        # 영화관 도메인
│   │   ├── controller/
│   │   │   └── TheaterController.java
│   │   ├── service/
│   │   │   └── TheaterService.java
│   │   ├── repository/
│   │   │   └── TheaterRepository.java
│   │   ├── entity/
│   │   │   └── Theater.java
│   │   └── dto/
│   │       └── TheaterResponse.java
│   │
│   ├── movie/                          # 영화 도메인
│   │   ├── entity/
│   │   │   └── Movie.java
│   │   ├── repository/
│   │   │   └── MovieRepository.java
│   │   └── dto/
│   │       └── MovieDetailResponse.java
│   │
│   └── member/                         # 회원 도메인
│       ├── entity/
│       │   ├── User.java
│       │   └── TheaterSubscription.java
│       └── dto/
│           ├── MemberRequest.java
│           └── MemberResponse.java
│
└── global/                             # 전역 설정 및 공통 기능
    ├── config/
    │   ├── SecurityConfig.java         # 보안 설정
    │   └── OpenApiConfig.java          # Swagger 설정
    ├── controller/
    │   └── RootController.java         # 루트 엔드포인트
    └── dto/
        └── ApiInfoResponse.java
```

### 3.2 레이어드 아키텍처

이 프로젝트는 전형적인 **레이어드 아키텍처**를 따릅니다:

```
[클라이언트 요청]
      ↓
[Controller Layer] ← API 엔드포인트, HTTP 요청/응답 처리
      ↓
[Service Layer]    ← 비즈니스 로직 (핵심 기능)
      ↓
[Repository Layer] ← 데이터베이스 접근
      ↓
[Database]
```

**각 레이어의 역할**:

1. **Controller**: 클라이언트 요청을 받아 적절한 Service를 호출하고 결과를 반환
2. **Service**: 실제 비즈니스 로직 수행 (트랜잭션 처리)
3. **Repository**: 데이터베이스 CRUD 작업
4. **Entity**: 데이터베이스 테이블과 매핑되는 Java 클래스
5. **DTO**: 계층 간 데이터 전달 객체 (Request/Response)

### 3.3 도메인 주도 설계 (DDD)

프로젝트는 **도메인별로 패키지를 분리**합니다:
- `domain.event`: 이벤트 관련 모든 코드
- `domain.theater`: 영화관 관련 모든 코드
- `domain.movie`: 영화 관련 모든 코드
- `domain.member`: 회원 관련 모든 코드

**장점**:
- 도메인별로 코드가 응집되어 유지보수 용이
- 팀 단위로 도메인을 나눠 개발 가능
- 비즈니스 로직을 쉽게 이해 가능

---

## 4. 데이터베이스 설계

### 4.1 ERD (Entity Relationship Diagram)

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   movies    │         │   events    │         │event_location│
├─────────────┤         ├─────────────┤         ├─────────────┤
│ id (PK)     │◄────────│ movie_id(FK)│         │ event_id(FK)│───────┐
│ title       │         │ id (PK)     │◄────────│ theater_id  │       │
│ release_date│         │ type        │         │ status      │       │
│ image       │         │ title       │         │ updated_at  │       │
│ director    │         │ start_at    │         └─────────────┘       │
│ genre       │         │ end_at      │                               │
└─────────────┘         │ view_count  │                               │
                        └─────────────┘                               │
                                                                      │
┌─────────────┐                                   ┌─────────────┐     │
│   users     │         ┌─────────────────────┐   │  theaters   │. ◄──┘
├─────────────┤         │theater_subscription │   ├─────────────┤
│ id (PK)     │◄────────│ user_id (FK)        │   │ id (PK)     │
│ email       │         │ theater_id (FK)     │───│ brand       │
│ password    │         │ created_at          │   │ name        │
│ nickname    │         └─────────────────────┘   │ address     │
│ fcm_token   │                                   │ location    │
│ location    │                                   └─────────────┘
│ role        │
└─────────────┘
```

### 4.2 테이블 상세 설명

#### movies (영화)
```sql
CREATE TABLE movies (
  id VARCHAR(255) PRIMARY KEY,        -- 영화 고유 ID
  title VARCHAR(255) NOT NULL,        -- 영화 제목
  release_date DATE,                  -- 개봉일
  image VARCHAR(512),                 -- 포스터 이미지 URL
  director VARCHAR(255),              -- 감독
  genre VARCHAR(20),                  -- 장르
  external_code VARCHAR(50),          -- 외부 API 코드 (TMDB 등)
  created_at TIMESTAMP DEFAULT NOW()
);
```

**주요 포인트**:
- `title`에는 UNIQUE 제약이 있어 중복 영화 방지
- `external_code`로 외부 API (TMDB, KOBIS 등)와 연동

#### events (이벤트)
```sql
CREATE TABLE events (
  id VARCHAR(50) PRIMARY KEY,
  movie_id VARCHAR(255) NOT NULL,     -- 어떤 영화의 이벤트인지
  type VARCHAR(20) NOT NULL,          -- GOODS, COUPON, GV
  title VARCHAR(255) NOT NULL,        -- 이벤트 제목
  start_at TIMESTAMP NOT NULL,        -- 시작일시
  end_at TIMESTAMP NOT NULL,          -- 종료일시
  view_count INTEGER DEFAULT 0,       -- 조회수
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (movie_id) REFERENCES movies(id)
);
```

**이벤트 타입**:
- **GOODS**: 굿즈 판매 이벤트 (한정판 피규어, 포스터 등)
- **COUPON**: 쿠폰/할인 이벤트 (조조 할인, 조조 팝콘 등)
- **GV**: Guest Visit (감독/배우 초청 상영회)

#### theaters (영화관)
```sql
CREATE TABLE theaters (
  id VARCHAR(50) PRIMARY KEY,
  brand VARCHAR(20) NOT NULL,         -- CGV, 롯데시네마, 메가박스
  name VARCHAR(50) NOT NULL,          -- 영화관 이름 (CGV 강남)
  address TEXT NOT NULL,              -- 주소
  location GEOMETRY(POINT, 4326)      -- 위도/경도 좌표
);
```

**공간 데이터 (PostGIS)**:
- `GEOMETRY(POINT, 4326)`: WGS84 좌표계의 점 데이터
- 위도/경도를 저장하여 "반경 N km 내 영화관" 검색 가능
- 예: `POINT(127.027619 37.497942)` = 강남역 좌표

#### event_location (이벤트-영화관 관계)
```sql
CREATE TABLE event_location (
  id VARCHAR(255) PRIMARY KEY,
  theater_id VARCHAR(50) NOT NULL,
  event_id VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,        -- AVAILABLE, SOLD_OUT, ENDED
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (theater_id) REFERENCES theaters(id),
  FOREIGN KEY (event_id) REFERENCES events(id),
  UNIQUE(theater_id, event_id)        -- 같은 영화관+이벤트 중복 방지
);
```

**왜 별도 테이블인가?**:
- 하나의 이벤트는 여러 영화관에서 진행될 수 있음
- 각 영화관마다 이벤트 상태가 다름 (한 곳은 품절, 다른 곳은 가능)

#### users (사용자)
```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,     -- 암호화된 비밀번호
  nickname VARCHAR(255) NOT NULL,
  fcm_token VARCHAR(255),             -- Firebase Cloud Messaging 토큰 (푸시 알림)
  location GEOMETRY(POINT, 4326),     -- 사용자 위치
  role VARCHAR(20) NOT NULL,          -- USER, ADMIN
  created_at TIMESTAMP DEFAULT NOW()
);
```

**보안 포인트**:
- 비밀번호는 절대 평문 저장하지 않음 (BCrypt 해싱)
- `fcm_token`: 모바일 푸시 알림용

#### theater_subscription (영화관 구독)
```sql
CREATE TABLE theater_subscription (
  id VARCHAR(255) PRIMARY KEY,
  user_id BIGINT NOT NULL,
  theater_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (theater_id) REFERENCES theaters(id)
);
```

**기능**:
- 사용자가 특정 영화관을 구독하면 새 이벤트 알림 발송

---

## 5. 도메인별 상세 설명

### 5.1 Event 도메인 (이벤트)

#### Entity: Event.java
```java
@Entity
@Table(name = "events")
public class Event {
    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)  // 지연 로딩
    @JoinColumn(name = "movie_id")
    private Movie movie;                 // Movie와 N:1 관계

    @Enumerated(EnumType.STRING)        // Enum을 문자열로 저장
    private EventType type;

    private String title;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private Integer viewCount;

    public enum EventType { GOODS, COUPON, GV }
}
```

**JPA 어노테이션 설명**:
- `@Entity`: 이 클래스가 데이터베이스 테이블과 매핑됨
- `@Table(name = "events")`: 테이블 이름 지정
- `@Id`: 기본 키
- `@ManyToOne`: 다대일 관계 (여러 이벤트가 하나의 영화에 속함)
- `fetch = FetchType.LAZY`: 지연 로딩 (필요할 때만 Movie 조회)

#### Controller: EventController.java
```java
@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    // 1. 모든 이벤트 조회 또는 조건별 검색
    @GetMapping
    public ResponseEntity<List<EventResponse>> getEvents(
        @RequestParam(required = false) Double lat,
        @RequestParam(required = false) Double lng,
        @RequestParam(required = false) Double radius,
        @RequestParam(required = false) String movieTitle
    ) {
        // 조건에 따라 다른 서비스 메서드 호출
        if (movieTitle != null) {
            return eventService.searchByMovieTitle(movieTitle);
        } else if (lat != null && lng != null) {
            return eventService.getNearbyEvents(lat, lng, radius);
        } else {
            return eventService.getAllActiveEvents();
        }
    }

    // 2. 주변 이벤트 조회
    @GetMapping("/nearby")
    public ResponseEntity<List<EventResponse>> getNearbyEvents(
        @RequestParam double lat,
        @RequestParam double lng,
        @RequestParam(required = false) Double radius
    ) {
        return eventService.getNearbyEvents(lat, lng, radius);
    }

    // 3. 이벤트 상세 조회
    @GetMapping("/{eventId}")
    public ResponseEntity<EventResponse> getEventDetail(
        @PathVariable String eventId
    ) {
        return eventService.getEventDetail(eventId);
    }
}
```

**API 설계 원칙**:
- RESTful 설계: 자원(event)과 행위(GET)를 URL로 표현
- `@RequestParam(required = false)`: 선택적 파라미터
- `@PathVariable`: URL 경로의 변수

### 5.2 Theater 도메인 (영화관)

#### Entity: Theater.java
```java
@Entity
@Table(name = "theaters")
public class Theater {
    @Id
    private String id;

    private String brand;               // CGV, 롯데시네마, 메가박스

    @Column(columnDefinition = "geometry(Point, 4326)")
    private Point location;             // PostGIS Point 타입

    private String name;
    private String address;
}
```

**PostGIS Point 타입**:
```java
// Point 객체 생성 예시
GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 4326);
Point point = gf.createPoint(new Coordinate(127.027619, 37.497942));
// 경도, 위도 순서 주의!
```

#### Service: TheaterService.java
```java
@Service
public class TheaterService {

    // 주변 영화관 검색 (공간 쿼리)
    public List<TheaterResponse> getNearbyTheaters(
        double lat,
        double lng,
        Double radius
    ) {
        // 1. 사용자 위치를 Point로 변환
        Point userLocation = createPoint(lng, lat);

        // 2. 반경 내 영화관 검색 (PostGIS 함수 사용)
        double radiusInMeters = (radius != null ? radius : 5.0) * 1000;
        List<Theater> theaters = theaterRepository
            .findNearbyTheaters(userLocation, radiusInMeters);

        // 3. Entity를 Response DTO로 변환
        return theaters.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
}
```

#### Repository: TheaterRepository.java
```java
public interface TheaterRepository extends JpaRepository<Theater, String> {

    // Native Query로 PostGIS 함수 사용
    @Query(value = """
        SELECT * FROM theaters
        WHERE ST_DWithin(
            location::geography,
            :userLocation::geography,
            :radius
        )
        ORDER BY ST_Distance(location::geography, :userLocation::geography)
        """, nativeQuery = true)
    List<Theater> findNearbyTheaters(
        @Param("userLocation") Point userLocation,
        @Param("radius") double radius
    );
}
```

**PostGIS 함수 설명**:
- `ST_DWithin`: 두 점 사이의 거리가 지정한 반경 내인지 확인
- `ST_Distance`: 두 점 사이의 실제 거리 계산
- `::geography`: 지리 타입으로 캐스팅 (구면 좌표계 사용)

### 5.3 Movie 도메인 (영화)

#### Entity: Movie.java
```java
@Entity
@Table(name = "movies")
public class Movie {
    @Id
    private String id;

    @Column(nullable = false, unique = true)
    private String title;

    private LocalDate releaseDate;
    private String image;
    private String director;
    private String genre;
    private String externalCode;       // TMDB, KOBIS API 코드

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist                        // 엔티티 저장 전 실행
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
```

**JPA 라이프사이클 콜백**:
- `@PrePersist`: INSERT 전 실행
- `@PreUpdate`: UPDATE 전 실행
- `@PostLoad`: SELECT 후 실행

### 5.4 Member 도메인 (회원)

#### Entity: User.java
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;           // BCrypt 해싱된 비밀번호

    private String nickname;
    private String fcmToken;           // Firebase Cloud Messaging

    @Column(columnDefinition = "geometry(Point, 4326)")
    private Point location;

    @Enumerated(EnumType.STRING)
    private Role role;

    public enum Role { USER, ADMIN }
}
```

#### Entity: TheaterSubscription.java
```java
@Entity
@Table(name = "theater_subscription")
public class TheaterSubscription {
    @Id
    private String id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "theater_id")
    private Theater theater;

    private LocalDateTime createdAt;
}
```

---

## 6. API 엔드포인트

### 6.1 이벤트 API

#### 1. 이벤트 목록 조회
```http
GET /api/events
```

**쿼리 파라미터**:
- `lat` (옵션): 위도
- `lng` (옵션): 경도
- `radius` (옵션): 반경 (km, 기본값 5km)
- `movieTitle` (옵션): 영화 제목으로 검색

**예시 요청**:
```bash
# 모든 활성 이벤트 조회
curl http://localhost:8080/api/events

# 영화 제목으로 검색
curl "http://localhost:8080/api/events?movieTitle=듄"

# 위치 기반 검색
curl "http://localhost:8080/api/events?lat=37.497942&lng=127.027619&radius=3"
```

**응답 예시**:
```json
[
  {
    "id": "event-001",
    "movieTitle": "듄: 파트 2",
    "eventType": "GOODS",
    "title": "한정판 샌드웜 피규어 증정",
    "startAt": "2024-03-01T00:00:00",
    "endAt": "2024-03-31T23:59:59",
    "viewCount": 1250,
    "locations": [
      {
        "theaterId": "cgv-gangnam",
        "theaterName": "CGV 강남",
        "status": "AVAILABLE"
      }
    ]
  }
]
```

#### 2. 주변 이벤트 조회
```http
GET /api/events/nearby?lat={위도}&lng={경도}&radius={반경}
```

#### 3. 이벤트 상세 조회
```http
GET /api/events/{eventId}
```

### 6.2 영화관 API

#### 1. 영화관 목록 조회
```http
GET /api/theaters
```

**쿼리 파라미터**:
- `brand` (옵션): 브랜드 필터 (CGV, 롯데시네마, 메가박스)

**예시**:
```bash
curl "http://localhost:8080/api/theaters?brand=CGV"
```

#### 2. 주변 영화관 조회
```http
GET /api/theaters/nearby?lat={위도}&lng={경도}&radius={반경}
```

**예시**:
```bash
# 강남역 기준 반경 2km 내 영화관
curl "http://localhost:8080/api/theaters/nearby?lat=37.497942&lng=127.027619&radius=2"
```

#### 3. 영화관 상세 조회
```http
GET /api/theaters/{id}
```

### 6.3 시스템 API

#### 1. 프로젝트 정보
```http
GET /
```

**응답**:
```json
{
  "projectName": "Cine-Catch",
  "version": "0.0.1-SNAPSHOT",
  "description": "영화관 이벤트 및 프로모션 알림 서비스",
  "status": "running"
}
```

#### 2. 헬스 체크
```http
GET /health
```

**응답**: `OK`

### 6.4 Swagger UI

API 문서를 웹 브라우저에서 확인:
```
http://localhost:8080/swagger-ui.html
```

---

## 7. 개발 환경 설정

### 7.1 필수 도구 설치

**1. Java 17 설치**
```bash
# macOS (Homebrew)
brew install openjdk@17

# Ubuntu
sudo apt install openjdk-17-jdk

# 버전 확인
java -version
```

**2. Docker 설치**
- macOS: https://docs.docker.com/desktop/install/mac-install/
- Windows: https://docs.docker.com/desktop/install/windows-install/

**3. IDE 설치 (선택)**
- IntelliJ IDEA (추천): https://www.jetbrains.com/idea/
- VS Code: https://code.visualstudio.com/

### 7.2 프로젝트 클론 및 설정

```bash
# 1. 프로젝트 클론
git clone https://github.com/your-username/cine-catch.git
cd cine-catch

# 2. 데이터베이스 실행 (Docker)
cd infra
docker-compose up -d

# 3. PostgreSQL 확인
docker ps
# cine-catch-db 컨테이너가 실행 중이어야 함

# 4. DB 접속 확인 (선택)
docker exec -it cine-catch-db psql -U postgres -d cine-catch
```

### 7.3 IntelliJ IDEA 설정

**1. 프로젝트 열기**:
- `File > Open` > `cine-catch/backend/cine-catch-server` 선택

**2. Gradle 동기화**:
- 우측 상단 Gradle 아이콘 클릭 또는
- 프롬프트에서 "Load Gradle Project" 클릭

**3. Lombok 플러그인 설치**:
- `Settings > Plugins` > "Lombok" 검색 및 설치
- `Settings > Build > Compiler > Annotation Processors` > "Enable annotation processing" 체크

**4. 실행 설정**:
- `Run > Edit Configurations`
- `+` 버튼 > `Spring Boot`
- Main class: `com.project.cinecatch.CineCatchApplication`

---

## 8. 실행 방법

### 8.1 로컬 개발 환경

**방법 1: IDE에서 실행**
1. IntelliJ에서 `CineCatchApplication.java` 열기
2. `main` 메서드 옆 실행 버튼 클릭
3. 브라우저에서 `http://localhost:8080` 접속

**방법 2: Gradle 명령어**
```bash
cd backend/cine-catch-server

# 빌드
./gradlew build

# 실행
./gradlew bootRun
```

**방법 3: JAR 파일 실행**
```bash
cd backend/cine-catch-server

# JAR 빌드
./gradlew bootJar

# 실행
java -jar build/libs/cine-catch-0.0.1-SNAPSHOT.jar
```

### 8.2 테스트 실행

**전체 테스트**:
```bash
./gradlew test
```

**특정 테스트만**:
```bash
./gradlew test --tests EventServiceTest
```

**테스트 리포트 확인**:
```bash
open build/reports/tests/test/index.html
```

### 8.3 Docker로 실행

**1. Dockerfile 빌드**:
```bash
cd backend/cine-catch-server
docker build -t cine-catch-backend .
```

**2. 컨테이너 실행**:
```bash
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/cine-catch \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=postgres \
  cine-catch-backend
```

---

## 9. CI/CD 파이프라인

### 9.1 GitHub Actions 워크플로우

프로젝트는 GitHub Actions를 사용한 자동화 파이프라인을 갖추고 있습니다.

**워크플로우 파일**: `.github/workflows/backend-ci.yml`

### 9.2 CI 파이프라인 동작 과정

```
1. 코드 푸시/PR 생성
   ↓
2. GitHub Actions 트리거
   ↓
3. PostgreSQL 테스트 DB 생성 (Docker)
   ↓
4. Java 17 환경 설정
   ↓
5. Gradle 의존성 캐싱
   ↓
6. ./gradlew build 실행
   ↓
7. ./gradlew test 실행
   ↓
8. 테스트 결과 확인
   ↓
9. JAR 파일 아티팩트 업로드
```

### 9.3 CI가 하는 일

**1. 자동 테스트**:
- PR을 만들면 자동으로 빌드 및 테스트 실행
- 테스트 실패 시 PR 머지 차단

**2. 코드 품질 검증**:
- 컴파일 에러 확인
- 테스트 통과 여부 확인

**3. 배포 준비**:
- JAR 파일 생성 및 저장
- Docker 이미지 빌드 (CD 설정 시)

### 9.4 실제 작동 예시

```bash
# 1. feature 브랜치에서 개발
git checkout -b feature/add-movie-search

# 2. 코드 작성 후 커밋
git add .
git commit -m "feat: add movie search API"

# 3. GitHub에 푸시
git push origin feature/add-movie-search

# 4. PR 생성
# GitHub에서 Pull Request 생성

# 5. CI 자동 실행
# GitHub Actions 탭에서 진행 상황 확인 가능

# 6. CI 통과 후 머지
# "Merge pull request" 버튼 활성화
```

---

## 10. 학습 포인트

### 10.1 백엔드 개발자가 배워야 할 핵심 개념

이 프로젝트를 통해 다음 개념들을 학습할 수 있습니다:

#### 1. Spring Boot 핵심 기술

**IoC (Inversion of Control) / DI (Dependency Injection)**:
```java
@RestController
public class EventController {
    // Spring이 EventService 객체를 자동 주입
    private final EventService eventService;

    @RequiredArgsConstructor  // Lombok: 생성자 자동 생성
    public EventController(EventService eventService) {
        this.eventService = eventService;
    }
}
```

**왜 중요한가?**:
- 객체 간 결합도 감소
- 테스트 용이성 향상
- 코드 유지보수성 향상

#### 2. JPA/Hibernate

**ORM (Object-Relational Mapping)**:
- SQL을 직접 작성하지 않고 Java 객체로 DB 조작
- `repository.findById(id)` → `SELECT * FROM table WHERE id = ?`

**지연 로딩 (Lazy Loading)**:
```java
@ManyToOne(fetch = FetchType.LAZY)
private Movie movie;

// event.getMovie()를 호출할 때만 Movie를 DB에서 조회
```

**N+1 문제와 해결**:
```java
// 나쁜 예: N+1 쿼리 발생
List<Event> events = eventRepository.findAll();
for (Event event : events) {
    String movieTitle = event.getMovie().getTitle();  // 각각 쿼리 실행
}

// 좋은 예: Join Fetch로 한 번에 조회
@Query("SELECT e FROM Event e JOIN FETCH e.movie")
List<Event> findAllWithMovie();
```

#### 3. RESTful API 설계

**REST 원칙**:
- 자원(Resource)을 URL로 표현
- HTTP 메서드로 행위 표현 (GET, POST, PUT, DELETE)
- 상태를 유지하지 않음 (Stateless)

**좋은 API 설계**:
```
GET    /api/events          # 목록 조회
GET    /api/events/123      # 상세 조회
POST   /api/events          # 생성
PUT    /api/events/123      # 수정
DELETE /api/events/123      # 삭제
```

#### 4. 데이터베이스 설계

**정규화**:
- 중복 데이터 제거
- 테이블을 적절히 분리

**외래 키 (Foreign Key)**:
- 데이터 무결성 보장
- `events.movie_id` → `movies.id` 참조

**인덱스**:
- 조회 성능 향상
- WHERE, JOIN에 사용되는 컬럼에 인덱스 생성

#### 5. 트랜잭션

```java
@Service
public class EventService {

    @Transactional  // 메서드 전체가 하나의 트랜잭션
    public void createEvent(EventRequest request) {
        // 1. 이벤트 저장
        Event event = eventRepository.save(createEvent);

        // 2. 이벤트 위치 저장
        eventLocationRepository.save(location);

        // 둘 다 성공해야 커밋, 하나라도 실패하면 롤백
    }
}
```

#### 6. 공간 데이터 처리 (PostGIS)

**위치 기반 서비스**:
- 위도/경도를 Point 타입으로 저장
- 거리 계산, 반경 검색

**실무 활용**:
- 배달 앱: 주변 음식점 찾기
- 부동산 앱: 역세권 매물 찾기
- 이 프로젝트: 주변 영화관 찾기

### 10.2 실무에서 적용되는 패턴

#### 1. DTO (Data Transfer Object) 패턴

```java
// Entity: 데이터베이스 테이블과 매핑
@Entity
public class Event {
    private String id;
    private Movie movie;
    // ...
}

// Response DTO: API 응답용
public class EventResponse {
    private String id;
    private String movieTitle;  // Movie 객체가 아닌 제목만
    // ...
}
```

**왜 분리하는가?**:
- Entity 변경이 API에 영향을 주지 않음
- 필요한 데이터만 전송 (보안, 성능)
- 순환 참조 방지

#### 2. Repository 패턴

```java
public interface EventRepository extends JpaRepository<Event, String> {
    List<Event> findByMovieTitle(String title);

    @Query("SELECT e FROM Event e WHERE e.startAt <= :now AND e.endAt >= :now")
    List<Event> findActiveEvents(@Param("now") LocalDateTime now);
}
```

**장점**:
- 데이터 접근 로직을 캡슐화
- 비즈니스 로직과 분리

#### 3. Service Layer 패턴

```java
@Service
@Transactional(readOnly = true)  // 읽기 전용 트랜잭션
public class EventService {

    @Transactional  // 쓰기 트랜잭션
    public EventResponse createEvent(EventRequest request) {
        // 비즈니스 로직
    }

    public List<EventResponse> getAllEvents() {
        // 조회 로직
    }
}
```

### 10.3 추천 학습 경로

**1단계: 기초 다지기**
- Java 기본 문법
- 객체지향 프로그래밍 (OOP)
- SQL 기초

**2단계: Spring Boot 입문**
- Spring Boot 공식 가이드 따라하기
- 간단한 CRUD API 만들어보기
- Postman으로 API 테스트

**3단계: 이 프로젝트 분석**
- 각 도메인별로 코드 읽어보기
- Controller → Service → Repository 흐름 이해
- API를 직접 호출해보며 동작 확인

**4단계: 기능 추가해보기**
- 사용자 회원가입/로그인 API 구현
- 이벤트 좋아요 기능 추가
- 영화 검색 API 추가

**5단계: 심화 학습**
- Spring Security로 JWT 인증 구현
- Redis로 캐싱 추가
- Kafka로 이벤트 알림 시스템 구현

### 10.4 디버깅 팁

**1. 로그 활용**:
```java
@Slf4j  // Lombok
@Service
public class EventService {
    public void createEvent() {
        log.info("Creating event: {}", eventTitle);
        log.debug("Event details: {}", event);
        log.error("Failed to create event", exception);
    }
}
```

**2. application.properties 디버그 설정**:
```properties
# SQL 로그 출력
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# 로그 레벨 설정
logging.level.com.project.cinecatch=DEBUG
```

**3. IntelliJ 디버거**:
- 중단점(Breakpoint) 설정: 라인 번호 옆 클릭
- F8: Step Over (다음 라인)
- F7: Step Into (메서드 내부로)
- F9: Resume (다음 중단점까지)

### 10.5 실무 개발 플로우

```
1. 이슈/기능 요청 확인
   ↓
2. 기능 설계 (API 명세, DB 스키마)
   ↓
3. feature 브랜치 생성
   ↓
4. 테스트 코드 작성 (TDD)
   ↓
5. 기능 구현
   ↓
6. 로컬 테스트
   ↓
7. PR 생성
   ↓
8. 코드 리뷰
   ↓
9. CI 통과 확인
   ↓
10. main 브랜치 머지
   ↓
11. 배포
```

---

## 마무리

이 가이드는 **Cine-Catch** 프로젝트를 통해 실무 백엔드 개발을 학습하기 위한 완전한 로드맵입니다.

**다음 단계**:
1. 개발 환경을 설정하고 프로젝트를 실행해보세요
2. Swagger UI에서 API를 직접 호출해보세요
3. 코드를 한 줄씩 읽으며 이해해보세요
4. 간단한 기능을 추가해보세요
5. 막히는 부분은 로그를 보고 디버깅해보세요

**추가 리소스**:
- Spring Boot 공식 문서: https://spring.io/projects/spring-boot
- JPA 가이드: https://spring.io/guides/gs/accessing-data-jpa/
- PostGIS 문서: https://postgis.net/documentation/

백엔드 개발자로의 여정을 응원합니다!
