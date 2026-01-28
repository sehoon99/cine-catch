# # 보안 그룹 설정
# resource "aws_security_group" "db_sg" {
#   name = "cine-catch-db-sg"
#   # ... 아까 준 보안 그룹 코드 ...
#   # 내 컴퓨터 IP에서 오는 요청만 허용
#   ingress {
#     from_port   = 5432
#     to_port     = 5432
#     protocol    = "tcp"
#     #cidr_blocks = ["${chomp(data.http.my_ip.response_body)}/32"]
#     cidr_blocks = ["0.0.0.0/0"]
#   }
#
#   egress {
#     from_port   = 0
#     to_port     = 0
#     protocol    = "-1"
#     cidr_blocks = ["0.0.0.0/0"]
#   }
# }
#
# # RDS 인스턴스 설정
# resource "aws_db_instance" "cine_catch_db" {
#   allocated_storage    = 20
#   engine               = "postgres"
#   engine_version       = "17.2"
#   instance_class       = "db.t3.micro" # 프리티어 사양
#   db_name              = var.db_name
#   username             = "cinecatch"
#   password             = var.db_password
#   publicly_accessible  = true
#   skip_final_snapshot  = true
#   vpc_security_group_ids = [aws_security_group.db_sg.id]
# }

# 1. VPC 네트워크 구축
module "vpc" {
  source       = "./modules/vpc"
  project_name = var.project_name
  db_password = var.db_password
}

# 2. 보안 그룹 설정
module "security" {
  source       = "./modules/security"
  vpc_id       = module.vpc.vpc_id
  db_password = var.db_password
  project_name = var.project_name
}

# 3. 데이터 저장소 (S3, RDS 등)
module "storage" {
  source            = "./modules/storage"
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = slice(module.vpc.public_subnet_ids, 0, 2)
  private_subnet_ids = module.vpc.private_subnet_ids
  db_password       = var.db_password
  project_name      = var.project_name
}

# 4. 컴퓨팅 (EC2, Lambda 등)
module "compute" {
  source            = "./modules/compute"
  db_password       = var.db_password
  public_subnet_id  = module.vpc.public_subnet_ids[0]
  security_group_id = module.security.web_sg_id
  project_name      = var.project_name
  key_name          = var.key_name
}

module "serverless" {
  source       = "./modules/serverless"
  project_name = var.project_name
  environment  = var.environment
  db_password = var.db_password
}