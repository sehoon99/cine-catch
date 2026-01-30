terraform {
  backend "s3" {
    bucket = "cine-catch-terraform-state"
    key    = "terraform.tfstate"
    region = "ap-northeast-2"
  }
}
