/**
 * it is cacher
 */

import {isMobile} from '../utils/Helper'

export const CacheTypes = Object.freeze({
	Cursor: 'Cursor',
	Font: 'Font',
	ModelType: 'ModelType',
	SupportedModels: 'SupportedModels',
	UserDeclarations: 'UserDeclarations',
	Skeleton: 'Skeleton',
	UserData: 'UserData',
	FlipCamera: 'FlipCamera',
	ThreeD: 'ThreeD'
})

const getDefaultValue = (type) => {
	let detaultValue = ''
	if (type == CacheTypes.Cursor) {
		detaultValue = 'false'
	} else if (type == CacheTypes.Font) {
		detaultValue = '16'
	} else if (type == CacheTypes.ModelType) {
		detaultValue = isMobile() ? 'lite' : 'full'
	} else if (type == CacheTypes.SupportedModels) {
		detaultValue = 'BlazePose'
	} else if (type == CacheTypes.Skeleton) {
		detaultValue = 'false'
	} else if (type == CacheTypes.UserData) {
		detaultValue = null
	} else if (type == CacheTypes.FlipCamera) {
		detaultValue = 'false'
	} else if (type == CacheTypes.ThreeD) {
		detaultValue = 'false'
	}
	return detaultValue
}

export const getCacheItem = (type) => {
	const item = localStorage.getItem(type)
	return item ? item : getDefaultValue(type)
}

export const setCacheItem = (type, value) => {
	if (Object.values(CacheTypes).includes(type)) {
		return localStorage.setItem(type, value)
	} else {
		alert('first add type:' + type)
	}
}

export const removeCacheItem = (type) => {
	if (Object.values(CacheTypes).includes(type)) {
		localStorage.removeItem(type)
	} else {
		alert('first add type:' + type)
	}
}
