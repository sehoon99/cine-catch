variable "db_name" {
  type    = string
  default = "cinecatch"
}

variable "db_password" {
  description = "RDS 루트 비밀번호"
  type        = string
  sensitive   = true # 터미널 로그에 비밀번호가 안 찍히게 함
}

variable "project_name" {
  description = "Project Name"
  type        = string
  default     = "cine-catch"
}

variable "environment" {
  description = "Environment"
  type        = string
  default     = "dev"
}

variable "vpc_id" {}

variable "public_subnet_ids" {}