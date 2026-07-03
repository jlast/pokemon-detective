import { pokemonData } from '../data/pokemon'
import type { Case } from './caseModel'
import {
  caseTemplates,
  createEvidenceFromTemplate,
  createLocationFromTemplate,
  createSuspectFromPokemonId,
  hiddenTraitMatchers,
  type CaseTemplate,
} from './caseTemplates'

type Rng = () => number

const shuffle = <T,>(items: T[], rng: Rng): T[] => {
  const copy = [...items]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }

  return copy
}

const countMatchingTraits = (template: CaseTemplate, pokemonId: number) => {
  const pokemon = pokemonData.find((entry) => entry.id === pokemonId)

  if (!pokemon) {
    throw new Error(`Pokemon ${pokemonId} not found for template validation.`)
  }

  return template.evidence.filter((evidenceItem) => {
    const matcher = hiddenTraitMatchers[evidenceItem.hiddenTrait]

    if (!matcher) {
      throw new Error(`No matcher defined for hidden trait '${evidenceItem.hiddenTrait}'.`)
    }

    return matcher(pokemon)
  }).length
}

const validateTemplate = (template: CaseTemplate) => {
  if (template.suspectPokemonIds.length !== 6) {
    throw new Error(`Template '${template.id}' must contain exactly 6 suspects.`)
  }

  const culpritMatches = countMatchingTraits(template, template.culpritPokemonId)

  if (culpritMatches < 3) {
    throw new Error(`Template '${template.id}' culprit must strongly fit at least 3 evidence clues.`)
  }

  const fullMatches = template.suspectPokemonIds.filter(
    (pokemonId) => countMatchingTraits(template, pokemonId) >= 3,
  )

  if (fullMatches.filter((pokemonId) => pokemonId === template.culpritPokemonId).length !== 1) {
    throw new Error(`Template '${template.id}' culprit validation failed.`)
  }

  if (fullMatches.length !== 1) {
    throw new Error(`Template '${template.id}' must have exactly 1 strong-fit culprit.`)
  }
}

export const createCaseFromTemplate = (template: CaseTemplate): Case => ({
  id: template.id,
  title: template.title,
  shortStory: template.shortStory,
  crimeIcon: template.crimeIcon,
  difficulty: template.difficulty,
  culpritPokemonId: template.culpritPokemonId,
  maxInvestigations: template.maxInvestigations ?? 3,
  suspects: template.suspectPokemonIds.map(createSuspectFromPokemonId),
  locations: template.locations.map(createLocationFromTemplate),
  evidence: template.evidence.map(createEvidenceFromTemplate),
  status: 'active',
})

export const generateTemplateCase = (rng: Rng = Math.random): Case => {
  const [template] = shuffle(caseTemplates, rng)

  validateTemplate(template)

  return createCaseFromTemplate(template)
}
