/**
 * Axios is utilized to connect the frontend with the backend.
 * To ensure proper component-based reusability, all APIs have been consolidated in this class.
 * (although you can use the required function in each class where needed.)
 */

import axios from 'axios'
import { CacheTypes, getCacheItem, removeCacheItem, setCacheItem } from '../utils/LocalStorage'

//these headers are basic setup. we are working with json thats why application/json is used
axios.defaults.headers.post['Content-Type'] = 'application/json'
axios.defaults.headers.post['Accept'] = 'application/json'
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*'

//pass username and password if user press signup button. authentication of username and password is done from calling function
// we are pasing valid response.data in case its success and in case of failure, an empty object, {} will be sent to calling function
export const doSignUp = async (username, password) => {
	let response = {}
	await axios
		.post(`${process.env.REACT_APP_BASE_URL}/signup`, { username, password })
		.then((res) => {
			if (res) {
				response = res.data
			}
		})
		.catch(function (error) {
			console.log(error)
		})
	return response
}

//pass username and password if user press signin button
// we are pasing valid response.data in case its success and in case of failure, an empty object, {} will be sent to calling function
export const doLogin = async (username, password) => {
	let response = {}
	await axios
		.post(`${process.env.REACT_APP_BASE_URL}/login`, { username, password })
		.then((res) => {
			if (res) {
				response = res.data
			}
		})
		.catch(function (error) {
			console.log(error)
		})
	return response
}

//this is get fuction and we are fetching all exmaples from database
// pagination is used as per 1,2,3, 4 page no
export const doGetAllExamples = async (page, skip) => {
	const user = JSON.parse(getCacheItem(CacheTypes.UserData))
	let response = {}
	await axios
		.get(`${process.env.REACT_APP_BASE_URL}/examples/files?id=${user.id}&page=${page}&skip=${skip}`)
		.then((res) => {
			if (res) {
				response = res.data
			}
		})
		.catch(function (error) {
			console.log(error)
		})
	return response
}

//this is get fuction and we are fetching my exmaples/loggein user examples from database
// pagination is used as per 1,2,3, 4 page no
export const doGetMyExamples = async (page, skip) => {
	const user = JSON.parse(getCacheItem(CacheTypes.UserData))
	let response = {}
	await axios
		.get(`${process.env.REACT_APP_BASE_URL}/examples/my_examples?id=${user.id}&page=${page}&skip=${skip}`)
		.then((res) => {
			if (res) {
				response = res.data
			}
		})
		.catch(function (error) {
			console.log(error)
		})
	return response
}

//this function is used to add exmaple to database
//data validation is done from calling function
export const doAddExamples = async (username, code, title, description, tag, image, userId) => {
	let response = {}
	await axios
		.post(`${process.env.REACT_APP_BASE_URL}/examples`, { username, desc: description, title, code, tag, image, userId })
		.then((res) => {
			if (res) {
				response = res.data
			}
		})
		.catch(function (error) {
			console.log(error)
		})
	return response
}

//this function delete examples from database
export const doDeleteExamples = async (id) => {
	let response = {}
	await axios
		.delete(`${process.env.REACT_APP_BASE_URL}/examples?dbID=${id}`)
		.then((res) => {
			if (res) {
				response = res.data
			}
		})
		.catch(function (error) {
			console.log(error)
		})
	return response
}

//this function is used to get specefic exmaple by its database id
export const doGetExampleById = async (id) => {
	let response = {}
	await axios
		.get(`${process.env.REACT_APP_BASE_URL}/examples?dbID=${id}`)
		.then((res) => {
			if (res) {
				response = res.data
			}
		})
		.catch(function (error) {
			console.log(error)
		})
	return response
}

//this function is used to update specefic exmaple by its database id
export const doUpdateExampleById = async (id, code, title, description, tag, image) => {
	let response = {}
	await axios
		.put(`${process.env.REACT_APP_BASE_URL}/examples/update?dbID=${id}`, { code, title, description, tag, image })
		.then((res) => {
			if (res) {
				response = res.data
			}
		})
		.catch(function (error) {
			console.log(error)
		})
	return response
}

//this function is used to do auto login
export const doAutoLogin = async (username, id) => {
	let response = {}
	await axios
		.post(`${process.env.REACT_APP_BASE_URL}/login/auto_login`, { username, id })
		.then((res) => {
			if (res) {
				response = res.data
			}
		})
		.catch(function (error) {
			console.log(error)
		})
	return response
}

//this function is used to search all saved examples
export const doGetSearchAllExamples = async (page, skip, query) => {
	const user = JSON.parse(getCacheItem(CacheTypes.UserData))
	let response = {}
	await axios
		.get(`${process.env.REACT_APP_BASE_URL}/examples/search_all_examples?id=${user.id}&page=${page}&skip=${skip}&query=${query}`)
		.then((res) => {
			if (res) {
				response = res.data
			}
		})
		.catch(function (error) {
			console.log(error)
		})
	return response
}

//this function is used to search my saved examples
export const doGetSearchMyExamples = async (page, skip, query) => {
	const user = JSON.parse(getCacheItem(CacheTypes.UserData))
	let response = {}
	await axios
		.get(`${process.env.REACT_APP_BASE_URL}/examples/search_my_examples?id=${user.id}&page=${page}&skip=${skip}&query=${query}`)
		.then((res) => {
			if (res) {
				response = res.data
			}
		})
		.catch(function (error) {
			console.log(error)
		})
	return response
}
