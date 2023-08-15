/**
 * all global functions are declared in this class.
 * we dont have random and abs in reactJs so it convert backs to Math.random and Math.abs accordingly
 * _allPoses are required for posehistory
 */

window.width = 0
window.height = 0
window._allPoses = null
window.lastPose = null

window.PI = Math.PI
window.HALF_PI = Math.PI / 2
window.OPEN = '' //just ignore it because we dont have open anymore
window.frameCount = 0
window.BOLD = '' //to fix example 18
window.video = {time: 30}

window._x = function (value) {
	return window.width - value
}

window._y = function (value) {
	return window.height - value
}

window.videoTime = 0
window.video.time = function () {
	return window.videoTime
}

window.round = function (value) {
	Math.round(value)
}

window.floor = function (value) {
	Math.floor(value)
}

window.max = function (v1, v2) {
	Math.max(v1, v2)
}

window.dist = function (x1, y1, x2, y2) {
	const dx = x2 - x1
	const dy = y2 - y1
	return Math.sqrt(dx * dx + dy * dy)
}

window.random = function (min, max) {
	if (!max) {
		max = window.width //to fix example 9
	}
	const randomDecimal = Math.random()
	const randomInRange = randomDecimal * (max - min)
	const result = randomInRange + min
	return result.toFixed(0)
}

window.cos = function (value) {
	return Math.cos(value)
}

window.sin = function (value) {
	return Math.sin(value)
}

window.abs = function (value) {
	return Math.abs(value).toFixed(0)
}

window.map = function (value, start1, stop1, start2, stop2) {
	//todo..make it porper logic
	return ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2
}

window.color = function (v1, v2, v3, v4) {
	const colorString = `color(${v1},${v2},${v3},${v4})`
	const colorRegex = /color\((\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)/i
	const matches = colorString.match(colorRegex)
	if (matches) {
		const [, r, g, b, a] = matches.map(Number)
		if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255 && a >= 0 && a <= 255) {
			const rgbaColor = `rgba(${r}, ${g}, ${b}, ${a / 255})`
			return rgbaColor
		}
	}
	return 'rgba(1, 1, 1, 1)'
}

window.pastPose = function (pHistory, frames = 0) {
	if (pHistory.length == 0) {
		return window._allPoses
	} else {
		return pHistory[Math.min(pHistory.length - 1, frames)]
	}
}

window.pastParts = function (pHistory, limb, param, start = 0, end = 1, interval = 1) {
	if (pHistory.length == 0) return window._allPoses[limb][param]
	return pHistory
		.slice(start, end)
		.filter((p, i) => i % interval === 0)
		.map((p) => p[limb][param])
}
