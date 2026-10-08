import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const getArgValue = (name) => {
  const prefix = `${name}=`
  const match = process.argv.slice(2).find((arg) => arg.startsWith(prefix))
  return match ? match.slice(prefix.length) : undefined
}

const getTodayUtc = () => new Date().toISOString().slice(0, 10)

const date = getArgValue('--date') ?? getTodayUtc()
const difficultyArg = getArgValue('--difficulty') ?? 'all'
const keepProgress = getArgValue('--keep-progress') === 'true'
const difficulties = difficultyArg === 'all'
  ? ['easy', 'hard']
  : [difficultyArg]

if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  throw new Error(`Invalid --date value: ${date}. Expected YYYY-MM-DD.`)
}

const invalidDifficulties = difficulties.filter((difficulty) => difficulty !== 'easy' && difficulty !== 'hard')
if (invalidDifficulties.length > 0) {
  throw new Error(`Invalid --difficulty value: ${difficultyArg}. Expected easy, hard, or all.`)
}

const { clearProgressForCaseIds, regenerateDailyCases } = require('../dist/cron.cjs')

const cases = await regenerateDailyCases(date, difficulties)
const clearedProgress = keepProgress
  ? []
  : await clearProgressForCaseIds(cases.map((item) => item.caseId))

console.log(JSON.stringify({ date, cases, clearedProgress }, null, 2))
