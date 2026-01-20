data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-2023*-x86_64"]
  }
}

resource "aws_instance" "app_server" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"
  subnet_id     = var.public_subnet_id
  vpc_security_group_ids = [var.security_group_id]

  tags = { Name = "${var.project_name}-app-server" }
}

output "web_server_ip" { value = aws_instance.app_server.public_ip }