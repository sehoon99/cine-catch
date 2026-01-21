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