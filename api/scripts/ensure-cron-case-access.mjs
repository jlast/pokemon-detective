import { execFileSync } from 'node:child_process'

const functionName = process.argv[2] ?? process.env.CRON_LAMBDA_FUNCTION_NAME
if (!functionName) throw new Error('Provide the cron Lambda function name')

const aws = (...args) => JSON.parse(execFileSync('aws', [...args, '--output', 'json'], {
  encoding: 'utf8',
  env: { ...process.env, AWS_PAGER: '' },
}))

const config = aws('lambda', 'get-function-configuration', '--function-name', functionName,
  '--query', '{Role:Role,Table:Environment.Variables.CASE_DATA_TABLE}')
if (!config.Role || !config.Table) throw new Error('Cron role or case data table is missing')

const roleName = config.Role.split('/').at(-1)
if (!roleName.endsWith('-cron-role')) throw new Error(`Unexpected cron role: ${roleName}`)
const policyName = roleName.replace(/-role$/, '-dynamodb')
const tableArn = aws('dynamodb', 'describe-table', '--table-name', config.Table,
  '--query', 'Table.TableArn')
const { PolicyDocument: policy } = aws('iam', 'get-role-policy', '--role-name', roleName,
  '--policy-name', policyName)

const asArray = (value) => Array.isArray(value) ? value : [value]
const statement = policy.Statement.find((entry) => (
  entry.Effect === 'Allow'
  && asArray(entry.Resource).length === 1
  && asArray(entry.Resource)[0] === tableArn
  && asArray(entry.Action).includes('dynamodb:PutItem')
  && !entry.Condition
))
if (!statement) throw new Error(`Expected case-table write permission missing from ${policyName}`)

if (asArray(statement.Action).includes('dynamodb:GetItem')) {
  console.log(`Cron case-table read access already configured for ${functionName}`)
} else {
  statement.Action = [...asArray(statement.Action), 'dynamodb:GetItem']
  execFileSync('aws', ['iam', 'put-role-policy', '--role-name', roleName,
    '--policy-name', policyName, '--policy-document', JSON.stringify(policy)], {
    stdio: 'inherit',
    env: { ...process.env, AWS_PAGER: '' },
  })
  console.log(`Added cron case-table read access for ${functionName}`)
}
