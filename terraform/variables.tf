variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "pokemon-detective"
}

variable "bucket_name" {
  description = "Globally unique S3 bucket name (must be unique across all AWS)"
  type        = string
}

variable "dynamodb_table_name" {
  description = "DynamoDB table name for daily puzzle sessions"
  type        = string
  default     = "DailyPuzzleSession"
}

variable "handler_zip_path" {
  description = "Path to the Lambda handler deployment zip (relative to terraform directory)"
  type        = string
  default     = "../api/dist/handler.zip"
}

variable "region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "price_class" {
  description = "CloudFront price class (PriceClass_100, PriceClass_200, PriceClass_All)"
  type        = string
  default     = "PriceClass_100"
}

variable "cognito_domain" {
  description = "Cognito Hosted UI domain prefix (must be globally unique)"
  type        = string
  default     = "pokemon-detective"
}

variable "app_url" {
  description = "Base URL of the application (e.g. https://d123.cloudfront.net)"
  type        = string
}

variable "google_client_id" {
  description = "Google OAuth 2.0 Client ID"
  type        = string
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google OAuth 2.0 Client Secret"
  type        = string
  sensitive   = true
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default = {
    Project   = "pokemon-detective"
    ManagedBy = "terraform"
  }
}
