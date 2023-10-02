/**
 * Axios is utilized to connect the frontend with the backend.
 * To ensure proper component-based reusability, all APIs have been consolidated in this class.
 * (although you can use the required function in each class where needed.)
 */

import axios from 'axios'
import {CacheTypes, getCacheItem, removeCacheItem, setCacheItem} from '../utils/LocalStorage'

axios.defaults.headers.post['Content-Type'] = 'application/json'
axios.defaults.headers.post['Accept'] = 'application/json'
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*'

export const doSignUp = async (username, password) => {
	let response = {}
	await axios
		.post(`${process.env.REACT_APP_BASE_URL}/user/register`, {username, password})
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

export const doLogin = async (username, password) => {
	let response = {}
	await axios
		.post(`${process.env.REACT_APP_BASE_URL}/user/login`, {username, password})
		.then((res) => {
			if (res) {
				response = res.data.data
			}
		})
		.catch(function (error) {
			console.log(error)
		})
	return response
}

export const doGetAllExamples = async (page, skip) => {
	const user = JSON.parse(getCacheItem(CacheTypes.UserData))
	let response = {}
	await axios
		.get(`${process.env.REACT_APP_BASE_URL}/example/get_examples?id=${user.id}&page=${page}&skip=${skip}`)
		.then((res) => {
			if (res) {
				response = res.data.data
			}
		})
		.catch(function (error) {
			console.log(error)
		})
	return response
}

export const doGetMyExamples = async (page, skip) => {
	const user = JSON.parse(getCacheItem(CacheTypes.UserData))
	let response = {}
	await axios
		.get(`${process.env.REACT_APP_BASE_URL}/example/my_examples?id=${user.id}&page=${page}&skip=${skip}`)
		.then((res) => {
			if (res) {
				response = res.data.data
			}
		})
		.catch(function (error) {
			console.log(error)
		})
	return response
}

export const doAddExamples = async (username, code, title, description, tag, image, userId) => {
	let response = {}
	await axios
		.post(`${process.env.REACT_APP_BASE_URL}/example/create_example`, {username, description: description, title, examples: code, tags: tag, image, userId})
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

export const doDeleteExamples = async (id) => {
	let response = {}
	await axios
		.delete(`${process.env.REACT_APP_BASE_URL}/example/delete_example/${id}`)
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

export const doGetExampleById = async (id) => {
	let response = {}
	await axios
		.get(`${process.env.REACT_APP_BASE_URL}/example?id=${id}`)
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

export const doUpdateExampleById = async (id, code, title, description, tag, image) => {
	let response = {}
	await axios
		.put(`${process.env.REACT_APP_BASE_URL}/example/update_example/${id}`, {code, title, description, tag, image})
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

export const doAutoLogin = async (username, id) => {
	let response = {}
	await axios
		.post(`${process.env.REACT_APP_BASE_URL}/user/auto_login`, {username, id})
		.then((res) => {
			if (res) {
				response = res.data.data
			}
		})
		.catch(function (error) {
			console.log(error)
		})
	return response
}

export const doGetSearchAllExamples = async (page, skip, query) => {
	const user = JSON.parse(getCacheItem(CacheTypes.UserData))
	let response = {}
	await axios
		.get(`${process.env.REACT_APP_BASE_URL}/example/search_all_examples?id=${user.id}&page=${page}&skip=${skip}&query=${query}`)
		.then((res) => {
			if (res) {
				response = res.data.data
			}
		})
		.catch(function (error) {
			console.log(error)
		})
	return response
}

export const doGetSearchMyExamples = async (page, skip, query) => {
	const user = JSON.parse(getCacheItem(CacheTypes.UserData))
	let response = {}
	await axios
		.get(`${process.env.REACT_APP_BASE_URL}/example/search_user_examples?id=${user.id}&page=${page}&skip=${skip}&query=${query}`)
		.then((res) => {
			if (res) {
				response = res.data.data
			}
		})
		.catch(function (error) {
			console.log(error)
		})
	return response
}
