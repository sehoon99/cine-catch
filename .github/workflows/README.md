# GitHub Actions 워크플로우 설정 가이드

## 📋 개요

이 디렉토리는 cine-catch 프로젝트의 CI/CD 파이프라인을 관리합니다.

## 🔧 워크플로우 목록

### 1. Backend CI (`backend-ci.yml`)
- **트리거**: `backend/**` 경로 변경 시 (push/PR)
- **기능**:
  - Java 17 환경 설정
  - Gradle 빌드 및 테스트
  - PostgreSQL 테스트 DB 자동 생성
  - 테스트 결과 리포트 생성
  - JAR 파일 아티팩트 업로드

### 2. Backend CD (`backend-cd.yml`)
- **트리거**: `main` 브랜치에 push 시
- **기능**:
  - Docker 이미지 빌드
  - Docker Hub/ECR에 이미지 푸시
  - 서버 배포 (SSH/ECS/Kubernetes/Cloud Run)

## 🔑 필수 GitHub Secrets 설정

GitHub 저장소 Settings > Secrets and variables > Actions에서 다음 시크릿을 설정하세요:

### CI용 (선택사항)
- `CODECOV_TOKEN`: Codecov 통합 시 필요

### CD용 (필수)

#### Docker Hub 사용 시
```
DOCKER_USERNAME: Docker Hub 사용자명
DOCKER_PASSWORD: Docker Hub 액세스 토큰
```

#### SSH 배포 사용 시
```
SERVER_HOST: 배포 서버 IP 또는 도메인
SERVER_USER: SSH 사용자명
SERVER_SSH_KEY: SSH private key
```

#### AWS ECR/ECS 사용 시
```
AWS_ACCESS_KEY_ID: AWS 액세스 키
AWS_SECRET_ACCESS_KEY: AWS 시크릿 키
```

## 🚀 배포 옵션

`backend-cd.yml`에는 4가지 배포 옵션이 준비되어 있습니다:

1. **SSH 배포** (기본 활성화)
   - Docker Compose를 사용하는 일반 서버에 적합
   - 필요한 Secrets: `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`

2. **AWS ECS 배포** (주석 처리)
   - AWS ECS를 사용하는 경우
   - 필요한 파일: `backend/task-definition.json`

3. **Kubernetes 배포** (주석 처리)
   - K8s 클러스터 사용 시
   - kubectl 설정 필요

4. **Google Cloud Run 배포** (주석 처리)
   - GCP Cloud Run 사용 시
   - GCP 인증 설정 필요

원하는 배포 방식의 주석을 해제하고 사용하세요.

## 📝 사용 방법

### 1. CI 실행
```bash
# PR 생성 시 자동 실행
git checkout -b feature/new-feature
# backend 코드 수정
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
# PR 생성 → CI 자동 실행
```

### 2. CD 실행
```bash
# main 브랜치에 머지 시 자동 배포
git checkout main
git merge feature/new-feature
git push origin main
# → CI + CD 자동 실행
```

### 3. 수동 배포
- GitHub Actions 탭에서 `Backend CD` 워크플로우 선택
- `Run workflow` 버튼 클릭

## 🐳 Docker 이미지 빌드 테스트

로컬에서 Docker 이미지를 테스트하려면:

```bash
cd backend/cine-catch-server

# 이미지 빌드
docker build -t cine-catch-backend:test .

# 컨테이너 실행 (환경변수 설정 필요)
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/cinecatch \
  -e SPRING_DATASOURCE_USERNAME=your_user \
  -e SPRING_DATASOURCE_PASSWORD=your_pass \
  cine-catch-backend:test
```

## 📊 Gradle 캐싱

CI에서는 Gradle 의존성을 자동으로 캐싱하여 빌드 속도를 향상시킵니다.
- 캐시 키: `setup-java` 액션이 자동 관리
- 의존성 변경 시 자동으로 캐시 갱신

## ⚙️ 추가 최적화 옵션

### JaCoCo 코드 커버리지 활성화

`backend/cine-catch-server/build.gradle`에 추가:

```gradle
plugins {
    id 'jacoco'
}

jacoco {
    toolVersion = "0.8.11"
}

test {
    finalizedBy jacocoTestReport
}

jacocoTestReport {
    dependsOn test
    reports {
        xml.required = true
        html.required = true
    }
}
```

### 브랜치 보호 규칙 설정

Settings > Branches > Add rule:
- Branch name pattern: `main`
- ✅ Require status checks to pass before merging
  - ✅ `build` (Backend CI 체크)
- ✅ Require pull request reviews before merging

## 🔍 트러블슈팅

### Gradle 빌드 실패
- `./gradlew build --stacktrace`로 상세 로그 확인
- Java 버전 불일치: CI의 Java 버전과 로컬 버전 확인

### Docker 빌드 실패
- Dockerfile의 경로 확인
- `.dockerignore` 설정 확인

### 배포 실패
- Secrets 설정 확인
- 서버 접근 권한 확인
- Docker Hub/ECR 로그인 상태 확인

## 📚 참고 자료

- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Setup Java Action](https://github.com/actions/setup-java)
