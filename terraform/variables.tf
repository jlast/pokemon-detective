variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "pokemon-detective"
}

variable "bucket_name" {
  description = "Globally unique S3 bucket name (must be unique across all AWS)"
  type        = string
}

variable "case_data_table_name" {
  description = "DynamoDB table name for daily case data"
  type        = string
  default     = "CaseData"
}

variable "player_progress_table_name" {
  description = "DynamoDB table name for player progress"
  type        = string
  default     = "PlayerProgress"
}

variable "pokedex_table_name" {
  description = "DynamoDB table name for player Pokedex records"
  type        = string
  default     = "Pokedex"
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

variable "domain_name" {
  description = "Apex domain name for the application"
  type        = string
}

variable "primary_domain_name" {
  description = "Canonical domain name for the application"
  type        = string
}

variable "additional_callback_urls" {
  description = "Additional Cognito callback URLs for local development"
  type        = list(string)
  default     = ["http://localhost:5173/callback"]
}

variable "additional_logout_urls" {
  description = "Additional Cognito logout URLs for local development"
  type        = list(string)
  default     = ["http://localhost:5173"]
}

variable "google_client_id" {
  description = "Google OAuth 2.0 Client ID"
  type        = string
  sensitive   = true
}

variable "cron_zip_path" {
  description = "Path to the cron Lambda deployment zip (relative to terraform directory)"
  type        = string
  default     = "../api/dist/cron.zip"
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
