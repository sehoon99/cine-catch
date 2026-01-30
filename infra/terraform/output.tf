# infra/terraform/outputs.tf

output "vpc_id" {
  value = module.vpc.vpc_id
}

output "web_server_ip" {
  value = module.compute.web_server_ip
}

output "db_endpoint" {
  description = "RDS 접속 주소"
  value       = module.storage.db_endpoint
}

output "api_endpoint" {
  value = module.serverless.api_endpoint
}

output "ssh_private_key_path" {
  description = "SSH 접속용 Private Key 경로"
  value       = module.compute.private_key_path
}

output "ssh_command" {
  description = "EC2 SSH 접속 명령어"
  value       = "ssh -i ${module.compute.private_key_path} ec2-user@${module.compute.web_server_ip}"
}

output "frontend_bucket_name" {
  description = "프론트엔드 S3 버킷 이름"
  value       = module.storage.frontend_bucket_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront 배포 ID"
  value       = module.storage.cloudfront_distribution_id
}

output "cloudfront_domain_name" {
  description = "CloudFront 도메인 (웹사이트 URL)"
  value       = "https://${module.storage.cloudfront_domain_name}"
}