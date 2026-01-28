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
variable "public_subnet_id" {
  description = "public_subnet_id"
  type        = string
}

variable "security_group_id" {
  description = "security_group_id"
  type        = string
}

variable "key_name" {
  description = "EC2 Key Pair 이름 (AWS 콘솔에서 미리 생성)"
  type        = string
  default     = ""
}