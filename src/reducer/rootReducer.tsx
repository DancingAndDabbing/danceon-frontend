/**
 * Redux setup
 */

import {USER_ALL_EXAMPLES, USER_EXAMPLES, USER_LOGIN, SINGLE_EXAMPLE} from '../actions/authActions'

const initialState = {
	login: false,
	userExamples: {examples: [], totalRecords: 0, page: 1},
	allExamples: {examples: [], totalRecords: 0, page: 1},
	singleExample: {}
}

const rootReducer = (state = initialState, action) => {
	switch (action.type) {
		case USER_LOGIN:
			return {...state, login: action.payload}
		case USER_EXAMPLES:
			return {...state, userExamples: action.payload}

		case USER_ALL_EXAMPLES:
			return {...state, allExamples: action.payload}

		case SINGLE_EXAMPLE:
			return {...state, singleExample: action.payload}

		default:
			return state
	}
}

export default rootReducer
