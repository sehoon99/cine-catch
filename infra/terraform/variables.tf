variable "db_name" {
  type    = string
  default = "cinecatch"
}

variable "db_password" {
  description = "RDS 루트 비밀번호"
  type        = string
  sensitive   = true # 터미널 로그에 비밀번호가 안 찍히게 함
}

