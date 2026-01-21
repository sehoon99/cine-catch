# infra/terraform/modules/storage/main.tf

# 1. 서브넷 그룹 생성
resource "aws_db_subnet_group" "database" {
  name       = "${var.project_name}-db-subnet-group-v2"
  subnet_ids = var.public_subnet_ids # Root에서 넘겨준 새 VPC의 서브넷 ID들

  tags = { Name = "${var.project_name}-db-subnet-group-v2" }
}

# DB 보안 그룹
resource "aws_security_group" "db_sg" {
  name   = "${var.project_name}-db-sg"
  vpc_id = var.vpc_id # Root에서 받아옴

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # 필요시 본인 IP로 제한
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# RDS 인스턴스
resource "aws_db_instance" "cine_catch_db" {
  allocated_storage      = 20
  engine                 = "postgres"
  engine_version         = "17.2"
  instance_class         = "db.t3.micro"
  db_name                = "cinecatch" # 또는 var.db_name
  username               = "cinecatch"
  password               = var.db_password # Root에서 전달받음
  publicly_accessible    = true
  skip_final_snapshot    = true
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  availability_zone = "ap-northeast-2a"
  db_subnet_group_name   = aws_db_subnet_group.database.name

  tags = {
    Name = "${var.project_name}-db"
  }
}

output "db_endpoint" {
  value = aws_db_instance.cine_catch_db.endpoint
}