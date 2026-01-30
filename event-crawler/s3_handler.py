"""
S3 Handler for Lambda/Local mode switching.
Provides unified interface for file operations that work both locally and in AWS Lambda.
"""

import os
import json
import glob
from datetime import datetime

# Check if running in Lambda environment
IS_LAMBDA = os.getenv("IS_LAMBDA", "false").lower() == "true"

# S3 bucket for crawler data
S3_DATA_BUCKET = os.getenv("S3_DATA_BUCKET", "cine-catch-crawler-data")

# Initialize boto3 only when needed (Lambda environment)
_s3_client = None


def _get_s3_client():
    """Lazy initialization of S3 client."""
    global _s3_client
    if _s3_client is None:
        import boto3
        _s3_client = boto3.client("s3")
    return _s3_client


def _get_base_path():
    """Get the base path for local file storage."""
    return os.path.dirname(os.path.abspath(__file__))


def save_json_to_s3(data: list, prefix: str = "crawler/raw") -> str:
    """
    Save JSON data to S3 or local filesystem.

    Args:
        data: List of data to save as JSON
        prefix: S3 prefix or local subdirectory (default: "crawler/raw")

    Returns:
        S3 key or local file path
    """
    now = datetime.now()
    filename = f"raw_{now.strftime('%Y%m%d_%H%M%S')}.json"

    if IS_LAMBDA:
        # S3 key with date-based hierarchy
        s3_key = f"{prefix}/{now.strftime('%Y/%m/%d')}/{filename}"

        s3_client = _get_s3_client()
        s3_client.put_object(
            Bucket=S3_DATA_BUCKET,
            Key=s3_key,
            Body=json.dumps(data, ensure_ascii=False, indent=4),
            ContentType="application/json"
        )

        # Update latest pointer
        _update_latest_pointer(s3_key)

        print(f"✅ S3 저장 완료: s3://{S3_DATA_BUCKET}/{s3_key}")
        return s3_key
    else:
        # Local file storage
        base_path = _get_base_path()
        data_dir = os.path.join(base_path, "data")
        os.makedirs(data_dir, exist_ok=True)

        filepath = os.path.join(data_dir, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)

        print(f"✅ 로컬 저장 완료: {filepath}")
        return filepath


def _update_latest_pointer(s3_key: str):
    """Update the latest crawl pointer in S3."""
    s3_client = _get_s3_client()
    pointer_data = {
        "latest_key": s3_key,
        "updated_at": datetime.now().isoformat()
    }
    s3_client.put_object(
        Bucket=S3_DATA_BUCKET,
        Key="state/latest_crawl.json",
        Body=json.dumps(pointer_data),
        ContentType="application/json"
    )


def load_latest_json() -> list:
    """
    Load the latest JSON data from S3 or local filesystem.

    Returns:
        List of crawled data
    """
    if IS_LAMBDA:
        s3_client = _get_s3_client()

        try:
            # First, try to get the latest pointer
            response = s3_client.get_object(
                Bucket=S3_DATA_BUCKET,
                Key="state/latest_crawl.json"
            )
            pointer = json.loads(response["Body"].read().decode("utf-8"))
            latest_key = pointer["latest_key"]

            # Load the actual data
            response = s3_client.get_object(
                Bucket=S3_DATA_BUCKET,
                Key=latest_key
            )
            data = json.loads(response["Body"].read().decode("utf-8"))
            print(f"📂 S3에서 최신 데이터 로드: s3://{S3_DATA_BUCKET}/{latest_key}")
            return data

        except s3_client.exceptions.NoSuchKey:
            print("❌ S3에서 최신 크롤링 데이터를 찾을 수 없습니다.")
            return []
        except Exception as e:
            print(f"❌ S3 데이터 로드 실패: {e}")
            return []
    else:
        # Local file loading
        base_path = _get_base_path()
        data_dir = os.path.join(base_path, "data")
        list_of_files = glob.glob(os.path.join(data_dir, "*.json"))

        if not list_of_files:
            print("❌ 처리할 JSON 파일이 'data/' 폴더에 없습니다.")
            return []

        latest_file = max(list_of_files, key=os.path.getctime)
        print(f"📂 최신 데이터 로드 중: {latest_file}")

        with open(latest_file, "r", encoding="utf-8") as f:
            return json.load(f)


def save_log_to_s3(logs: list, prefix: str = "logs") -> str:
    """
    Save log content to S3 or local filesystem.

    Args:
        logs: List of log messages
        prefix: S3 prefix or local subdirectory (default: "logs")

    Returns:
        S3 key or local file path
    """
    now = datetime.now()
    filename = f"update_{now.strftime('%Y%m%d_%H%M%S')}.log"

    if not logs:
        content = f"[{now.strftime('%Y%m%d_%H%M%S')}] 변동 사항 없음 (기존 데이터와 동일)\n"
    else:
        content = "\n".join(logs) + "\n"

    if IS_LAMBDA:
        # S3 key with date-based hierarchy
        s3_key = f"{prefix}/{now.strftime('%Y/%m/%d')}/{filename}"

        s3_client = _get_s3_client()
        s3_client.put_object(
            Bucket=S3_DATA_BUCKET,
            Key=s3_key,
            Body=content.encode("utf-8"),
            ContentType="text/plain; charset=utf-8"
        )

        print(f"📄 S3 로그 저장: s3://{S3_DATA_BUCKET}/{s3_key}")
        return s3_key
    else:
        # Local file storage
        base_path = _get_base_path()
        log_dir = os.path.join(base_path, "logs")
        os.makedirs(log_dir, exist_ok=True)

        filepath = os.path.join(log_dir, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)

        print(f"📄 로그 파일 생성됨: {filepath}")
        return filepath
