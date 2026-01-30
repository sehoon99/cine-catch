terraform {
    required_providers {
        aws = {
            source  = "hashicorp/aws"
            version = "~> 5.0"
        }
    }

    backend "s3" {
        bucket = "cine-catch-terraform-state"
        key    = "terraform.tfstate"
        region = "ap-northeast-2"
    }
}

provider "aws" {
    region = "ap-northeast-2"
    # profile = "cine-catch"
}
