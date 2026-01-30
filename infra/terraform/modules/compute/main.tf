data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-2023*-x86_64"]
  }
}

# SSH Key Pair 생성
resource "tls_private_key" "ec2_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "ec2_key" {
  key_name   = "${var.project_name}-key"
  public_key = tls_private_key.ec2_key.public_key_openssh
}

# Private Key를 로컬에 저장
resource "local_file" "private_key" {
  content         = tls_private_key.ec2_key.private_key_pem
  filename        = "${path.module}/${var.project_name}-key.pem"
  file_permission = "0400"
}

# IAM Role (EC2가 S3에 접근하기 위함)
resource "aws_iam_role" "ec2_role" {
  name = "${var.project_name}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

# S3 접근 정책
resource "aws_iam_role_policy" "s3_access" {
  name = "s3-deploy-access"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:ListBucket"]
        Resource = [
          "arn:aws:s3:::cine-catch-deploy",
          "arn:aws:s3:::cine-catch-deploy/*"
        ]
      },
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:ListBucket"]
        Resource = [
          "arn:aws:s3:::cine-catch-image",
          "arn:aws:s3:::cine-catch-image/*"
        ]
      }
    ]
  })
}

# Instance Profile
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.project_name}-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

resource "aws_instance" "app_server" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = "t3.small"
  subnet_id              = var.public_subnet_id
  vpc_security_group_ids = [var.security_group_id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name
  key_name               = aws_key_pair.ec2_key.key_name

  tags = { Name = "${var.project_name}-app-server" }
}

# Elastic IP
resource "aws_eip" "app_server" {
  instance = aws_instance.app_server.id
  domain   = "vpc"

  tags = { Name = "${var.project_name}-eip" }
}

output "web_server_ip" { value = aws_eip.app_server.public_ip }
output "private_key_path" { value = local_file.private_key.filename }
output "key_name" { value = aws_key_pair.ec2_key.key_name }