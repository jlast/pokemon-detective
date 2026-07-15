output "s3_bucket_name" {
  description = "Name of the S3 bucket hosting the site"
  value       = aws_s3_bucket.site.id
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.site.arn
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name (the public URL of your site)"
  value       = aws_cloudfront_distribution.site.domain_name
}

output "api_gateway_url" {
  description = "API Gateway invocation URL (for testing)"
  value       = "${aws_api_gateway_rest_api.api.id}.execute-api.${var.region}.amazonaws.com/prod"
}

output "lambda_function_name" {
  description = "Name of the Lambda function"
  value       = aws_lambda_function.api.function_name
}

output "case_data_table_name" {
  description = "Name of the CaseData DynamoDB table"
  value       = aws_dynamodb_table.case_data.name
}

output "player_progress_table_name" {
  description = "Name of the PlayerProgress DynamoDB table"
  value       = aws_dynamodb_table.player_progress.name
}

output "pokedex_table_name" {
  description = "Name of the Pokedex DynamoDB table"
  value       = aws_dynamodb_table.pokedex.name
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.main.id
}

output "cognito_user_pool_client_id" {
  description = "Cognito User Pool Client ID"
  value       = aws_cognito_user_pool_client.client.id
}

output "cognito_domain" {
  description = "Cognito Hosted UI domain"
  value       = "${aws_cognito_user_pool_domain.main.domain}.auth.${var.region}.amazoncognito.com"
}

