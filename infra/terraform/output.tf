# 1. DB 접속 주소 (Endpoint)
output "db_endpoint" {
  description = "RDS에 접속할 때 사용하는 주소임~함"
  value       = aws_db_instance.cine_catch_db.endpoint
}

# 2. DB 호스트 주소 (포트 제외)
output "db_host" {
  description = "포트번호 없이 주소만 필요할 때 쓰셈~함"
  value       = aws_db_instance.cine_catch_db.address
}

# 3. DB 포트
output "db_port" {
  description = "포스트그레스 기본 포트임~함"
  value       = aws_db_instance.cine_catch_db.port
}

# 4. 보안 그룹 ID
output "security_group_id" {
  description = "현재 설정된 보안 그룹 ID임~함"
  value       = aws_security_group.db_sg.id
}

# # 5. 접속 가능한 내 IP 확인용
# output "authorized_ip" {
#   description = "현재 이 DB에 접근 허용된 내 공인 IP임~함"
#   value       = chomp(data.http.my_ip.response_body)
# }