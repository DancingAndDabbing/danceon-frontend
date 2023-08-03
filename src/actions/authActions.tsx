/**
 * Redux setup
 */
export const USER_LOGIN = 'USER_LOGIN'
export const USER_EXAMPLES = 'USER_EXAMPLES'
export const USER_ALL_EXAMPLES = 'USER_ALL_EXAMPLES'
export const SINGLE_EXAMPLE = 'SINGLE_EXAMPLE'

export const loginUser = (data: any) => ({
	type: USER_LOGIN,
	payload: data
})

export const saveUserExamples = (data: any) => ({
	type: USER_EXAMPLES,
	payload: data
})

export const saveAllExamples = (data: any) => ({
	type: USER_ALL_EXAMPLES,
	payload: data
})

export const saveSingleExample = (data: any) => ({
	type: SINGLE_EXAMPLE,
	payload: data
})
