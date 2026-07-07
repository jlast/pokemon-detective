export type PokemonType =
  | 'bug'
  | 'dark'
  | 'dragon'
  | 'electric'
  | 'fairy'
  | 'fighting'
  | 'fire'
  | 'flying'
  | 'ghost'
  | 'grass'
  | 'ground'
  | 'ice'
  | 'normal'
  | 'poison'
  | 'psychic'
  | 'rock'
  | 'steel'
  | 'water'

export type PokemonRegion = 'Kanto' | 'Johto' | 'Hoenn' | 'Sinnoh'

export interface Pokemon {
  id: number
  name: string
  region: PokemonRegion
  types: PokemonType[]
  heightM: number
  weightKg: number
  evolutionStage: 1 | 2 | 3
  evolutionLineStages: 1 | 2 | 3
  evolvesByStone: boolean
  isStarter: boolean
  isLegendary: boolean
  isMythical: boolean
  sprite: string
  shinySprite?: string
}

export const getShinySpriteUrl = (pokemonId: number): string =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemonId}.png`

export const pokemonData: Pokemon[] = [
  {
    "id": 1,
    "name": "Bulbasaur",
    "region": "Kanto",
    "types": [
      "grass",
      "poison"
    ],
    "heightM": 0.7,
    "weightKg": 6.9,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": true,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
  },
  {
    "id": 2,
    "name": "Ivysaur",
    "region": "Kanto",
    "types": [
      "grass",
      "poison"
    ],
    "heightM": 1,
    "weightKg": 13,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png"
  },
  {
    "id": 3,
    "name": "Venusaur",
    "region": "Kanto",
    "types": [
      "grass",
      "poison"
    ],
    "heightM": 2,
    "weightKg": 100,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png"
  },
  {
    "id": 4,
    "name": "Charmander",
    "region": "Kanto",
    "types": [
      "fire"
    ],
    "heightM": 0.6,
    "weightKg": 8.5,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": true,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png"
  },
  {
    "id": 5,
    "name": "Charmeleon",
    "region": "Kanto",
    "types": [
      "fire"
    ],
    "heightM": 1.1,
    "weightKg": 19,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png"
  },
  {
    "id": 6,
    "name": "Charizard",
    "region": "Kanto",
    "types": [
      "fire",
      "flying"
    ],
    "heightM": 1.7,
    "weightKg": 90.5,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png"
  },
  {
    "id": 7,
    "name": "Squirtle",
    "region": "Kanto",
    "types": [
      "water"
    ],
    "heightM": 0.5,
    "weightKg": 9,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": true,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png"
  },
  {
    "id": 8,
    "name": "Wartortle",
    "region": "Kanto",
    "types": [
      "water"
    ],
    "heightM": 1,
    "weightKg": 22.5,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/8.png"
  },
  {
    "id": 9,
    "name": "Blastoise",
    "region": "Kanto",
    "types": [
      "water"
    ],
    "heightM": 1.6,
    "weightKg": 85.5,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png"
  },
  {
    "id": 10,
    "name": "Caterpie",
    "region": "Kanto",
    "types": [
      "bug"
    ],
    "heightM": 0.3,
    "weightKg": 2.9,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10.png"
  },
  {
    "id": 11,
    "name": "Metapod",
    "region": "Kanto",
    "types": [
      "bug"
    ],
    "heightM": 0.7,
    "weightKg": 9.9,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/11.png"
  },
  {
    "id": 12,
    "name": "Butterfree",
    "region": "Kanto",
    "types": [
      "bug",
      "flying"
    ],
    "heightM": 1.1,
    "weightKg": 32,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/12.png"
  },
  {
    "id": 13,
    "name": "Weedle",
    "region": "Kanto",
    "types": [
      "bug",
      "poison"
    ],
    "heightM": 0.3,
    "weightKg": 3.2,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/13.png"
  },
  {
    "id": 14,
    "name": "Kakuna",
    "region": "Kanto",
    "types": [
      "bug",
      "poison"
    ],
    "heightM": 0.6,
    "weightKg": 10,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/14.png"
  },
  {
    "id": 15,
    "name": "Beedrill",
    "region": "Kanto",
    "types": [
      "bug",
      "poison"
    ],
    "heightM": 1,
    "weightKg": 29.5,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/15.png"
  },
  {
    "id": 16,
    "name": "Pidgey",
    "region": "Kanto",
    "types": [
      "normal",
      "flying"
    ],
    "heightM": 0.3,
    "weightKg": 1.8,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png"
  },
  {
    "id": 17,
    "name": "Pidgeotto",
    "region": "Kanto",
    "types": [
      "normal",
      "flying"
    ],
    "heightM": 1.1,
    "weightKg": 30,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/17.png"
  },
  {
    "id": 18,
    "name": "Pidgeot",
    "region": "Kanto",
    "types": [
      "normal",
      "flying"
    ],
    "heightM": 1.5,
    "weightKg": 39.5,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/18.png"
  },
  {
    "id": 19,
    "name": "Rattata",
    "region": "Kanto",
    "types": [
      "normal"
    ],
    "heightM": 0.3,
    "weightKg": 3.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/19.png"
  },
  {
    "id": 20,
    "name": "Raticate",
    "region": "Kanto",
    "types": [
      "normal"
    ],
    "heightM": 0.7,
    "weightKg": 18.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/20.png"
  },
  {
    "id": 21,
    "name": "Spearow",
    "region": "Kanto",
    "types": [
      "normal",
      "flying"
    ],
    "heightM": 0.3,
    "weightKg": 2,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/21.png"
  },
  {
    "id": 22,
    "name": "Fearow",
    "region": "Kanto",
    "types": [
      "normal",
      "flying"
    ],
    "heightM": 1.2,
    "weightKg": 38,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/22.png"
  },
  {
    "id": 23,
    "name": "Ekans",
    "region": "Kanto",
    "types": [
      "poison"
    ],
    "heightM": 2,
    "weightKg": 6.9,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/23.png"
  },
  {
    "id": 24,
    "name": "Arbok",
    "region": "Kanto",
    "types": [
      "poison"
    ],
    "heightM": 3.5,
    "weightKg": 65,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/24.png"
  },
  {
    "id": 25,
    "name": "Pikachu",
    "region": "Kanto",
    "types": [
      "electric"
    ],
    "heightM": 0.4,
    "weightKg": 6,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": true,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
  },
  {
    "id": 26,
    "name": "Raichu",
    "region": "Kanto",
    "types": [
      "electric"
    ],
    "heightM": 0.8,
    "weightKg": 30,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/26.png"
  },
  {
    "id": 27,
    "name": "Sandshrew",
    "region": "Kanto",
    "types": [
      "ground"
    ],
    "heightM": 0.6,
    "weightKg": 12,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": true,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/27.png"
  },
  {
    "id": 28,
    "name": "Sandslash",
    "region": "Kanto",
    "types": [
      "ground"
    ],
    "heightM": 1,
    "weightKg": 29.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/28.png"
  },
  {
    "id": 29,
    "name": "Nidoran F",
    "region": "Kanto",
    "types": [
      "poison"
    ],
    "heightM": 0.4,
    "weightKg": 7,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/29.png"
  },
  {
    "id": 30,
    "name": "Nidorina",
    "region": "Kanto",
    "types": [
      "poison"
    ],
    "heightM": 0.8,
    "weightKg": 20,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": true,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/30.png"
  },
  {
    "id": 31,
    "name": "Nidoqueen",
    "region": "Kanto",
    "types": [
      "poison",
      "ground"
    ],
    "heightM": 1.3,
    "weightKg": 60,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/31.png"
  },
  {
    "id": 32,
    "name": "Nidoran M",
    "region": "Kanto",
    "types": [
      "poison"
    ],
    "heightM": 0.5,
    "weightKg": 9,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/32.png"
  },
  {
    "id": 33,
    "name": "Nidorino",
    "region": "Kanto",
    "types": [
      "poison"
    ],
    "heightM": 0.9,
    "weightKg": 19.5,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": true,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/33.png"
  },
  {
    "id": 34,
    "name": "Nidoking",
    "region": "Kanto",
    "types": [
      "poison",
      "ground"
    ],
    "heightM": 1.4,
    "weightKg": 62,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/34.png"
  },
  {
    "id": 35,
    "name": "Clefairy",
    "region": "Kanto",
    "types": [
      "fairy"
    ],
    "heightM": 0.6,
    "weightKg": 7.5,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": true,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/35.png"
  },
  {
    "id": 36,
    "name": "Clefable",
    "region": "Kanto",
    "types": [
      "fairy"
    ],
    "heightM": 1.3,
    "weightKg": 40,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/36.png"
  },
  {
    "id": 37,
    "name": "Vulpix",
    "region": "Kanto",
    "types": [
      "fire"
    ],
    "heightM": 0.6,
    "weightKg": 9.9,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": true,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/37.png"
  },
  {
    "id": 38,
    "name": "Ninetales",
    "region": "Kanto",
    "types": [
      "fire"
    ],
    "heightM": 1.1,
    "weightKg": 19.9,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/38.png"
  },
  {
    "id": 39,
    "name": "Jigglypuff",
    "region": "Kanto",
    "types": [
      "normal",
      "fairy"
    ],
    "heightM": 0.5,
    "weightKg": 5.5,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": true,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png"
  },
  {
    "id": 40,
    "name": "Wigglytuff",
    "region": "Kanto",
    "types": [
      "normal",
      "fairy"
    ],
    "heightM": 1,
    "weightKg": 12,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/40.png"
  },
  {
    "id": 41,
    "name": "Zubat",
    "region": "Kanto",
    "types": [
      "poison",
      "flying"
    ],
    "heightM": 0.8,
    "weightKg": 7.5,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/41.png"
  },
  {
    "id": 42,
    "name": "Golbat",
    "region": "Kanto",
    "types": [
      "poison",
      "flying"
    ],
    "heightM": 1.6,
    "weightKg": 55,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/42.png"
  },
  {
    "id": 43,
    "name": "Oddish",
    "region": "Kanto",
    "types": [
      "grass",
      "poison"
    ],
    "heightM": 0.5,
    "weightKg": 5.4,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/43.png"
  },
  {
    "id": 44,
    "name": "Gloom",
    "region": "Kanto",
    "types": [
      "grass",
      "poison"
    ],
    "heightM": 0.8,
    "weightKg": 8.6,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": true,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/44.png"
  },
  {
    "id": 45,
    "name": "Vileplume",
    "region": "Kanto",
    "types": [
      "grass",
      "poison"
    ],
    "heightM": 1.2,
    "weightKg": 18.6,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/45.png"
  },
  {
    "id": 46,
    "name": "Paras",
    "region": "Kanto",
    "types": [
      "bug",
      "grass"
    ],
    "heightM": 0.3,
    "weightKg": 5.4,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/46.png"
  },
  {
    "id": 47,
    "name": "Parasect",
    "region": "Kanto",
    "types": [
      "bug",
      "grass"
    ],
    "heightM": 1,
    "weightKg": 29.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/47.png"
  },
  {
    "id": 48,
    "name": "Venonat",
    "region": "Kanto",
    "types": [
      "bug",
      "poison"
    ],
    "heightM": 1,
    "weightKg": 30,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/48.png"
  },
  {
    "id": 49,
    "name": "Venomoth",
    "region": "Kanto",
    "types": [
      "bug",
      "poison"
    ],
    "heightM": 1.5,
    "weightKg": 12.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/49.png"
  },
  {
    "id": 50,
    "name": "Diglett",
    "region": "Kanto",
    "types": [
      "ground"
    ],
    "heightM": 0.2,
    "weightKg": 0.8,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/50.png"
  },
  {
    "id": 51,
    "name": "Dugtrio",
    "region": "Kanto",
    "types": [
      "ground"
    ],
    "heightM": 0.7,
    "weightKg": 33.3,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/51.png"
  },
  {
    "id": 52,
    "name": "Meowth",
    "region": "Kanto",
    "types": [
      "normal"
    ],
    "heightM": 0.4,
    "weightKg": 4.2,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png"
  },
  {
    "id": 53,
    "name": "Persian",
    "region": "Kanto",
    "types": [
      "normal"
    ],
    "heightM": 1,
    "weightKg": 32,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/53.png"
  },
  {
    "id": 54,
    "name": "Psyduck",
    "region": "Kanto",
    "types": [
      "water"
    ],
    "heightM": 0.8,
    "weightKg": 19.6,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/54.png"
  },
  {
    "id": 55,
    "name": "Golduck",
    "region": "Kanto",
    "types": [
      "water"
    ],
    "heightM": 1.7,
    "weightKg": 76.6,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/55.png"
  },
  {
    "id": 56,
    "name": "Mankey",
    "region": "Kanto",
    "types": [
      "fighting"
    ],
    "heightM": 0.5,
    "weightKg": 28,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/56.png"
  },
  {
    "id": 57,
    "name": "Primeape",
    "region": "Kanto",
    "types": [
      "fighting"
    ],
    "heightM": 1,
    "weightKg": 32,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/57.png"
  },
  {
    "id": 58,
    "name": "Growlithe",
    "region": "Kanto",
    "types": [
      "fire"
    ],
    "heightM": 0.7,
    "weightKg": 19,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": true,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/58.png"
  },
  {
    "id": 59,
    "name": "Arcanine",
    "region": "Kanto",
    "types": [
      "fire"
    ],
    "heightM": 1.9,
    "weightKg": 155,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/59.png"
  },
  {
    "id": 60,
    "name": "Poliwag",
    "region": "Kanto",
    "types": [
      "water"
    ],
    "heightM": 0.6,
    "weightKg": 12.4,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/60.png"
  },
  {
    "id": 61,
    "name": "Poliwhirl",
    "region": "Kanto",
    "types": [
      "water"
    ],
    "heightM": 1,
    "weightKg": 20,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": true,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/61.png"
  },
  {
    "id": 62,
    "name": "Poliwrath",
    "region": "Kanto",
    "types": [
      "water",
      "fighting"
    ],
    "heightM": 1.3,
    "weightKg": 54,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/62.png"
  },
  {
    "id": 63,
    "name": "Abra",
    "region": "Kanto",
    "types": [
      "psychic"
    ],
    "heightM": 0.9,
    "weightKg": 19.5,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/63.png"
  },
  {
    "id": 64,
    "name": "Kadabra",
    "region": "Kanto",
    "types": [
      "psychic"
    ],
    "heightM": 1.3,
    "weightKg": 56.5,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/64.png"
  },
  {
    "id": 65,
    "name": "Alakazam",
    "region": "Kanto",
    "types": [
      "psychic"
    ],
    "heightM": 1.5,
    "weightKg": 48,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/65.png"
  },
  {
    "id": 66,
    "name": "Machop",
    "region": "Kanto",
    "types": [
      "fighting"
    ],
    "heightM": 0.8,
    "weightKg": 19.5,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/66.png"
  },
  {
    "id": 67,
    "name": "Machoke",
    "region": "Kanto",
    "types": [
      "fighting"
    ],
    "heightM": 1.5,
    "weightKg": 70.5,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/67.png"
  },
  {
    "id": 68,
    "name": "Machamp",
    "region": "Kanto",
    "types": [
      "fighting"
    ],
    "heightM": 1.6,
    "weightKg": 130,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/68.png"
  },
  {
    "id": 69,
    "name": "Bellsprout",
    "region": "Kanto",
    "types": [
      "grass",
      "poison"
    ],
    "heightM": 0.7,
    "weightKg": 4,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/69.png"
  },
  {
    "id": 70,
    "name": "Weepinbell",
    "region": "Kanto",
    "types": [
      "grass",
      "poison"
    ],
    "heightM": 1,
    "weightKg": 6.4,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": true,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/70.png"
  },
  {
    "id": 71,
    "name": "Victreebel",
    "region": "Kanto",
    "types": [
      "grass",
      "poison"
    ],
    "heightM": 1.7,
    "weightKg": 15.5,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/71.png"
  },
  {
    "id": 72,
    "name": "Tentacool",
    "region": "Kanto",
    "types": [
      "water",
      "poison"
    ],
    "heightM": 0.9,
    "weightKg": 45.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/72.png"
  },
  {
    "id": 73,
    "name": "Tentacruel",
    "region": "Kanto",
    "types": [
      "water",
      "poison"
    ],
    "heightM": 1.6,
    "weightKg": 55,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/73.png"
  },
  {
    "id": 74,
    "name": "Geodude",
    "region": "Kanto",
    "types": [
      "rock",
      "ground"
    ],
    "heightM": 0.4,
    "weightKg": 20,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/74.png"
  },
  {
    "id": 75,
    "name": "Graveler",
    "region": "Kanto",
    "types": [
      "rock",
      "ground"
    ],
    "heightM": 1,
    "weightKg": 105,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/75.png"
  },
  {
    "id": 76,
    "name": "Golem",
    "region": "Kanto",
    "types": [
      "rock",
      "ground"
    ],
    "heightM": 1.4,
    "weightKg": 300,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/76.png"
  },
  {
    "id": 77,
    "name": "Ponyta",
    "region": "Kanto",
    "types": [
      "fire"
    ],
    "heightM": 1,
    "weightKg": 30,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/77.png"
  },
  {
    "id": 78,
    "name": "Rapidash",
    "region": "Kanto",
    "types": [
      "fire"
    ],
    "heightM": 1.7,
    "weightKg": 95,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/78.png"
  },
  {
    "id": 79,
    "name": "Slowpoke",
    "region": "Kanto",
    "types": [
      "water",
      "psychic"
    ],
    "heightM": 1.2,
    "weightKg": 36,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/79.png"
  },
  {
    "id": 80,
    "name": "Slowbro",
    "region": "Kanto",
    "types": [
      "water",
      "psychic"
    ],
    "heightM": 1.6,
    "weightKg": 78.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/80.png"
  },
  {
    "id": 81,
    "name": "Magnemite",
    "region": "Kanto",
    "types": [
      "electric",
      "steel"
    ],
    "heightM": 0.3,
    "weightKg": 6,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/81.png"
  },
  {
    "id": 82,
    "name": "Magneton",
    "region": "Kanto",
    "types": [
      "electric",
      "steel"
    ],
    "heightM": 1,
    "weightKg": 60,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": true,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/82.png"
  },
  {
    "id": 83,
    "name": "Farfetchd",
    "region": "Kanto",
    "types": [
      "normal",
      "flying"
    ],
    "heightM": 0.8,
    "weightKg": 15,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/83.png"
  },
  {
    "id": 84,
    "name": "Doduo",
    "region": "Kanto",
    "types": [
      "normal",
      "flying"
    ],
    "heightM": 1.4,
    "weightKg": 39.2,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/84.png"
  },
  {
    "id": 85,
    "name": "Dodrio",
    "region": "Kanto",
    "types": [
      "normal",
      "flying"
    ],
    "heightM": 1.8,
    "weightKg": 85.2,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/85.png"
  },
  {
    "id": 86,
    "name": "Seel",
    "region": "Kanto",
    "types": [
      "water"
    ],
    "heightM": 1.1,
    "weightKg": 90,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/86.png"
  },
  {
    "id": 87,
    "name": "Dewgong",
    "region": "Kanto",
    "types": [
      "water",
      "ice"
    ],
    "heightM": 1.7,
    "weightKg": 120,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/87.png"
  },
  {
    "id": 88,
    "name": "Grimer",
    "region": "Kanto",
    "types": [
      "poison"
    ],
    "heightM": 0.9,
    "weightKg": 30,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/88.png"
  },
  {
    "id": 89,
    "name": "Muk",
    "region": "Kanto",
    "types": [
      "poison"
    ],
    "heightM": 1.2,
    "weightKg": 30,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/89.png"
  },
  {
    "id": 90,
    "name": "Shellder",
    "region": "Kanto",
    "types": [
      "water"
    ],
    "heightM": 0.3,
    "weightKg": 4,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": true,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/90.png"
  },
  {
    "id": 91,
    "name": "Cloyster",
    "region": "Kanto",
    "types": [
      "water",
      "ice"
    ],
    "heightM": 1.5,
    "weightKg": 132.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/91.png"
  },
  {
    "id": 92,
    "name": "Gastly",
    "region": "Kanto",
    "types": [
      "ghost",
      "poison"
    ],
    "heightM": 1.3,
    "weightKg": 0.1,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/92.png"
  },
  {
    "id": 93,
    "name": "Haunter",
    "region": "Kanto",
    "types": [
      "ghost",
      "poison"
    ],
    "heightM": 1.6,
    "weightKg": 0.1,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/93.png"
  },
  {
    "id": 94,
    "name": "Gengar",
    "region": "Kanto",
    "types": [
      "ghost",
      "poison"
    ],
    "heightM": 1.5,
    "weightKg": 40.5,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png"
  },
  {
    "id": 95,
    "name": "Onix",
    "region": "Kanto",
    "types": [
      "rock",
      "ground"
    ],
    "heightM": 8.8,
    "weightKg": 210,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/95.png"
  },
  {
    "id": 96,
    "name": "Drowzee",
    "region": "Kanto",
    "types": [
      "psychic"
    ],
    "heightM": 1,
    "weightKg": 32.4,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/96.png"
  },
  {
    "id": 97,
    "name": "Hypno",
    "region": "Kanto",
    "types": [
      "psychic"
    ],
    "heightM": 1.6,
    "weightKg": 75.6,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/97.png"
  },
  {
    "id": 98,
    "name": "Krabby",
    "region": "Kanto",
    "types": [
      "water"
    ],
    "heightM": 0.4,
    "weightKg": 6.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/98.png"
  },
  {
    "id": 99,
    "name": "Kingler",
    "region": "Kanto",
    "types": [
      "water"
    ],
    "heightM": 1.3,
    "weightKg": 60,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/99.png"
  },
  {
    "id": 100,
    "name": "Voltorb",
    "region": "Kanto",
    "types": [
      "electric"
    ],
    "heightM": 0.5,
    "weightKg": 10.4,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": true,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/100.png"
  },
  {
    "id": 101,
    "name": "Electrode",
    "region": "Kanto",
    "types": [
      "electric"
    ],
    "heightM": 1.2,
    "weightKg": 66.6,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/101.png"
  },
  {
    "id": 102,
    "name": "Exeggcute",
    "region": "Kanto",
    "types": [
      "grass",
      "psychic"
    ],
    "heightM": 0.4,
    "weightKg": 2.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": true,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/102.png"
  },
  {
    "id": 103,
    "name": "Exeggutor",
    "region": "Kanto",
    "types": [
      "grass",
      "psychic"
    ],
    "heightM": 2,
    "weightKg": 120,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/103.png"
  },
  {
    "id": 104,
    "name": "Cubone",
    "region": "Kanto",
    "types": [
      "ground"
    ],
    "heightM": 0.4,
    "weightKg": 6.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/104.png"
  },
  {
    "id": 105,
    "name": "Marowak",
    "region": "Kanto",
    "types": [
      "ground"
    ],
    "heightM": 1,
    "weightKg": 45,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/105.png"
  },
  {
    "id": 106,
    "name": "Hitmonlee",
    "region": "Kanto",
    "types": [
      "fighting"
    ],
    "heightM": 1.5,
    "weightKg": 49.8,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/106.png"
  },
  {
    "id": 107,
    "name": "Hitmonchan",
    "region": "Kanto",
    "types": [
      "fighting"
    ],
    "heightM": 1.4,
    "weightKg": 50.2,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/107.png"
  },
  {
    "id": 108,
    "name": "Lickitung",
    "region": "Kanto",
    "types": [
      "normal"
    ],
    "heightM": 1.2,
    "weightKg": 65.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/108.png"
  },
  {
    "id": 109,
    "name": "Koffing",
    "region": "Kanto",
    "types": [
      "poison"
    ],
    "heightM": 0.6,
    "weightKg": 1,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/109.png"
  },
  {
    "id": 110,
    "name": "Weezing",
    "region": "Kanto",
    "types": [
      "poison"
    ],
    "heightM": 1.2,
    "weightKg": 9.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/110.png"
  },
  {
    "id": 111,
    "name": "Rhyhorn",
    "region": "Kanto",
    "types": [
      "ground",
      "rock"
    ],
    "heightM": 1,
    "weightKg": 115,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/111.png"
  },
  {
    "id": 112,
    "name": "Rhydon",
    "region": "Kanto",
    "types": [
      "ground",
      "rock"
    ],
    "heightM": 1.9,
    "weightKg": 120,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/112.png"
  },
  {
    "id": 113,
    "name": "Chansey",
    "region": "Kanto",
    "types": [
      "normal"
    ],
    "heightM": 1.1,
    "weightKg": 34.6,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/113.png"
  },
  {
    "id": 114,
    "name": "Tangela",
    "region": "Kanto",
    "types": [
      "grass"
    ],
    "heightM": 1,
    "weightKg": 35,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/114.png"
  },
  {
    "id": 115,
    "name": "Kangaskhan",
    "region": "Kanto",
    "types": [
      "normal"
    ],
    "heightM": 2.2,
    "weightKg": 80,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/115.png"
  },
  {
    "id": 116,
    "name": "Horsea",
    "region": "Kanto",
    "types": [
      "water"
    ],
    "heightM": 0.4,
    "weightKg": 8,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/116.png"
  },
  {
    "id": 117,
    "name": "Seadra",
    "region": "Kanto",
    "types": [
      "water"
    ],
    "heightM": 1.2,
    "weightKg": 25,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/117.png"
  },
  {
    "id": 118,
    "name": "Goldeen",
    "region": "Kanto",
    "types": [
      "water"
    ],
    "heightM": 0.6,
    "weightKg": 15,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/118.png"
  },
  {
    "id": 119,
    "name": "Seaking",
    "region": "Kanto",
    "types": [
      "water"
    ],
    "heightM": 1.3,
    "weightKg": 39,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/119.png"
  },
  {
    "id": 120,
    "name": "Staryu",
    "region": "Kanto",
    "types": [
      "water"
    ],
    "heightM": 0.8,
    "weightKg": 34.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": true,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/120.png"
  },
  {
    "id": 121,
    "name": "Starmie",
    "region": "Kanto",
    "types": [
      "water",
      "psychic"
    ],
    "heightM": 1.1,
    "weightKg": 80,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/121.png"
  },
  {
    "id": 122,
    "name": "Mr Mime",
    "region": "Kanto",
    "types": [
      "psychic",
      "fairy"
    ],
    "heightM": 1.3,
    "weightKg": 54.5,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/122.png"
  },
  {
    "id": 123,
    "name": "Scyther",
    "region": "Kanto",
    "types": [
      "bug",
      "flying"
    ],
    "heightM": 1.5,
    "weightKg": 56,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/123.png"
  },
  {
    "id": 124,
    "name": "Jynx",
    "region": "Kanto",
    "types": [
      "ice",
      "psychic"
    ],
    "heightM": 1.4,
    "weightKg": 40.6,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/124.png"
  },
  {
    "id": 125,
    "name": "Electabuzz",
    "region": "Kanto",
    "types": [
      "electric"
    ],
    "heightM": 1.1,
    "weightKg": 30,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/125.png"
  },
  {
    "id": 126,
    "name": "Magmar",
    "region": "Kanto",
    "types": [
      "fire"
    ],
    "heightM": 1.3,
    "weightKg": 44.5,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/126.png"
  },
  {
    "id": 127,
    "name": "Pinsir",
    "region": "Kanto",
    "types": [
      "bug"
    ],
    "heightM": 1.5,
    "weightKg": 55,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/127.png"
  },
  {
    "id": 128,
    "name": "Tauros",
    "region": "Kanto",
    "types": [
      "normal"
    ],
    "heightM": 1.4,
    "weightKg": 88.4,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/128.png"
  },
  {
    "id": 129,
    "name": "Magikarp",
    "region": "Kanto",
    "types": [
      "water"
    ],
    "heightM": 0.9,
    "weightKg": 10,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/129.png"
  },
  {
    "id": 130,
    "name": "Gyarados",
    "region": "Kanto",
    "types": [
      "water",
      "flying"
    ],
    "heightM": 6.5,
    "weightKg": 235,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png"
  },
  {
    "id": 131,
    "name": "Lapras",
    "region": "Kanto",
    "types": [
      "water",
      "ice"
    ],
    "heightM": 2.5,
    "weightKg": 220,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/131.png"
  },
  {
    "id": 132,
    "name": "Ditto",
    "region": "Kanto",
    "types": [
      "normal"
    ],
    "heightM": 0.3,
    "weightKg": 4,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png"
  },
  {
    "id": 133,
    "name": "Eevee",
    "region": "Kanto",
    "types": [
      "normal"
    ],
    "heightM": 0.3,
    "weightKg": 6.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": true,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png"
  },
  {
    "id": 134,
    "name": "Vaporeon",
    "region": "Kanto",
    "types": [
      "water"
    ],
    "heightM": 1,
    "weightKg": 29,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/134.png"
  },
  {
    "id": 135,
    "name": "Jolteon",
    "region": "Kanto",
    "types": [
      "electric"
    ],
    "heightM": 0.8,
    "weightKg": 24.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/135.png"
  },
  {
    "id": 136,
    "name": "Flareon",
    "region": "Kanto",
    "types": [
      "fire"
    ],
    "heightM": 0.9,
    "weightKg": 25,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/136.png"
  },
  {
    "id": 137,
    "name": "Porygon",
    "region": "Kanto",
    "types": [
      "normal"
    ],
    "heightM": 0.8,
    "weightKg": 36.5,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/137.png"
  },
  {
    "id": 138,
    "name": "Omanyte",
    "region": "Kanto",
    "types": [
      "rock",
      "water"
    ],
    "heightM": 0.4,
    "weightKg": 7.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/138.png"
  },
  {
    "id": 139,
    "name": "Omastar",
    "region": "Kanto",
    "types": [
      "rock",
      "water"
    ],
    "heightM": 1,
    "weightKg": 35,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/139.png"
  },
  {
    "id": 140,
    "name": "Kabuto",
    "region": "Kanto",
    "types": [
      "rock",
      "water"
    ],
    "heightM": 0.5,
    "weightKg": 11.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/140.png"
  },
  {
    "id": 141,
    "name": "Kabutops",
    "region": "Kanto",
    "types": [
      "rock",
      "water"
    ],
    "heightM": 1.3,
    "weightKg": 40.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/141.png"
  },
  {
    "id": 142,
    "name": "Aerodactyl",
    "region": "Kanto",
    "types": [
      "rock",
      "flying"
    ],
    "heightM": 1.8,
    "weightKg": 59,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/142.png"
  },
  {
    "id": 143,
    "name": "Snorlax",
    "region": "Kanto",
    "types": [
      "normal"
    ],
    "heightM": 2.1,
    "weightKg": 460,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png"
  },
  {
    "id": 144,
    "name": "Articuno",
    "region": "Kanto",
    "types": [
      "ice",
      "flying"
    ],
    "heightM": 1.7,
    "weightKg": 55.4,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": true,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/144.png"
  },
  {
    "id": 145,
    "name": "Zapdos",
    "region": "Kanto",
    "types": [
      "electric",
      "flying"
    ],
    "heightM": 1.6,
    "weightKg": 52.6,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": true,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/145.png"
  },
  {
    "id": 146,
    "name": "Moltres",
    "region": "Kanto",
    "types": [
      "fire",
      "flying"
    ],
    "heightM": 2,
    "weightKg": 60,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": true,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/146.png"
  },
  {
    "id": 147,
    "name": "Dratini",
    "region": "Kanto",
    "types": [
      "dragon"
    ],
    "heightM": 1.8,
    "weightKg": 3.3,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/147.png"
  },
  {
    "id": 148,
    "name": "Dragonair",
    "region": "Kanto",
    "types": [
      "dragon"
    ],
    "heightM": 4,
    "weightKg": 16.5,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/148.png"
  },
  {
    "id": 149,
    "name": "Dragonite",
    "region": "Kanto",
    "types": [
      "dragon",
      "flying"
    ],
    "heightM": 2.2,
    "weightKg": 210,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png"
  },
  {
    "id": 150,
    "name": "Mewtwo",
    "region": "Kanto",
    "types": [
      "psychic"
    ],
    "heightM": 2,
    "weightKg": 122,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": true,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png"
  },
  {
    "id": 151,
    "name": "Mew",
    "region": "Kanto",
    "types": [
      "psychic"
    ],
    "heightM": 0.4,
    "weightKg": 4,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": true,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png"
  },
  {
    "id": 152,
    "name": "Chikorita",
    "region": "Johto",
    "types": [
      "grass"
    ],
    "heightM": 0.9,
    "weightKg": 6.4,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": true,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/152.png"
  },
  {
    "id": 153,
    "name": "Bayleef",
    "region": "Johto",
    "types": [
      "grass"
    ],
    "heightM": 1.2,
    "weightKg": 15.8,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/153.png"
  },
  {
    "id": 154,
    "name": "Meganium",
    "region": "Johto",
    "types": [
      "grass"
    ],
    "heightM": 1.8,
    "weightKg": 100.5,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/154.png"
  },
  {
    "id": 155,
    "name": "Cyndaquil",
    "region": "Johto",
    "types": [
      "fire"
    ],
    "heightM": 0.5,
    "weightKg": 7.9,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": true,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/155.png"
  },
  {
    "id": 156,
    "name": "Quilava",
    "region": "Johto",
    "types": [
      "fire"
    ],
    "heightM": 0.9,
    "weightKg": 19,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/156.png"
  },
  {
    "id": 157,
    "name": "Typhlosion",
    "region": "Johto",
    "types": [
      "fire"
    ],
    "heightM": 1.7,
    "weightKg": 79.5,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/157.png"
  },
  {
    "id": 158,
    "name": "Totodile",
    "region": "Johto",
    "types": [
      "water"
    ],
    "heightM": 0.6,
    "weightKg": 9.5,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": true,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/158.png"
  },
  {
    "id": 159,
    "name": "Croconaw",
    "region": "Johto",
    "types": [
      "water"
    ],
    "heightM": 1.1,
    "weightKg": 25,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/159.png"
  },
  {
    "id": 160,
    "name": "Feraligatr",
    "region": "Johto",
    "types": [
      "water"
    ],
    "heightM": 2.3,
    "weightKg": 88.8,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/160.png"
  },
  {
    "id": 161,
    "name": "Sentret",
    "region": "Johto",
    "types": [
      "normal"
    ],
    "heightM": 0.8,
    "weightKg": 6,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/161.png"
  },
  {
    "id": 162,
    "name": "Furret",
    "region": "Johto",
    "types": [
      "normal"
    ],
    "heightM": 1.8,
    "weightKg": 32.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/162.png"
  },
  {
    "id": 163,
    "name": "Hoothoot",
    "region": "Johto",
    "types": [
      "normal",
      "flying"
    ],
    "heightM": 0.7,
    "weightKg": 21.2,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/163.png"
  },
  {
    "id": 164,
    "name": "Noctowl",
    "region": "Johto",
    "types": [
      "normal",
      "flying"
    ],
    "heightM": 1.6,
    "weightKg": 40.8,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/164.png"
  },
  {
    "id": 165,
    "name": "Ledyba",
    "region": "Johto",
    "types": [
      "bug",
      "flying"
    ],
    "heightM": 1,
    "weightKg": 10.8,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/165.png"
  },
  {
    "id": 166,
    "name": "Ledian",
    "region": "Johto",
    "types": [
      "bug",
      "flying"
    ],
    "heightM": 1.4,
    "weightKg": 35.6,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/166.png"
  },
  {
    "id": 167,
    "name": "Spinarak",
    "region": "Johto",
    "types": [
      "bug",
      "poison"
    ],
    "heightM": 0.5,
    "weightKg": 8.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/167.png"
  },
  {
    "id": 168,
    "name": "Ariados",
    "region": "Johto",
    "types": [
      "bug",
      "poison"
    ],
    "heightM": 1.1,
    "weightKg": 33.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/168.png"
  },
  {
    "id": 169,
    "name": "Crobat",
    "region": "Johto",
    "types": [
      "poison",
      "flying"
    ],
    "heightM": 1.8,
    "weightKg": 75,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/169.png"
  },
  {
    "id": 170,
    "name": "Chinchou",
    "region": "Johto",
    "types": [
      "water",
      "electric"
    ],
    "heightM": 0.5,
    "weightKg": 12,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/170.png"
  },
  {
    "id": 171,
    "name": "Lanturn",
    "region": "Johto",
    "types": [
      "water",
      "electric"
    ],
    "heightM": 1.2,
    "weightKg": 22.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/171.png"
  },
  {
    "id": 172,
    "name": "Pichu",
    "region": "Johto",
    "types": [
      "electric"
    ],
    "heightM": 0.3,
    "weightKg": 2,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/172.png"
  },
  {
    "id": 173,
    "name": "Cleffa",
    "region": "Johto",
    "types": [
      "fairy"
    ],
    "heightM": 0.3,
    "weightKg": 3,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/173.png"
  },
  {
    "id": 174,
    "name": "Igglybuff",
    "region": "Johto",
    "types": [
      "normal",
      "fairy"
    ],
    "heightM": 0.3,
    "weightKg": 1,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/174.png"
  },
  {
    "id": 175,
    "name": "Togepi",
    "region": "Johto",
    "types": [
      "fairy"
    ],
    "heightM": 0.3,
    "weightKg": 1.5,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/175.png"
  },
  {
    "id": 176,
    "name": "Togetic",
    "region": "Johto",
    "types": [
      "fairy",
      "flying"
    ],
    "heightM": 0.6,
    "weightKg": 3.2,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": true,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/176.png"
  },
  {
    "id": 177,
    "name": "Natu",
    "region": "Johto",
    "types": [
      "psychic",
      "flying"
    ],
    "heightM": 0.2,
    "weightKg": 2,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/177.png"
  },
  {
    "id": 178,
    "name": "Xatu",
    "region": "Johto",
    "types": [
      "psychic",
      "flying"
    ],
    "heightM": 1.5,
    "weightKg": 15,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/178.png"
  },
  {
    "id": 179,
    "name": "Mareep",
    "region": "Johto",
    "types": [
      "electric"
    ],
    "heightM": 0.6,
    "weightKg": 7.8,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/179.png"
  },
  {
    "id": 180,
    "name": "Flaaffy",
    "region": "Johto",
    "types": [
      "electric"
    ],
    "heightM": 0.8,
    "weightKg": 13.3,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/180.png"
  },
  {
    "id": 181,
    "name": "Ampharos",
    "region": "Johto",
    "types": [
      "electric"
    ],
    "heightM": 1.4,
    "weightKg": 61.5,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/181.png"
  },
  {
    "id": 182,
    "name": "Bellossom",
    "region": "Johto",
    "types": [
      "grass"
    ],
    "heightM": 0.4,
    "weightKg": 5.8,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/182.png"
  },
  {
    "id": 183,
    "name": "Marill",
    "region": "Johto",
    "types": [
      "water",
      "fairy"
    ],
    "heightM": 0.4,
    "weightKg": 8.5,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/183.png"
  },
  {
    "id": 184,
    "name": "Azumarill",
    "region": "Johto",
    "types": [
      "water",
      "fairy"
    ],
    "heightM": 0.8,
    "weightKg": 28.5,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/184.png"
  },
  {
    "id": 185,
    "name": "Sudowoodo",
    "region": "Johto",
    "types": [
      "rock"
    ],
    "heightM": 1.2,
    "weightKg": 38,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/185.png"
  },
  {
    "id": 186,
    "name": "Politoed",
    "region": "Johto",
    "types": [
      "water"
    ],
    "heightM": 1.1,
    "weightKg": 33.9,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/186.png"
  },
  {
    "id": 187,
    "name": "Hoppip",
    "region": "Johto",
    "types": [
      "grass",
      "flying"
    ],
    "heightM": 0.4,
    "weightKg": 0.5,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/187.png"
  },
  {
    "id": 188,
    "name": "Skiploom",
    "region": "Johto",
    "types": [
      "grass",
      "flying"
    ],
    "heightM": 0.6,
    "weightKg": 1,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/188.png"
  },
  {
    "id": 189,
    "name": "Jumpluff",
    "region": "Johto",
    "types": [
      "grass",
      "flying"
    ],
    "heightM": 0.8,
    "weightKg": 3,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/189.png"
  },
  {
    "id": 190,
    "name": "Aipom",
    "region": "Johto",
    "types": [
      "normal"
    ],
    "heightM": 0.8,
    "weightKg": 11.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/190.png"
  },
  {
    "id": 191,
    "name": "Sunkern",
    "region": "Johto",
    "types": [
      "grass"
    ],
    "heightM": 0.3,
    "weightKg": 1.8,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": true,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/191.png"
  },
  {
    "id": 192,
    "name": "Sunflora",
    "region": "Johto",
    "types": [
      "grass"
    ],
    "heightM": 0.8,
    "weightKg": 8.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/192.png"
  },
  {
    "id": 193,
    "name": "Yanma",
    "region": "Johto",
    "types": [
      "bug",
      "flying"
    ],
    "heightM": 1.2,
    "weightKg": 38,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/193.png"
  },
  {
    "id": 194,
    "name": "Wooper",
    "region": "Johto",
    "types": [
      "water",
      "ground"
    ],
    "heightM": 0.4,
    "weightKg": 8.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/194.png"
  },
  {
    "id": 195,
    "name": "Quagsire",
    "region": "Johto",
    "types": [
      "water",
      "ground"
    ],
    "heightM": 1.4,
    "weightKg": 75,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/195.png"
  },
  {
    "id": 196,
    "name": "Espeon",
    "region": "Johto",
    "types": [
      "psychic"
    ],
    "heightM": 0.9,
    "weightKg": 26.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/196.png"
  },
  {
    "id": 197,
    "name": "Umbreon",
    "region": "Johto",
    "types": [
      "dark"
    ],
    "heightM": 1,
    "weightKg": 27,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/197.png"
  },
  {
    "id": 198,
    "name": "Murkrow",
    "region": "Johto",
    "types": [
      "dark",
      "flying"
    ],
    "heightM": 0.5,
    "weightKg": 2.1,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": true,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/198.png"
  },
  {
    "id": 199,
    "name": "Slowking",
    "region": "Johto",
    "types": [
      "water",
      "psychic"
    ],
    "heightM": 2,
    "weightKg": 79.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/199.png"
  },
  {
    "id": 200,
    "name": "Misdreavus",
    "region": "Johto",
    "types": [
      "ghost"
    ],
    "heightM": 0.7,
    "weightKg": 1,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": true,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/200.png"
  },
  {
    "id": 201,
    "name": "Unown",
    "region": "Johto",
    "types": [
      "psychic"
    ],
    "heightM": 0.5,
    "weightKg": 5,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/201.png"
  },
  {
    "id": 202,
    "name": "Wobbuffet",
    "region": "Johto",
    "types": [
      "psychic"
    ],
    "heightM": 1.3,
    "weightKg": 28.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/202.png"
  },
  {
    "id": 203,
    "name": "Girafarig",
    "region": "Johto",
    "types": [
      "normal",
      "psychic"
    ],
    "heightM": 1.5,
    "weightKg": 41.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/203.png"
  },
  {
    "id": 204,
    "name": "Pineco",
    "region": "Johto",
    "types": [
      "bug"
    ],
    "heightM": 0.6,
    "weightKg": 7.2,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/204.png"
  },
  {
    "id": 205,
    "name": "Forretress",
    "region": "Johto",
    "types": [
      "bug",
      "steel"
    ],
    "heightM": 1.2,
    "weightKg": 125.8,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/205.png"
  },
  {
    "id": 206,
    "name": "Dunsparce",
    "region": "Johto",
    "types": [
      "normal"
    ],
    "heightM": 1.5,
    "weightKg": 14,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/206.png"
  },
  {
    "id": 207,
    "name": "Gligar",
    "region": "Johto",
    "types": [
      "ground",
      "flying"
    ],
    "heightM": 1.1,
    "weightKg": 64.8,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/207.png"
  },
  {
    "id": 208,
    "name": "Steelix",
    "region": "Johto",
    "types": [
      "steel",
      "ground"
    ],
    "heightM": 9.2,
    "weightKg": 400,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/208.png"
  },
  {
    "id": 209,
    "name": "Snubbull",
    "region": "Johto",
    "types": [
      "fairy"
    ],
    "heightM": 0.6,
    "weightKg": 7.8,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/209.png"
  },
  {
    "id": 210,
    "name": "Granbull",
    "region": "Johto",
    "types": [
      "fairy"
    ],
    "heightM": 1.4,
    "weightKg": 48.7,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/210.png"
  },
  {
    "id": 211,
    "name": "Qwilfish",
    "region": "Johto",
    "types": [
      "water",
      "poison"
    ],
    "heightM": 0.5,
    "weightKg": 3.9,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/211.png"
  },
  {
    "id": 212,
    "name": "Scizor",
    "region": "Johto",
    "types": [
      "bug",
      "steel"
    ],
    "heightM": 1.8,
    "weightKg": 118,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/212.png"
  },
  {
    "id": 213,
    "name": "Shuckle",
    "region": "Johto",
    "types": [
      "bug",
      "rock"
    ],
    "heightM": 0.6,
    "weightKg": 20.5,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/213.png"
  },
  {
    "id": 214,
    "name": "Heracross",
    "region": "Johto",
    "types": [
      "bug",
      "fighting"
    ],
    "heightM": 1.5,
    "weightKg": 54,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/214.png"
  },
  {
    "id": 215,
    "name": "Sneasel",
    "region": "Johto",
    "types": [
      "dark",
      "ice"
    ],
    "heightM": 0.9,
    "weightKg": 28,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/215.png"
  },
  {
    "id": 216,
    "name": "Teddiursa",
    "region": "Johto",
    "types": [
      "normal"
    ],
    "heightM": 0.6,
    "weightKg": 8.8,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/216.png"
  },
  {
    "id": 217,
    "name": "Ursaring",
    "region": "Johto",
    "types": [
      "normal"
    ],
    "heightM": 1.8,
    "weightKg": 125.8,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/217.png"
  },
  {
    "id": 218,
    "name": "Slugma",
    "region": "Johto",
    "types": [
      "fire"
    ],
    "heightM": 0.7,
    "weightKg": 35,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/218.png"
  },
  {
    "id": 219,
    "name": "Magcargo",
    "region": "Johto",
    "types": [
      "fire",
      "rock"
    ],
    "heightM": 0.8,
    "weightKg": 55,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/219.png"
  },
  {
    "id": 220,
    "name": "Swinub",
    "region": "Johto",
    "types": [
      "ice",
      "ground"
    ],
    "heightM": 0.4,
    "weightKg": 6.5,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/220.png"
  },
  {
    "id": 221,
    "name": "Piloswine",
    "region": "Johto",
    "types": [
      "ice",
      "ground"
    ],
    "heightM": 1.1,
    "weightKg": 55.8,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/221.png"
  },
  {
    "id": 222,
    "name": "Corsola",
    "region": "Johto",
    "types": [
      "water",
      "rock"
    ],
    "heightM": 0.6,
    "weightKg": 5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/222.png"
  },
  {
    "id": 223,
    "name": "Remoraid",
    "region": "Johto",
    "types": [
      "water"
    ],
    "heightM": 0.6,
    "weightKg": 12,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/223.png"
  },
  {
    "id": 224,
    "name": "Octillery",
    "region": "Johto",
    "types": [
      "water"
    ],
    "heightM": 0.9,
    "weightKg": 28.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/224.png"
  },
  {
    "id": 225,
    "name": "Delibird",
    "region": "Johto",
    "types": [
      "ice",
      "flying"
    ],
    "heightM": 0.9,
    "weightKg": 16,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/225.png"
  },
  {
    "id": 226,
    "name": "Mantine",
    "region": "Johto",
    "types": [
      "water",
      "flying"
    ],
    "heightM": 2.1,
    "weightKg": 220,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/226.png"
  },
  {
    "id": 227,
    "name": "Skarmory",
    "region": "Johto",
    "types": [
      "steel",
      "flying"
    ],
    "heightM": 1.7,
    "weightKg": 50.5,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/227.png"
  },
  {
    "id": 228,
    "name": "Houndour",
    "region": "Johto",
    "types": [
      "dark",
      "fire"
    ],
    "heightM": 0.6,
    "weightKg": 10.8,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/228.png"
  },
  {
    "id": 229,
    "name": "Houndoom",
    "region": "Johto",
    "types": [
      "dark",
      "fire"
    ],
    "heightM": 1.4,
    "weightKg": 35,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/229.png"
  },
  {
    "id": 230,
    "name": "Kingdra",
    "region": "Johto",
    "types": [
      "water",
      "dragon"
    ],
    "heightM": 1.8,
    "weightKg": 152,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/230.png"
  },
  {
    "id": 231,
    "name": "Phanpy",
    "region": "Johto",
    "types": [
      "ground"
    ],
    "heightM": 0.5,
    "weightKg": 33.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/231.png"
  },
  {
    "id": 232,
    "name": "Donphan",
    "region": "Johto",
    "types": [
      "ground"
    ],
    "heightM": 1.1,
    "weightKg": 120,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/232.png"
  },
  {
    "id": 233,
    "name": "Porygon2",
    "region": "Johto",
    "types": [
      "normal"
    ],
    "heightM": 0.6,
    "weightKg": 32.5,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/233.png"
  },
  {
    "id": 234,
    "name": "Stantler",
    "region": "Johto",
    "types": [
      "normal"
    ],
    "heightM": 1.4,
    "weightKg": 71.2,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/234.png"
  },
  {
    "id": 235,
    "name": "Smeargle",
    "region": "Johto",
    "types": [
      "normal"
    ],
    "heightM": 1.2,
    "weightKg": 58,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/235.png"
  },
  {
    "id": 236,
    "name": "Tyrogue",
    "region": "Johto",
    "types": [
      "fighting"
    ],
    "heightM": 0.7,
    "weightKg": 21,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/236.png"
  },
  {
    "id": 237,
    "name": "Hitmontop",
    "region": "Johto",
    "types": [
      "fighting"
    ],
    "heightM": 1.4,
    "weightKg": 48,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/237.png"
  },
  {
    "id": 238,
    "name": "Smoochum",
    "region": "Johto",
    "types": [
      "ice",
      "psychic"
    ],
    "heightM": 0.4,
    "weightKg": 6,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/238.png"
  },
  {
    "id": 239,
    "name": "Elekid",
    "region": "Johto",
    "types": [
      "electric"
    ],
    "heightM": 0.6,
    "weightKg": 23.5,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/239.png"
  },
  {
    "id": 240,
    "name": "Magby",
    "region": "Johto",
    "types": [
      "fire"
    ],
    "heightM": 0.7,
    "weightKg": 21.4,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/240.png"
  },
  {
    "id": 241,
    "name": "Miltank",
    "region": "Johto",
    "types": [
      "normal"
    ],
    "heightM": 1.2,
    "weightKg": 75.5,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/241.png"
  },
  {
    "id": 242,
    "name": "Blissey",
    "region": "Johto",
    "types": [
      "normal"
    ],
    "heightM": 1.5,
    "weightKg": 46.8,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/242.png"
  },
  {
    "id": 243,
    "name": "Raikou",
    "region": "Johto",
    "types": [
      "electric"
    ],
    "heightM": 1.9,
    "weightKg": 178,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": true,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/243.png"
  },
  {
    "id": 244,
    "name": "Entei",
    "region": "Johto",
    "types": [
      "fire"
    ],
    "heightM": 2.1,
    "weightKg": 198,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": true,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/244.png"
  },
  {
    "id": 245,
    "name": "Suicune",
    "region": "Johto",
    "types": [
      "water"
    ],
    "heightM": 2,
    "weightKg": 187,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": true,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/245.png"
  },
  {
    "id": 246,
    "name": "Larvitar",
    "region": "Johto",
    "types": [
      "rock",
      "ground"
    ],
    "heightM": 0.6,
    "weightKg": 72,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/246.png"
  },
  {
    "id": 247,
    "name": "Pupitar",
    "region": "Johto",
    "types": [
      "rock",
      "ground"
    ],
    "heightM": 1.2,
    "weightKg": 152,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/247.png"
  },
  {
    "id": 248,
    "name": "Tyranitar",
    "region": "Johto",
    "types": [
      "rock",
      "dark"
    ],
    "heightM": 2,
    "weightKg": 202,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/248.png"
  },
  {
    "id": 249,
    "name": "Lugia",
    "region": "Johto",
    "types": [
      "psychic",
      "flying"
    ],
    "heightM": 5.2,
    "weightKg": 216,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": true,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/249.png"
  },
  {
    "id": 250,
    "name": "Ho Oh",
    "region": "Johto",
    "types": [
      "fire",
      "flying"
    ],
    "heightM": 3.8,
    "weightKg": 199,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": true,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/250.png"
  },
  {
    "id": 251,
    "name": "Celebi",
    "region": "Johto",
    "types": [
      "psychic",
      "grass"
    ],
    "heightM": 0.6,
    "weightKg": 5,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": true,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/251.png"
  },
  {
    "id": 252,
    "name": "Treecko",
    "region": "Hoenn",
    "types": [
      "grass"
    ],
    "heightM": 0.5,
    "weightKg": 5,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": true,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/252.png"
  },
  {
    "id": 253,
    "name": "Grovyle",
    "region": "Hoenn",
    "types": [
      "grass"
    ],
    "heightM": 0.9,
    "weightKg": 21.6,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/253.png"
  },
  {
    "id": 254,
    "name": "Sceptile",
    "region": "Hoenn",
    "types": [
      "grass"
    ],
    "heightM": 1.7,
    "weightKg": 52.2,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/254.png"
  },
  {
    "id": 255,
    "name": "Torchic",
    "region": "Hoenn",
    "types": [
      "fire"
    ],
    "heightM": 0.4,
    "weightKg": 2.5,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": true,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/255.png"
  },
  {
    "id": 256,
    "name": "Combusken",
    "region": "Hoenn",
    "types": [
      "fire",
      "fighting"
    ],
    "heightM": 0.9,
    "weightKg": 19.5,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/256.png"
  },
  {
    "id": 257,
    "name": "Blaziken",
    "region": "Hoenn",
    "types": [
      "fire",
      "fighting"
    ],
    "heightM": 1.9,
    "weightKg": 52,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/257.png"
  },
  {
    "id": 258,
    "name": "Mudkip",
    "region": "Hoenn",
    "types": [
      "water"
    ],
    "heightM": 0.4,
    "weightKg": 7.6,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": true,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/258.png"
  },
  {
    "id": 259,
    "name": "Marshtomp",
    "region": "Hoenn",
    "types": [
      "water",
      "ground"
    ],
    "heightM": 0.7,
    "weightKg": 28,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/259.png"
  },
  {
    "id": 260,
    "name": "Swampert",
    "region": "Hoenn",
    "types": [
      "water",
      "ground"
    ],
    "heightM": 1.5,
    "weightKg": 81.9,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/260.png"
  },
  {
    "id": 261,
    "name": "Poochyena",
    "region": "Hoenn",
    "types": [
      "dark"
    ],
    "heightM": 0.5,
    "weightKg": 13.6,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/261.png"
  },
  {
    "id": 262,
    "name": "Mightyena",
    "region": "Hoenn",
    "types": [
      "dark"
    ],
    "heightM": 1,
    "weightKg": 37,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/262.png"
  },
  {
    "id": 263,
    "name": "Zigzagoon",
    "region": "Hoenn",
    "types": [
      "normal"
    ],
    "heightM": 0.4,
    "weightKg": 17.5,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/263.png"
  },
  {
    "id": 264,
    "name": "Linoone",
    "region": "Hoenn",
    "types": [
      "normal"
    ],
    "heightM": 0.5,
    "weightKg": 32.5,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/264.png"
  },
  {
    "id": 265,
    "name": "Wurmple",
    "region": "Hoenn",
    "types": [
      "bug"
    ],
    "heightM": 0.3,
    "weightKg": 3.6,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/265.png"
  },
  {
    "id": 266,
    "name": "Silcoon",
    "region": "Hoenn",
    "types": [
      "bug"
    ],
    "heightM": 0.6,
    "weightKg": 10,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/266.png"
  },
  {
    "id": 267,
    "name": "Beautifly",
    "region": "Hoenn",
    "types": [
      "bug",
      "flying"
    ],
    "heightM": 1,
    "weightKg": 28.4,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/267.png"
  },
  {
    "id": 268,
    "name": "Cascoon",
    "region": "Hoenn",
    "types": [
      "bug"
    ],
    "heightM": 0.7,
    "weightKg": 11.5,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/268.png"
  },
  {
    "id": 269,
    "name": "Dustox",
    "region": "Hoenn",
    "types": [
      "bug",
      "poison"
    ],
    "heightM": 1.2,
    "weightKg": 31.6,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/269.png"
  },
  {
    "id": 270,
    "name": "Lotad",
    "region": "Hoenn",
    "types": [
      "water",
      "grass"
    ],
    "heightM": 0.5,
    "weightKg": 2.6,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/270.png"
  },
  {
    "id": 271,
    "name": "Lombre",
    "region": "Hoenn",
    "types": [
      "water",
      "grass"
    ],
    "heightM": 1.2,
    "weightKg": 32.5,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": true,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/271.png"
  },
  {
    "id": 272,
    "name": "Ludicolo",
    "region": "Hoenn",
    "types": [
      "water",
      "grass"
    ],
    "heightM": 1.5,
    "weightKg": 55,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/272.png"
  },
  {
    "id": 273,
    "name": "Seedot",
    "region": "Hoenn",
    "types": [
      "grass"
    ],
    "heightM": 0.5,
    "weightKg": 4,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/273.png"
  },
  {
    "id": 274,
    "name": "Nuzleaf",
    "region": "Hoenn",
    "types": [
      "grass",
      "dark"
    ],
    "heightM": 1,
    "weightKg": 28,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": true,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/274.png"
  },
  {
    "id": 275,
    "name": "Shiftry",
    "region": "Hoenn",
    "types": [
      "grass",
      "dark"
    ],
    "heightM": 1.3,
    "weightKg": 59.6,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/275.png"
  },
  {
    "id": 276,
    "name": "Taillow",
    "region": "Hoenn",
    "types": [
      "normal",
      "flying"
    ],
    "heightM": 0.3,
    "weightKg": 2.3,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/276.png"
  },
  {
    "id": 277,
    "name": "Swellow",
    "region": "Hoenn",
    "types": [
      "normal",
      "flying"
    ],
    "heightM": 0.7,
    "weightKg": 19.8,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/277.png"
  },
  {
    "id": 278,
    "name": "Wingull",
    "region": "Hoenn",
    "types": [
      "water",
      "flying"
    ],
    "heightM": 0.6,
    "weightKg": 9.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/278.png"
  },
  {
    "id": 279,
    "name": "Pelipper",
    "region": "Hoenn",
    "types": [
      "water",
      "flying"
    ],
    "heightM": 1.2,
    "weightKg": 28,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/279.png"
  },
  {
    "id": 280,
    "name": "Ralts",
    "region": "Hoenn",
    "types": [
      "psychic",
      "fairy"
    ],
    "heightM": 0.4,
    "weightKg": 6.6,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/280.png"
  },
  {
    "id": 281,
    "name": "Kirlia",
    "region": "Hoenn",
    "types": [
      "psychic",
      "fairy"
    ],
    "heightM": 0.8,
    "weightKg": 20.2,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": true,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/281.png"
  },
  {
    "id": 282,
    "name": "Gardevoir",
    "region": "Hoenn",
    "types": [
      "psychic",
      "fairy"
    ],
    "heightM": 1.6,
    "weightKg": 48.4,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/282.png"
  },
  {
    "id": 283,
    "name": "Surskit",
    "region": "Hoenn",
    "types": [
      "bug",
      "water"
    ],
    "heightM": 0.5,
    "weightKg": 1.7,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/283.png"
  },
  {
    "id": 284,
    "name": "Masquerain",
    "region": "Hoenn",
    "types": [
      "bug",
      "flying"
    ],
    "heightM": 0.8,
    "weightKg": 3.6,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/284.png"
  },
  {
    "id": 285,
    "name": "Shroomish",
    "region": "Hoenn",
    "types": [
      "grass"
    ],
    "heightM": 0.4,
    "weightKg": 4.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/285.png"
  },
  {
    "id": 286,
    "name": "Breloom",
    "region": "Hoenn",
    "types": [
      "grass",
      "fighting"
    ],
    "heightM": 1.2,
    "weightKg": 39.2,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/286.png"
  },
  {
    "id": 287,
    "name": "Slakoth",
    "region": "Hoenn",
    "types": [
      "normal"
    ],
    "heightM": 0.8,
    "weightKg": 24,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/287.png"
  },
  {
    "id": 288,
    "name": "Vigoroth",
    "region": "Hoenn",
    "types": [
      "normal"
    ],
    "heightM": 1.4,
    "weightKg": 46.5,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/288.png"
  },
  {
    "id": 289,
    "name": "Slaking",
    "region": "Hoenn",
    "types": [
      "normal"
    ],
    "heightM": 2,
    "weightKg": 130.5,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/289.png"
  },
  {
    "id": 290,
    "name": "Nincada",
    "region": "Hoenn",
    "types": [
      "bug",
      "ground"
    ],
    "heightM": 0.5,
    "weightKg": 5.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/290.png"
  },
  {
    "id": 291,
    "name": "Ninjask",
    "region": "Hoenn",
    "types": [
      "bug",
      "flying"
    ],
    "heightM": 0.8,
    "weightKg": 12,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/291.png"
  },
  {
    "id": 292,
    "name": "Shedinja",
    "region": "Hoenn",
    "types": [
      "bug",
      "ghost"
    ],
    "heightM": 0.8,
    "weightKg": 1.2,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/292.png"
  },
  {
    "id": 293,
    "name": "Whismur",
    "region": "Hoenn",
    "types": [
      "normal"
    ],
    "heightM": 0.6,
    "weightKg": 16.3,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/293.png"
  },
  {
    "id": 294,
    "name": "Loudred",
    "region": "Hoenn",
    "types": [
      "normal"
    ],
    "heightM": 1,
    "weightKg": 40.5,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/294.png"
  },
  {
    "id": 295,
    "name": "Exploud",
    "region": "Hoenn",
    "types": [
      "normal"
    ],
    "heightM": 1.5,
    "weightKg": 84,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/295.png"
  },
  {
    "id": 296,
    "name": "Makuhita",
    "region": "Hoenn",
    "types": [
      "fighting"
    ],
    "heightM": 1,
    "weightKg": 86.4,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/296.png"
  },
  {
    "id": 297,
    "name": "Hariyama",
    "region": "Hoenn",
    "types": [
      "fighting"
    ],
    "heightM": 2.3,
    "weightKg": 253.8,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/297.png"
  },
  {
    "id": 298,
    "name": "Azurill",
    "region": "Hoenn",
    "types": [
      "normal",
      "fairy"
    ],
    "heightM": 0.2,
    "weightKg": 2,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/298.png"
  },
  {
    "id": 299,
    "name": "Nosepass",
    "region": "Hoenn",
    "types": [
      "rock"
    ],
    "heightM": 1,
    "weightKg": 97,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": true,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/299.png"
  },
  {
    "id": 300,
    "name": "Skitty",
    "region": "Hoenn",
    "types": [
      "normal"
    ],
    "heightM": 0.6,
    "weightKg": 11,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": true,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/300.png"
  },
  {
    "id": 301,
    "name": "Delcatty",
    "region": "Hoenn",
    "types": [
      "normal"
    ],
    "heightM": 1.1,
    "weightKg": 32.6,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/301.png"
  },
  {
    "id": 302,
    "name": "Sableye",
    "region": "Hoenn",
    "types": [
      "dark",
      "ghost"
    ],
    "heightM": 0.5,
    "weightKg": 11,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/302.png"
  },
  {
    "id": 303,
    "name": "Mawile",
    "region": "Hoenn",
    "types": [
      "steel",
      "fairy"
    ],
    "heightM": 0.6,
    "weightKg": 11.5,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/303.png"
  },
  {
    "id": 304,
    "name": "Aron",
    "region": "Hoenn",
    "types": [
      "steel",
      "rock"
    ],
    "heightM": 0.4,
    "weightKg": 60,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/304.png"
  },
  {
    "id": 305,
    "name": "Lairon",
    "region": "Hoenn",
    "types": [
      "steel",
      "rock"
    ],
    "heightM": 0.9,
    "weightKg": 120,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/305.png"
  },
  {
    "id": 306,
    "name": "Aggron",
    "region": "Hoenn",
    "types": [
      "steel",
      "rock"
    ],
    "heightM": 2.1,
    "weightKg": 360,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/306.png"
  },
  {
    "id": 307,
    "name": "Meditite",
    "region": "Hoenn",
    "types": [
      "fighting",
      "psychic"
    ],
    "heightM": 0.6,
    "weightKg": 11.2,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/307.png"
  },
  {
    "id": 308,
    "name": "Medicham",
    "region": "Hoenn",
    "types": [
      "fighting",
      "psychic"
    ],
    "heightM": 1.3,
    "weightKg": 31.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/308.png"
  },
  {
    "id": 309,
    "name": "Electrike",
    "region": "Hoenn",
    "types": [
      "electric"
    ],
    "heightM": 0.6,
    "weightKg": 15.2,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/309.png"
  },
  {
    "id": 310,
    "name": "Manectric",
    "region": "Hoenn",
    "types": [
      "electric"
    ],
    "heightM": 1.5,
    "weightKg": 40.2,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/310.png"
  },
  {
    "id": 311,
    "name": "Plusle",
    "region": "Hoenn",
    "types": [
      "electric"
    ],
    "heightM": 0.4,
    "weightKg": 4.2,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/311.png"
  },
  {
    "id": 312,
    "name": "Minun",
    "region": "Hoenn",
    "types": [
      "electric"
    ],
    "heightM": 0.4,
    "weightKg": 4.2,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/312.png"
  },
  {
    "id": 313,
    "name": "Volbeat",
    "region": "Hoenn",
    "types": [
      "bug"
    ],
    "heightM": 0.7,
    "weightKg": 17.7,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/313.png"
  },
  {
    "id": 314,
    "name": "Illumise",
    "region": "Hoenn",
    "types": [
      "bug"
    ],
    "heightM": 0.6,
    "weightKg": 17.7,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/314.png"
  },
  {
    "id": 315,
    "name": "Roselia",
    "region": "Hoenn",
    "types": [
      "grass",
      "poison"
    ],
    "heightM": 0.3,
    "weightKg": 2,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": true,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/315.png"
  },
  {
    "id": 316,
    "name": "Gulpin",
    "region": "Hoenn",
    "types": [
      "poison"
    ],
    "heightM": 0.4,
    "weightKg": 10.3,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/316.png"
  },
  {
    "id": 317,
    "name": "Swalot",
    "region": "Hoenn",
    "types": [
      "poison"
    ],
    "heightM": 1.7,
    "weightKg": 80,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/317.png"
  },
  {
    "id": 318,
    "name": "Carvanha",
    "region": "Hoenn",
    "types": [
      "water",
      "dark"
    ],
    "heightM": 0.8,
    "weightKg": 20.8,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/318.png"
  },
  {
    "id": 319,
    "name": "Sharpedo",
    "region": "Hoenn",
    "types": [
      "water",
      "dark"
    ],
    "heightM": 1.8,
    "weightKg": 88.8,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/319.png"
  },
  {
    "id": 320,
    "name": "Wailmer",
    "region": "Hoenn",
    "types": [
      "water"
    ],
    "heightM": 2,
    "weightKg": 130,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/320.png"
  },
  {
    "id": 321,
    "name": "Wailord",
    "region": "Hoenn",
    "types": [
      "water"
    ],
    "heightM": 14.5,
    "weightKg": 398,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/321.png"
  },
  {
    "id": 322,
    "name": "Numel",
    "region": "Hoenn",
    "types": [
      "fire",
      "ground"
    ],
    "heightM": 0.7,
    "weightKg": 24,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/322.png"
  },
  {
    "id": 323,
    "name": "Camerupt",
    "region": "Hoenn",
    "types": [
      "fire",
      "ground"
    ],
    "heightM": 1.9,
    "weightKg": 220,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/323.png"
  },
  {
    "id": 324,
    "name": "Torkoal",
    "region": "Hoenn",
    "types": [
      "fire"
    ],
    "heightM": 0.5,
    "weightKg": 80.4,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/324.png"
  },
  {
    "id": 325,
    "name": "Spoink",
    "region": "Hoenn",
    "types": [
      "psychic"
    ],
    "heightM": 0.7,
    "weightKg": 30.6,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/325.png"
  },
  {
    "id": 326,
    "name": "Grumpig",
    "region": "Hoenn",
    "types": [
      "psychic"
    ],
    "heightM": 0.9,
    "weightKg": 71.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/326.png"
  },
  {
    "id": 327,
    "name": "Spinda",
    "region": "Hoenn",
    "types": [
      "normal"
    ],
    "heightM": 1.1,
    "weightKg": 5,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/327.png"
  },
  {
    "id": 328,
    "name": "Trapinch",
    "region": "Hoenn",
    "types": [
      "ground"
    ],
    "heightM": 0.7,
    "weightKg": 15,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/328.png"
  },
  {
    "id": 329,
    "name": "Vibrava",
    "region": "Hoenn",
    "types": [
      "ground",
      "dragon"
    ],
    "heightM": 1.1,
    "weightKg": 15.3,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/329.png"
  },
  {
    "id": 330,
    "name": "Flygon",
    "region": "Hoenn",
    "types": [
      "ground",
      "dragon"
    ],
    "heightM": 2,
    "weightKg": 82,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/330.png"
  },
  {
    "id": 331,
    "name": "Cacnea",
    "region": "Hoenn",
    "types": [
      "grass"
    ],
    "heightM": 0.4,
    "weightKg": 51.3,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/331.png"
  },
  {
    "id": 332,
    "name": "Cacturne",
    "region": "Hoenn",
    "types": [
      "grass",
      "dark"
    ],
    "heightM": 1.3,
    "weightKg": 77.4,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/332.png"
  },
  {
    "id": 333,
    "name": "Swablu",
    "region": "Hoenn",
    "types": [
      "normal",
      "flying"
    ],
    "heightM": 0.4,
    "weightKg": 1.2,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/333.png"
  },
  {
    "id": 334,
    "name": "Altaria",
    "region": "Hoenn",
    "types": [
      "dragon",
      "flying"
    ],
    "heightM": 1.1,
    "weightKg": 20.6,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/334.png"
  },
  {
    "id": 335,
    "name": "Zangoose",
    "region": "Hoenn",
    "types": [
      "normal"
    ],
    "heightM": 1.3,
    "weightKg": 40.3,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/335.png"
  },
  {
    "id": 336,
    "name": "Seviper",
    "region": "Hoenn",
    "types": [
      "poison"
    ],
    "heightM": 2.7,
    "weightKg": 52.5,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/336.png"
  },
  {
    "id": 337,
    "name": "Lunatone",
    "region": "Hoenn",
    "types": [
      "rock",
      "psychic"
    ],
    "heightM": 1,
    "weightKg": 168,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/337.png"
  },
  {
    "id": 338,
    "name": "Solrock",
    "region": "Hoenn",
    "types": [
      "rock",
      "psychic"
    ],
    "heightM": 1.2,
    "weightKg": 154,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/338.png"
  },
  {
    "id": 339,
    "name": "Barboach",
    "region": "Hoenn",
    "types": [
      "water",
      "ground"
    ],
    "heightM": 0.4,
    "weightKg": 1.9,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/339.png"
  },
  {
    "id": 340,
    "name": "Whiscash",
    "region": "Hoenn",
    "types": [
      "water",
      "ground"
    ],
    "heightM": 0.9,
    "weightKg": 23.6,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/340.png"
  },
  {
    "id": 341,
    "name": "Corphish",
    "region": "Hoenn",
    "types": [
      "water"
    ],
    "heightM": 0.6,
    "weightKg": 11.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/341.png"
  },
  {
    "id": 342,
    "name": "Crawdaunt",
    "region": "Hoenn",
    "types": [
      "water",
      "dark"
    ],
    "heightM": 1.1,
    "weightKg": 32.8,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/342.png"
  },
  {
    "id": 343,
    "name": "Baltoy",
    "region": "Hoenn",
    "types": [
      "ground",
      "psychic"
    ],
    "heightM": 0.5,
    "weightKg": 21.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/343.png"
  },
  {
    "id": 344,
    "name": "Claydol",
    "region": "Hoenn",
    "types": [
      "ground",
      "psychic"
    ],
    "heightM": 1.5,
    "weightKg": 108,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/344.png"
  },
  {
    "id": 345,
    "name": "Lileep",
    "region": "Hoenn",
    "types": [
      "rock",
      "grass"
    ],
    "heightM": 1,
    "weightKg": 23.8,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/345.png"
  },
  {
    "id": 346,
    "name": "Cradily",
    "region": "Hoenn",
    "types": [
      "rock",
      "grass"
    ],
    "heightM": 1.5,
    "weightKg": 60.4,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/346.png"
  },
  {
    "id": 347,
    "name": "Anorith",
    "region": "Hoenn",
    "types": [
      "rock",
      "bug"
    ],
    "heightM": 0.7,
    "weightKg": 12.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/347.png"
  },
  {
    "id": 348,
    "name": "Armaldo",
    "region": "Hoenn",
    "types": [
      "rock",
      "bug"
    ],
    "heightM": 1.5,
    "weightKg": 68.2,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/348.png"
  },
  {
    "id": 349,
    "name": "Feebas",
    "region": "Hoenn",
    "types": [
      "water"
    ],
    "heightM": 0.6,
    "weightKg": 7.4,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/349.png"
  },
  {
    "id": 350,
    "name": "Milotic",
    "region": "Hoenn",
    "types": [
      "water"
    ],
    "heightM": 6.2,
    "weightKg": 162,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/350.png"
  },
  {
    "id": 351,
    "name": "Castform",
    "region": "Hoenn",
    "types": [
      "normal"
    ],
    "heightM": 0.3,
    "weightKg": 0.8,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/351.png"
  },
  {
    "id": 352,
    "name": "Kecleon",
    "region": "Hoenn",
    "types": [
      "normal"
    ],
    "heightM": 1,
    "weightKg": 22,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/352.png"
  },
  {
    "id": 353,
    "name": "Shuppet",
    "region": "Hoenn",
    "types": [
      "ghost"
    ],
    "heightM": 0.6,
    "weightKg": 2.3,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/353.png"
  },
  {
    "id": 354,
    "name": "Banette",
    "region": "Hoenn",
    "types": [
      "ghost"
    ],
    "heightM": 1.1,
    "weightKg": 12.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/354.png"
  },
  {
    "id": 355,
    "name": "Duskull",
    "region": "Hoenn",
    "types": [
      "ghost"
    ],
    "heightM": 0.8,
    "weightKg": 15,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/355.png"
  },
  {
    "id": 356,
    "name": "Dusclops",
    "region": "Hoenn",
    "types": [
      "ghost"
    ],
    "heightM": 1.6,
    "weightKg": 30.6,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/356.png"
  },
  {
    "id": 357,
    "name": "Tropius",
    "region": "Hoenn",
    "types": [
      "grass",
      "flying"
    ],
    "heightM": 2,
    "weightKg": 100,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/357.png"
  },
  {
    "id": 358,
    "name": "Chimecho",
    "region": "Hoenn",
    "types": [
      "psychic"
    ],
    "heightM": 0.6,
    "weightKg": 1,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/358.png"
  },
  {
    "id": 359,
    "name": "Absol",
    "region": "Hoenn",
    "types": [
      "dark"
    ],
    "heightM": 1.2,
    "weightKg": 47,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/359.png"
  },
  {
    "id": 360,
    "name": "Wynaut",
    "region": "Hoenn",
    "types": [
      "psychic"
    ],
    "heightM": 0.6,
    "weightKg": 14,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/360.png"
  },
  {
    "id": 361,
    "name": "Snorunt",
    "region": "Hoenn",
    "types": [
      "ice"
    ],
    "heightM": 0.7,
    "weightKg": 16.8,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": true,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/361.png"
  },
  {
    "id": 362,
    "name": "Glalie",
    "region": "Hoenn",
    "types": [
      "ice"
    ],
    "heightM": 1.5,
    "weightKg": 256.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/362.png"
  },
  {
    "id": 363,
    "name": "Spheal",
    "region": "Hoenn",
    "types": [
      "ice",
      "water"
    ],
    "heightM": 0.8,
    "weightKg": 39.5,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/363.png"
  },
  {
    "id": 364,
    "name": "Sealeo",
    "region": "Hoenn",
    "types": [
      "ice",
      "water"
    ],
    "heightM": 1.1,
    "weightKg": 87.6,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/364.png"
  },
  {
    "id": 365,
    "name": "Walrein",
    "region": "Hoenn",
    "types": [
      "ice",
      "water"
    ],
    "heightM": 1.4,
    "weightKg": 150.6,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/365.png"
  },
  {
    "id": 366,
    "name": "Clamperl",
    "region": "Hoenn",
    "types": [
      "water"
    ],
    "heightM": 0.4,
    "weightKg": 52.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/366.png"
  },
  {
    "id": 367,
    "name": "Huntail",
    "region": "Hoenn",
    "types": [
      "water"
    ],
    "heightM": 1.7,
    "weightKg": 27,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/367.png"
  },
  {
    "id": 368,
    "name": "Gorebyss",
    "region": "Hoenn",
    "types": [
      "water"
    ],
    "heightM": 1.8,
    "weightKg": 22.6,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/368.png"
  },
  {
    "id": 369,
    "name": "Relicanth",
    "region": "Hoenn",
    "types": [
      "water",
      "rock"
    ],
    "heightM": 1,
    "weightKg": 23.4,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/369.png"
  },
  {
    "id": 370,
    "name": "Luvdisc",
    "region": "Hoenn",
    "types": [
      "water"
    ],
    "heightM": 0.6,
    "weightKg": 8.7,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/370.png"
  },
  {
    "id": 371,
    "name": "Bagon",
    "region": "Hoenn",
    "types": [
      "dragon"
    ],
    "heightM": 0.6,
    "weightKg": 42.1,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/371.png"
  },
  {
    "id": 372,
    "name": "Shelgon",
    "region": "Hoenn",
    "types": [
      "dragon"
    ],
    "heightM": 1.1,
    "weightKg": 110.5,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/372.png"
  },
  {
    "id": 373,
    "name": "Salamence",
    "region": "Hoenn",
    "types": [
      "dragon",
      "flying"
    ],
    "heightM": 1.5,
    "weightKg": 102.6,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/373.png"
  },
  {
    "id": 374,
    "name": "Beldum",
    "region": "Hoenn",
    "types": [
      "steel",
      "psychic"
    ],
    "heightM": 0.6,
    "weightKg": 95.2,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/374.png"
  },
  {
    "id": 375,
    "name": "Metang",
    "region": "Hoenn",
    "types": [
      "steel",
      "psychic"
    ],
    "heightM": 1.2,
    "weightKg": 202.5,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/375.png"
  },
  {
    "id": 376,
    "name": "Metagross",
    "region": "Hoenn",
    "types": [
      "steel",
      "psychic"
    ],
    "heightM": 1.6,
    "weightKg": 550,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/376.png"
  },
  {
    "id": 377,
    "name": "Regirock",
    "region": "Hoenn",
    "types": [
      "rock"
    ],
    "heightM": 1.7,
    "weightKg": 230,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": true,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/377.png"
  },
  {
    "id": 378,
    "name": "Regice",
    "region": "Hoenn",
    "types": [
      "ice"
    ],
    "heightM": 1.8,
    "weightKg": 175,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": true,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/378.png"
  },
  {
    "id": 379,
    "name": "Registeel",
    "region": "Hoenn",
    "types": [
      "steel"
    ],
    "heightM": 1.9,
    "weightKg": 205,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": true,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/379.png"
  },
  {
    "id": 380,
    "name": "Latias",
    "region": "Hoenn",
    "types": [
      "dragon",
      "psychic"
    ],
    "heightM": 1.4,
    "weightKg": 40,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": true,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/380.png"
  },
  {
    "id": 381,
    "name": "Latios",
    "region": "Hoenn",
    "types": [
      "dragon",
      "psychic"
    ],
    "heightM": 2,
    "weightKg": 60,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": true,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/381.png"
  },
  {
    "id": 382,
    "name": "Kyogre",
    "region": "Hoenn",
    "types": [
      "water"
    ],
    "heightM": 4.5,
    "weightKg": 352,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": true,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/382.png"
  },
  {
    "id": 383,
    "name": "Groudon",
    "region": "Hoenn",
    "types": [
      "ground"
    ],
    "heightM": 3.5,
    "weightKg": 950,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": true,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/383.png"
  },
  {
    "id": 384,
    "name": "Rayquaza",
    "region": "Hoenn",
    "types": [
      "dragon",
      "flying"
    ],
    "heightM": 7,
    "weightKg": 206.5,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": true,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/384.png"
  },
  {
    "id": 385,
    "name": "Jirachi",
    "region": "Hoenn",
    "types": [
      "steel",
      "psychic"
    ],
    "heightM": 0.3,
    "weightKg": 1.1,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": true,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/385.png"
  },
  {
    "id": 386,
    "name": "Deoxys Normal",
    "region": "Hoenn",
    "types": [
      "psychic"
    ],
    "heightM": 1.7,
    "weightKg": 60.8,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": true,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/386.png"
  },
  {
    "id": 387,
    "name": "Turtwig",
    "region": "Sinnoh",
    "types": [
      "grass"
    ],
    "heightM": 0.4,
    "weightKg": 10.2,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": true,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/387.png"
  },
  {
    "id": 388,
    "name": "Grotle",
    "region": "Sinnoh",
    "types": [
      "grass"
    ],
    "heightM": 1.1,
    "weightKg": 97,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/388.png"
  },
  {
    "id": 389,
    "name": "Torterra",
    "region": "Sinnoh",
    "types": [
      "grass",
      "ground"
    ],
    "heightM": 2.2,
    "weightKg": 310,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/389.png"
  },
  {
    "id": 390,
    "name": "Chimchar",
    "region": "Sinnoh",
    "types": [
      "fire"
    ],
    "heightM": 0.5,
    "weightKg": 6.2,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": true,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/390.png"
  },
  {
    "id": 391,
    "name": "Monferno",
    "region": "Sinnoh",
    "types": [
      "fire",
      "fighting"
    ],
    "heightM": 0.9,
    "weightKg": 22,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/391.png"
  },
  {
    "id": 392,
    "name": "Infernape",
    "region": "Sinnoh",
    "types": [
      "fire",
      "fighting"
    ],
    "heightM": 1.2,
    "weightKg": 55,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/392.png"
  },
  {
    "id": 393,
    "name": "Piplup",
    "region": "Sinnoh",
    "types": [
      "water"
    ],
    "heightM": 0.4,
    "weightKg": 5.2,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": true,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/393.png"
  },
  {
    "id": 394,
    "name": "Prinplup",
    "region": "Sinnoh",
    "types": [
      "water"
    ],
    "heightM": 0.8,
    "weightKg": 23,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/394.png"
  },
  {
    "id": 395,
    "name": "Empoleon",
    "region": "Sinnoh",
    "types": [
      "water",
      "steel"
    ],
    "heightM": 1.7,
    "weightKg": 84.5,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/395.png"
  },
  {
    "id": 396,
    "name": "Starly",
    "region": "Sinnoh",
    "types": [
      "normal",
      "flying"
    ],
    "heightM": 0.3,
    "weightKg": 2,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/396.png"
  },
  {
    "id": 397,
    "name": "Staravia",
    "region": "Sinnoh",
    "types": [
      "normal",
      "flying"
    ],
    "heightM": 0.6,
    "weightKg": 15.5,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/397.png"
  },
  {
    "id": 398,
    "name": "Staraptor",
    "region": "Sinnoh",
    "types": [
      "normal",
      "flying"
    ],
    "heightM": 1.2,
    "weightKg": 24.9,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/398.png"
  },
  {
    "id": 399,
    "name": "Bidoof",
    "region": "Sinnoh",
    "types": [
      "normal"
    ],
    "heightM": 0.5,
    "weightKg": 20,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/399.png"
  },
  {
    "id": 400,
    "name": "Bibarel",
    "region": "Sinnoh",
    "types": [
      "normal",
      "water"
    ],
    "heightM": 1,
    "weightKg": 31.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/400.png"
  },
  {
    "id": 401,
    "name": "Kricketot",
    "region": "Sinnoh",
    "types": [
      "bug"
    ],
    "heightM": 0.3,
    "weightKg": 2.2,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/401.png"
  },
  {
    "id": 402,
    "name": "Kricketune",
    "region": "Sinnoh",
    "types": [
      "bug"
    ],
    "heightM": 1,
    "weightKg": 25.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/402.png"
  },
  {
    "id": 403,
    "name": "Shinx",
    "region": "Sinnoh",
    "types": [
      "electric"
    ],
    "heightM": 0.5,
    "weightKg": 9.5,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/403.png"
  },
  {
    "id": 404,
    "name": "Luxio",
    "region": "Sinnoh",
    "types": [
      "electric"
    ],
    "heightM": 0.9,
    "weightKg": 30.5,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/404.png"
  },
  {
    "id": 405,
    "name": "Luxray",
    "region": "Sinnoh",
    "types": [
      "electric"
    ],
    "heightM": 1.4,
    "weightKg": 42,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/405.png"
  },
  {
    "id": 406,
    "name": "Budew",
    "region": "Sinnoh",
    "types": [
      "grass",
      "poison"
    ],
    "heightM": 0.2,
    "weightKg": 1.2,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/406.png"
  },
  {
    "id": 407,
    "name": "Roserade",
    "region": "Sinnoh",
    "types": [
      "grass",
      "poison"
    ],
    "heightM": 0.9,
    "weightKg": 14.5,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/407.png"
  },
  {
    "id": 408,
    "name": "Cranidos",
    "region": "Sinnoh",
    "types": [
      "rock"
    ],
    "heightM": 0.9,
    "weightKg": 31.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/408.png"
  },
  {
    "id": 409,
    "name": "Rampardos",
    "region": "Sinnoh",
    "types": [
      "rock"
    ],
    "heightM": 1.6,
    "weightKg": 102.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/409.png"
  },
  {
    "id": 410,
    "name": "Shieldon",
    "region": "Sinnoh",
    "types": [
      "rock",
      "steel"
    ],
    "heightM": 0.5,
    "weightKg": 57,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/410.png"
  },
  {
    "id": 411,
    "name": "Bastiodon",
    "region": "Sinnoh",
    "types": [
      "rock",
      "steel"
    ],
    "heightM": 1.3,
    "weightKg": 149.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/411.png"
  },
  {
    "id": 412,
    "name": "Burmy",
    "region": "Sinnoh",
    "types": [
      "bug"
    ],
    "heightM": 0.2,
    "weightKg": 3.4,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/412.png"
  },
  {
    "id": 413,
    "name": "Wormadam Plant",
    "region": "Sinnoh",
    "types": [
      "bug",
      "grass"
    ],
    "heightM": 0.5,
    "weightKg": 6.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/413.png"
  },
  {
    "id": 414,
    "name": "Mothim",
    "region": "Sinnoh",
    "types": [
      "bug",
      "flying"
    ],
    "heightM": 0.9,
    "weightKg": 23.3,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/414.png"
  },
  {
    "id": 415,
    "name": "Combee",
    "region": "Sinnoh",
    "types": [
      "bug",
      "flying"
    ],
    "heightM": 0.3,
    "weightKg": 5.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/415.png"
  },
  {
    "id": 416,
    "name": "Vespiquen",
    "region": "Sinnoh",
    "types": [
      "bug",
      "flying"
    ],
    "heightM": 1.2,
    "weightKg": 38.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/416.png"
  },
  {
    "id": 417,
    "name": "Pachirisu",
    "region": "Sinnoh",
    "types": [
      "electric"
    ],
    "heightM": 0.4,
    "weightKg": 3.9,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/417.png"
  },
  {
    "id": 418,
    "name": "Buizel",
    "region": "Sinnoh",
    "types": [
      "water"
    ],
    "heightM": 0.7,
    "weightKg": 29.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/418.png"
  },
  {
    "id": 419,
    "name": "Floatzel",
    "region": "Sinnoh",
    "types": [
      "water"
    ],
    "heightM": 1.1,
    "weightKg": 33.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/419.png"
  },
  {
    "id": 420,
    "name": "Cherubi",
    "region": "Sinnoh",
    "types": [
      "grass"
    ],
    "heightM": 0.4,
    "weightKg": 3.3,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/420.png"
  },
  {
    "id": 421,
    "name": "Cherrim",
    "region": "Sinnoh",
    "types": [
      "grass"
    ],
    "heightM": 0.5,
    "weightKg": 9.3,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/421.png"
  },
  {
    "id": 422,
    "name": "Shellos",
    "region": "Sinnoh",
    "types": [
      "water"
    ],
    "heightM": 0.3,
    "weightKg": 6.3,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/422.png"
  },
  {
    "id": 423,
    "name": "Gastrodon",
    "region": "Sinnoh",
    "types": [
      "water",
      "ground"
    ],
    "heightM": 0.9,
    "weightKg": 29.9,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/423.png"
  },
  {
    "id": 424,
    "name": "Ambipom",
    "region": "Sinnoh",
    "types": [
      "normal"
    ],
    "heightM": 1.2,
    "weightKg": 20.3,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/424.png"
  },
  {
    "id": 425,
    "name": "Drifloon",
    "region": "Sinnoh",
    "types": [
      "ghost",
      "flying"
    ],
    "heightM": 0.4,
    "weightKg": 1.2,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/425.png"
  },
  {
    "id": 426,
    "name": "Drifblim",
    "region": "Sinnoh",
    "types": [
      "ghost",
      "flying"
    ],
    "heightM": 1.2,
    "weightKg": 15,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/426.png"
  },
  {
    "id": 427,
    "name": "Buneary",
    "region": "Sinnoh",
    "types": [
      "normal"
    ],
    "heightM": 0.4,
    "weightKg": 5.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/427.png"
  },
  {
    "id": 428,
    "name": "Lopunny",
    "region": "Sinnoh",
    "types": [
      "normal"
    ],
    "heightM": 1.2,
    "weightKg": 33.3,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/428.png"
  },
  {
    "id": 429,
    "name": "Mismagius",
    "region": "Sinnoh",
    "types": [
      "ghost"
    ],
    "heightM": 0.9,
    "weightKg": 4.4,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/429.png"
  },
  {
    "id": 430,
    "name": "Honchkrow",
    "region": "Sinnoh",
    "types": [
      "dark",
      "flying"
    ],
    "heightM": 0.9,
    "weightKg": 27.3,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/430.png"
  },
  {
    "id": 431,
    "name": "Glameow",
    "region": "Sinnoh",
    "types": [
      "normal"
    ],
    "heightM": 0.5,
    "weightKg": 3.9,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/431.png"
  },
  {
    "id": 432,
    "name": "Purugly",
    "region": "Sinnoh",
    "types": [
      "normal"
    ],
    "heightM": 1,
    "weightKg": 43.8,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/432.png"
  },
  {
    "id": 433,
    "name": "Chingling",
    "region": "Sinnoh",
    "types": [
      "psychic"
    ],
    "heightM": 0.2,
    "weightKg": 0.6,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/433.png"
  },
  {
    "id": 434,
    "name": "Stunky",
    "region": "Sinnoh",
    "types": [
      "poison",
      "dark"
    ],
    "heightM": 0.4,
    "weightKg": 19.2,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/434.png"
  },
  {
    "id": 435,
    "name": "Skuntank",
    "region": "Sinnoh",
    "types": [
      "poison",
      "dark"
    ],
    "heightM": 1,
    "weightKg": 38,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/435.png"
  },
  {
    "id": 436,
    "name": "Bronzor",
    "region": "Sinnoh",
    "types": [
      "steel",
      "psychic"
    ],
    "heightM": 0.5,
    "weightKg": 60.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/436.png"
  },
  {
    "id": 437,
    "name": "Bronzong",
    "region": "Sinnoh",
    "types": [
      "steel",
      "psychic"
    ],
    "heightM": 1.3,
    "weightKg": 187,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/437.png"
  },
  {
    "id": 438,
    "name": "Bonsly",
    "region": "Sinnoh",
    "types": [
      "rock"
    ],
    "heightM": 0.5,
    "weightKg": 15,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/438.png"
  },
  {
    "id": 439,
    "name": "Mime Jr",
    "region": "Sinnoh",
    "types": [
      "psychic",
      "fairy"
    ],
    "heightM": 0.6,
    "weightKg": 13,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/439.png"
  },
  {
    "id": 440,
    "name": "Happiny",
    "region": "Sinnoh",
    "types": [
      "normal"
    ],
    "heightM": 0.6,
    "weightKg": 24.4,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/440.png"
  },
  {
    "id": 441,
    "name": "Chatot",
    "region": "Sinnoh",
    "types": [
      "normal",
      "flying"
    ],
    "heightM": 0.5,
    "weightKg": 1.9,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/441.png"
  },
  {
    "id": 442,
    "name": "Spiritomb",
    "region": "Sinnoh",
    "types": [
      "ghost",
      "dark"
    ],
    "heightM": 1,
    "weightKg": 108,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/442.png"
  },
  {
    "id": 443,
    "name": "Gible",
    "region": "Sinnoh",
    "types": [
      "dragon",
      "ground"
    ],
    "heightM": 0.7,
    "weightKg": 20.5,
    "evolutionStage": 1,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/443.png"
  },
  {
    "id": 444,
    "name": "Gabite",
    "region": "Sinnoh",
    "types": [
      "dragon",
      "ground"
    ],
    "heightM": 1.4,
    "weightKg": 56,
    "evolutionStage": 2,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/444.png"
  },
  {
    "id": 445,
    "name": "Garchomp",
    "region": "Sinnoh",
    "types": [
      "dragon",
      "ground"
    ],
    "heightM": 1.9,
    "weightKg": 95,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/445.png"
  },
  {
    "id": 446,
    "name": "Munchlax",
    "region": "Sinnoh",
    "types": [
      "normal"
    ],
    "heightM": 0.6,
    "weightKg": 105,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/446.png"
  },
  {
    "id": 447,
    "name": "Riolu",
    "region": "Sinnoh",
    "types": [
      "fighting"
    ],
    "heightM": 0.7,
    "weightKg": 20.2,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/447.png"
  },
  {
    "id": 448,
    "name": "Lucario",
    "region": "Sinnoh",
    "types": [
      "fighting",
      "steel"
    ],
    "heightM": 1.2,
    "weightKg": 54,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/448.png"
  },
  {
    "id": 449,
    "name": "Hippopotas",
    "region": "Sinnoh",
    "types": [
      "ground"
    ],
    "heightM": 0.8,
    "weightKg": 49.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/449.png"
  },
  {
    "id": 450,
    "name": "Hippowdon",
    "region": "Sinnoh",
    "types": [
      "ground"
    ],
    "heightM": 2,
    "weightKg": 300,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/450.png"
  },
  {
    "id": 451,
    "name": "Skorupi",
    "region": "Sinnoh",
    "types": [
      "poison",
      "bug"
    ],
    "heightM": 0.8,
    "weightKg": 12,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/451.png"
  },
  {
    "id": 452,
    "name": "Drapion",
    "region": "Sinnoh",
    "types": [
      "poison",
      "dark"
    ],
    "heightM": 1.3,
    "weightKg": 61.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/452.png"
  },
  {
    "id": 453,
    "name": "Croagunk",
    "region": "Sinnoh",
    "types": [
      "poison",
      "fighting"
    ],
    "heightM": 0.7,
    "weightKg": 23,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/453.png"
  },
  {
    "id": 454,
    "name": "Toxicroak",
    "region": "Sinnoh",
    "types": [
      "poison",
      "fighting"
    ],
    "heightM": 1.3,
    "weightKg": 44.4,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/454.png"
  },
  {
    "id": 455,
    "name": "Carnivine",
    "region": "Sinnoh",
    "types": [
      "grass"
    ],
    "heightM": 1.4,
    "weightKg": 27,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/455.png"
  },
  {
    "id": 456,
    "name": "Finneon",
    "region": "Sinnoh",
    "types": [
      "water"
    ],
    "heightM": 0.4,
    "weightKg": 7,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/456.png"
  },
  {
    "id": 457,
    "name": "Lumineon",
    "region": "Sinnoh",
    "types": [
      "water"
    ],
    "heightM": 1.2,
    "weightKg": 24,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/457.png"
  },
  {
    "id": 458,
    "name": "Mantyke",
    "region": "Sinnoh",
    "types": [
      "water",
      "flying"
    ],
    "heightM": 1,
    "weightKg": 65,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/458.png"
  },
  {
    "id": 459,
    "name": "Snover",
    "region": "Sinnoh",
    "types": [
      "grass",
      "ice"
    ],
    "heightM": 1,
    "weightKg": 50.5,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/459.png"
  },
  {
    "id": 460,
    "name": "Abomasnow",
    "region": "Sinnoh",
    "types": [
      "grass",
      "ice"
    ],
    "heightM": 2.2,
    "weightKg": 135.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/460.png"
  },
  {
    "id": 461,
    "name": "Weavile",
    "region": "Sinnoh",
    "types": [
      "dark",
      "ice"
    ],
    "heightM": 1.1,
    "weightKg": 34,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/461.png"
  },
  {
    "id": 462,
    "name": "Magnezone",
    "region": "Sinnoh",
    "types": [
      "electric",
      "steel"
    ],
    "heightM": 1.2,
    "weightKg": 180,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/462.png"
  },
  {
    "id": 463,
    "name": "Lickilicky",
    "region": "Sinnoh",
    "types": [
      "normal"
    ],
    "heightM": 1.7,
    "weightKg": 140,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/463.png"
  },
  {
    "id": 464,
    "name": "Rhyperior",
    "region": "Sinnoh",
    "types": [
      "ground",
      "rock"
    ],
    "heightM": 2.4,
    "weightKg": 282.8,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/464.png"
  },
  {
    "id": 465,
    "name": "Tangrowth",
    "region": "Sinnoh",
    "types": [
      "grass"
    ],
    "heightM": 2,
    "weightKg": 128.6,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/465.png"
  },
  {
    "id": 466,
    "name": "Electivire",
    "region": "Sinnoh",
    "types": [
      "electric"
    ],
    "heightM": 1.8,
    "weightKg": 138.6,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/466.png"
  },
  {
    "id": 467,
    "name": "Magmortar",
    "region": "Sinnoh",
    "types": [
      "fire"
    ],
    "heightM": 1.6,
    "weightKg": 68,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/467.png"
  },
  {
    "id": 468,
    "name": "Togekiss",
    "region": "Sinnoh",
    "types": [
      "fairy",
      "flying"
    ],
    "heightM": 1.5,
    "weightKg": 38,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/468.png"
  },
  {
    "id": 469,
    "name": "Yanmega",
    "region": "Sinnoh",
    "types": [
      "bug",
      "flying"
    ],
    "heightM": 1.9,
    "weightKg": 51.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/469.png"
  },
  {
    "id": 470,
    "name": "Leafeon",
    "region": "Sinnoh",
    "types": [
      "grass"
    ],
    "heightM": 1,
    "weightKg": 25.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/470.png"
  },
  {
    "id": 471,
    "name": "Glaceon",
    "region": "Sinnoh",
    "types": [
      "ice"
    ],
    "heightM": 0.8,
    "weightKg": 25.9,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/471.png"
  },
  {
    "id": 472,
    "name": "Gliscor",
    "region": "Sinnoh",
    "types": [
      "ground",
      "flying"
    ],
    "heightM": 2,
    "weightKg": 42.5,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/472.png"
  },
  {
    "id": 473,
    "name": "Mamoswine",
    "region": "Sinnoh",
    "types": [
      "ice",
      "ground"
    ],
    "heightM": 2.5,
    "weightKg": 291,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/473.png"
  },
  {
    "id": 474,
    "name": "Porygon Z",
    "region": "Sinnoh",
    "types": [
      "normal"
    ],
    "heightM": 0.9,
    "weightKg": 34,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/474.png"
  },
  {
    "id": 475,
    "name": "Gallade",
    "region": "Sinnoh",
    "types": [
      "psychic",
      "fighting"
    ],
    "heightM": 1.6,
    "weightKg": 52,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/475.png"
  },
  {
    "id": 476,
    "name": "Probopass",
    "region": "Sinnoh",
    "types": [
      "rock",
      "steel"
    ],
    "heightM": 1.4,
    "weightKg": 340,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/476.png"
  },
  {
    "id": 477,
    "name": "Dusknoir",
    "region": "Sinnoh",
    "types": [
      "ghost"
    ],
    "heightM": 2.2,
    "weightKg": 106.6,
    "evolutionStage": 3,
    "evolutionLineStages": 3,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/477.png"
  },
  {
    "id": 478,
    "name": "Froslass",
    "region": "Sinnoh",
    "types": [
      "ice",
      "ghost"
    ],
    "heightM": 1.3,
    "weightKg": 26.6,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/478.png"
  },
  {
    "id": 479,
    "name": "Rotom",
    "region": "Sinnoh",
    "types": [
      "electric",
      "ghost"
    ],
    "heightM": 0.3,
    "weightKg": 0.3,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/479.png"
  },
  {
    "id": 480,
    "name": "Uxie",
    "region": "Sinnoh",
    "types": [
      "psychic"
    ],
    "heightM": 0.3,
    "weightKg": 0.3,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": true,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/480.png"
  },
  {
    "id": 481,
    "name": "Mesprit",
    "region": "Sinnoh",
    "types": [
      "psychic"
    ],
    "heightM": 0.3,
    "weightKg": 0.3,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": true,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/481.png"
  },
  {
    "id": 482,
    "name": "Azelf",
    "region": "Sinnoh",
    "types": [
      "psychic"
    ],
    "heightM": 0.3,
    "weightKg": 0.3,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": true,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/482.png"
  },
  {
    "id": 483,
    "name": "Dialga",
    "region": "Sinnoh",
    "types": [
      "steel",
      "dragon"
    ],
    "heightM": 5.4,
    "weightKg": 683,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": true,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/483.png"
  },
  {
    "id": 484,
    "name": "Palkia",
    "region": "Sinnoh",
    "types": [
      "water",
      "dragon"
    ],
    "heightM": 4.2,
    "weightKg": 336,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": true,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/484.png"
  },
  {
    "id": 485,
    "name": "Heatran",
    "region": "Sinnoh",
    "types": [
      "fire",
      "steel"
    ],
    "heightM": 1.7,
    "weightKg": 430,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": true,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/485.png"
  },
  {
    "id": 486,
    "name": "Regigigas",
    "region": "Sinnoh",
    "types": [
      "normal"
    ],
    "heightM": 3.7,
    "weightKg": 420,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": true,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/486.png"
  },
  {
    "id": 487,
    "name": "Giratina Altered",
    "region": "Sinnoh",
    "types": [
      "ghost",
      "dragon"
    ],
    "heightM": 4.5,
    "weightKg": 750,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": true,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/487.png"
  },
  {
    "id": 488,
    "name": "Cresselia",
    "region": "Sinnoh",
    "types": [
      "psychic"
    ],
    "heightM": 1.5,
    "weightKg": 85.6,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": true,
    "isMythical": false,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/488.png"
  },
  {
    "id": 489,
    "name": "Phione",
    "region": "Sinnoh",
    "types": [
      "water"
    ],
    "heightM": 0.4,
    "weightKg": 3.1,
    "evolutionStage": 1,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": true,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/489.png"
  },
  {
    "id": 490,
    "name": "Manaphy",
    "region": "Sinnoh",
    "types": [
      "water"
    ],
    "heightM": 0.3,
    "weightKg": 1.4,
    "evolutionStage": 2,
    "evolutionLineStages": 2,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": true,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/490.png"
  },
  {
    "id": 491,
    "name": "Darkrai",
    "region": "Sinnoh",
    "types": [
      "dark"
    ],
    "heightM": 1.5,
    "weightKg": 50.5,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": true,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/491.png"
  },
  {
    "id": 492,
    "name": "Shaymin Land",
    "region": "Sinnoh",
    "types": [
      "grass"
    ],
    "heightM": 0.2,
    "weightKg": 2.1,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": true,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/492.png"
  },
  {
    "id": 493,
    "name": "Arceus",
    "region": "Sinnoh",
    "types": [
      "normal"
    ],
    "heightM": 3.2,
    "weightKg": 320,
    "evolutionStage": 1,
    "evolutionLineStages": 1,
    "evolvesByStone": false,
    "isStarter": false,
    "isLegendary": false,
    "isMythical": true,
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/493.png"
  }
]

pokemonData.forEach((p) => {
  p.shinySprite = getShinySpriteUrl(p.id)
})
