import {createStore} from 'redux'
import rootReducer from './reducer/reducers'

const store = createStore(rootReducer)

export default store
