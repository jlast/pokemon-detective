export const ROOT_PATH = '/'
export const CALLBACK_PATH = '/callback'
export const LOGIN_PATH = '/login'
export const POKEDEX_PATH = '/pokedex'
export const HOW_TO_PLAY_PATH = '/how-to-play'
export const SETTINGS_PATH = '/settings'

export const TODAY_PATH = '/today'
export const TODAY_INVESTIGATION_PATH = `${TODAY_PATH}/investigation`
export const TODAY_SUSPECTS_PATH = `${TODAY_PATH}/suspects`
export const TODAY_ACCUSE_PATH = `${TODAY_PATH}/accuse`
export const TODAY_ENDING_PATH = `${TODAY_PATH}/ending`

export const TODAY_INVESTIGATION_LOCATION_ROUTE = `${TODAY_INVESTIGATION_PATH}/:locationId`
export const TODAY_SUSPECT_FILE_ROUTE = `${TODAY_SUSPECTS_PATH}/:id`
export const TODAY_ACCUSE_ROUTE = `${TODAY_ACCUSE_PATH}/:suspectId`
export const TODAY_ENDING_ROUTE = `${TODAY_ENDING_PATH}/:status`

export const suspectPath = (suspectId: number) => `${TODAY_SUSPECTS_PATH}/${suspectId}`
export const accusationPath = (suspectId: number) => `${TODAY_ACCUSE_PATH}/${suspectId}`
export const investigationLocationPath = (locationId: string) => `${TODAY_INVESTIGATION_PATH}/${locationId}`
export const endingPath = (status: string) => `${TODAY_ENDING_PATH}/${status}`
