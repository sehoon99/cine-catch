#!/bin/bash
# EC2 크롤러 배포 스크립트
# 사용법: ./deploy-ec2.sh <EC2_HOST> <SSH_KEY_PATH>
#
# 예시: ./deploy-ec2.sh ec2-user@12.34.56.78 ~/.ssh/my-key.pem

set -e

EC2_HOST="${1:-}"
SSH_KEY="${2:-}"

if [ -z "$EC2_HOST" ] || [ -z "$SSH_KEY" ]; then
    echo "사용법: ./deploy-ec2.sh <EC2_HOST> <SSH_KEY_PATH>"
    echo "예시: ./deploy-ec2.sh ec2-user@12.34.56.78 ~/.ssh/my-key.pem"
    exit 1
fi

REMOTE_DIR="/home/ec2-user/event-crawler"

echo "🚀 EC2 크롤러 배포 시작..."
echo "   대상: ${EC2_HOST}"

# 1. 원격 디렉토리 생성
echo ""
echo "📁 [1/4] 원격 디렉토리 생성..."
ssh -i "$SSH_KEY" "$EC2_HOST" "mkdir -p $REMOTE_DIR"

# 2. 파일 복사
echo ""
echo "📤 [2/4] 파일 복사 중..."
scp -i "$SSH_KEY" \
    crawler.py \
    loader.py \
    main.py \
    movie_info.py \
    movie_image.py \
    s3_handler.py \
    requirements.txt \
    "$EC2_HOST:$REMOTE_DIR/"

# 3. 의존성 설치
echo ""
echo "📦 [3/4] 의존성 설치 중..."
ssh -i "$SSH_KEY" "$EC2_HOST" << 'EOF'
cd /home/ec2-user/event-crawler

# Python 가상환경 생성 (없으면)
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Playwright 브라우저 설치
playwright install chromium
playwright install-deps chromium
EOF

# 4. cron 설정 안내
echo ""
echo "✅ 배포 완료!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 다음 단계: EC2에서 cron 설정"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. EC2에 SSH 접속:"
echo "   ssh -i $SSH_KEY $EC2_HOST"
echo ""
echo "2. .env 파일 생성:"
echo "   nano $REMOTE_DIR/.env"
echo ""
echo "   # 아래 내용 입력:"
echo "   DB_HOST=your-rds-endpoint"
echo "   DB_PORT=5432"
echo "   DB_NAME=cinecatch"
echo "   DB_USER=cinecatch"
echo "   DB_PASSWORD=your-password"
echo "   S3_BUCKET_NAME=cine-catch-image"
echo "   KOBIS_API_KEY=your-key"
echo "   TMDB_API_KEY=your-key"
echo ""
echo "3. cron 설정 (30분마다 실행):"
echo "   crontab -e"
echo ""
echo "   # 아래 줄 추가:"
echo "   */30 * * * * cd $REMOTE_DIR && source venv/bin/activate && python main.py >> logs/cron.log 2>&1"
echo ""
echo "4. 수동 테스트:"
echo "   cd $REMOTE_DIR && source venv/bin/activate && python main.py"
