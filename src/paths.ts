export const TODAY_PATH = '/today'
export const TODAY_INVESTIGATION_PATH = `${TODAY_PATH}/investigation`
export const TODAY_SUSPECTS_PATH = `${TODAY_PATH}/suspects`
export const TODAY_ACCUSE_PATH = `${TODAY_PATH}/accuse`
export const TODAY_ENDING_PATH = `${TODAY_PATH}/ending`

export const suspectPath = (suspectId: number) => `${TODAY_SUSPECTS_PATH}/${suspectId}`
export const accusationPath = (suspectId: number) => `${TODAY_ACCUSE_PATH}/${suspectId}`
export const investigationLocationPath = (locationId: string) => `${TODAY_INVESTIGATION_PATH}/${locationId}`
export const endingPath = (status: string) => `${TODAY_ENDING_PATH}/${status}`
