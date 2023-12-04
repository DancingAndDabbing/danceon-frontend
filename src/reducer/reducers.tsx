/**
 * Default redux setup
 */

import {combineReducers} from 'redux'
import auth from './rootReducer'

const rootReducer = combineReducers({
	auth
})

export default rootReducer
