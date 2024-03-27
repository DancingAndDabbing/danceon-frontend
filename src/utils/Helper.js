/**
 * in this class we delcares all the re-usable functions
 */

//variables
export const INVISIBLE_COLOR = 'rgba(255, 255, 255, 0)'

export const DEFAULT_LINE_WIDTH = 2

export const DEFAULT_LINE_HEIGHT = 100

export const DEFAULT_DIAMETER = 30

export const DEFAULT_RADIUS = 4

export const SCORE_THRESHOLD = 0.65

export const DECIMAL_THRESHOLD = 5

export const KEY_POINT_TO_USE = ['nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear', 'mouth_left', 'mouth_right', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_pinky', 'right_pinky', 'left_index', 'right_index', 'left_thumb', 'right_thumb', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle', 'left_heel', 'right_heel', 'left_foot_index', 'right_foot_index']

// export const WHAT_TO_USE = ['circle', 'text', 'arc', 'ellipse', 'line', 'point', 'quad', 'rect', 'square', 'triangle', 'curve', 'heart']

export const KEY_POINT_NOT_TO_USE = ['left_eye_inner', 'left_eye_outer', 'right_eye_inner', 'right_eye_outer']

/*
Origin Shift Issue

if you add 100 in pose.nose.x it should go to right side
if you minus 100 from pose.nose.x it should go to left side

if you add 100 in pose.nose.y it should go to up side
if you subtract 100 from pose.nose.x it should go down side

but in current code origin is masked to bottom left and its not handling +, - operator as per the origin change.

To fix this we can do this stuff:

Introduce some special operator for + and - and these operators will handle + as - and - as +
or
Implement something like where_addition

where: {x:pose.nose.x, y:pose.nose.y}
where_addition: {x:10, y:10}

now you can manipulate the logic for pose.nose.x+10  easily as per origin change
*/
export const IS_ORIGIN_CONVERTED = false

export const SHAPES = {
	CIRCLE: 'circle',
	TEXT: 'text',
	ARC: 'arc',
	ELLIPSE: 'ellipse',
	LINE: 'line',
	POINT: 'point',
	QUAD: 'quad',
	RECT: 'rect',
	SQUARE: 'square',
	TRIANGLE: 'triangle',
	CURVE: 'curve',
	BEZIER_CURVE: 'beziercurve',
	HEART: 'heart'
}

export const POSE_PART_POSITIONS = [
	{caption: 'x', value: 'x', meta: 'property'},
	{caption: 'y', value: 'y', meta: 'property'}
	//{caption: 'z', value: 'z', meta: 'property'}
]

export const WHAT_TO_DRAW_WORDS = [
	{caption: 'circle', value: " 'circle',", meta: 'string'},
	{caption: 'line', value: " 'line',", meta: 'string'},
	{caption: 'point', value: " 'point',", meta: 'string'},
	{caption: 'ellipse', value: " 'ellipse',", meta: 'string'},
	{caption: 'square', value: " 'square',", meta: 'string'},
	{caption: 'rect', value: " 'rect',", meta: 'string'},
	{caption: 'arc', value: " 'arc',", meta: 'string'},
	{caption: 'circle', value: " 'circle',", meta: 'string'},
	{caption: 'quad', value: " 'quad',", meta: 'string'},
	{caption: 'triangle', value: " 'triangle',", meta: 'string'},
	{caption: 'text', value: " 'text',", meta: 'string'},
	{caption: 'shape', value: " 'shape',", meta: 'string'},
	{caption: 'curve', value: " 'curve',", meta: 'string'},
	{caption: 'heart', value: " 'heart',", meta: 'string'}
]

export const WORD_LIST = [
	{caption: 'pose', value: 'pose', meta: 'object'},
	{caption: 'fill', value: 'fill: "white",', meta: 'property'},
	{caption: 'stroke', value: 'stroke: "white",', meta: 'property'},
	{caption: 'strokeWeight', value: 'strokeWeight: 1,', meta: 'property'},
	{caption: 'what', value: 'what', meta: 'property'},
	{caption: 'where', value: 'where: {},', meta: 'property'},
	{caption: 'when', value: 'when: true,', meta: 'property'},
	{caption: 'how', value: 'how: {},', meta: 'property'},
	{caption: 'start', value: 'start: {},', meta: 'property'}
]

export const ANCHOR_POINTS = [
	[0, 0, 0],
	[0, 1, 0],
	[-1, 0, 0],
	[-1, -1, 0]
]

export const VIDEO_SIZE = {
	'640 X 480': {width: 640, height: 480},
	'640 X 360': {width: 640, height: 360},
	'360 X 270': {width: 360, height: 270}
}

export const returnCondition = (when, pose) => {
	if (typeof when === 'function') return when(pose)
	else return when // More error checking?
}

export const countDecimalPlaces = (number) => {
	const decimalPart = (number.toString().split('.')[1] || '').length
	return decimalPart
}

export const convertOrigin = (x, y, height, width) => {
	if (IS_ORIGIN_CONVERTED) {
		//if its camera than pass width
		if (countDecimalPlaces(x) <= DECIMAL_THRESHOLD && countDecimalPlaces(y) <= DECIMAL_THRESHOLD) {
			//user type both x/y manually
			return {_x: width ? width - x : x, _y: height - y}
		} else if (countDecimalPlaces(x) <= DECIMAL_THRESHOLD && countDecimalPlaces(y) > DECIMAL_THRESHOLD) {
			//user type only x manually and y by selection
			return {_x: width ? width - x : x, _y: y}
		} else if (countDecimalPlaces(x) > DECIMAL_THRESHOLD && countDecimalPlaces(y) <= DECIMAL_THRESHOLD) {
			//user type x by selection and y manually
			return {_x: x, _y: height - y}
		} else {
			//both selection
			return {_x: x, _y: y}
		}
	} else {
		if (countDecimalPlaces(x) <= DECIMAL_THRESHOLD && countDecimalPlaces(y) <= DECIMAL_THRESHOLD) {
			return {_x: width ? width - x : x, _y: y}
		} else if (countDecimalPlaces(x) <= DECIMAL_THRESHOLD && countDecimalPlaces(y) > DECIMAL_THRESHOLD) {
			return {_x: width ? width - x : x, _y: y}
		} else if (countDecimalPlaces(x) > DECIMAL_THRESHOLD && countDecimalPlaces(y) <= DECIMAL_THRESHOLD) {
			return {_x: x, _y: y}
		} else {
			return {_x: x, _y: y}
		}
		// or return {_x: x, _y: y}
	}
}

export const convertCursorOrigin = (x, y, height, width) => {
	if (IS_ORIGIN_CONVERTED) {
		return {_x: width ? (width - x).toFixed(2) : x, _y: parseFloat((height - y).toFixed(2))}
	} else {
		return {_x: width ? (width - x).toFixed(2) : x, _y: parseFloat(Number(y).toFixed(2))}
	}
}

export const constrain = (value, min, max) => {
	if (value < min) {
		return min
	} else if (value > max) {
		return max
	} else {
		return value
	}
}

//functions
export const splitArgs = (args) => {
	let lengths = {}
	let argsList = []

	for (const [key, val] of Object.entries(args)) {
		if (Array.isArray(val)) lengths[key] = val.length
	}

	// If none of the provided arguments are arrays, we can
	// return here
	if (!Object.keys(lengths).length) return [args]

	let lengthArr = Object.values(lengths)
	// check to ensure all array lengths are equal
	/*if (!(lengthArr.every( (val, i, arr) => val === arr[0] ))) {
		throw `All array lengths in bind aren't equal. ${Object.entries(lengths)}`;
		return false;
	}*/

	// generate a new list of arguments
	// The final list is as long as the shortest list argument
	// This protects errors from cases that use a partial history
	let l = Math.min(...lengthArr)
	for (let i = 0; i < l; i++) {
		let newArgs = {}

		for (const [key, val] of Object.entries(args)) {
			if (Array.isArray(val)) newArgs[key] = val[i]
			else newArgs[key] = val
		}
		argsList.push(newArgs)
	}

	return argsList
}

export const fallbackToDefault = (val, def) => {
	if (val === undefined) return def
	else return val
}

export const convertToML5Structure = (pose) => {
	if (!pose) {
		return
	}
	let newPose = {keypoints: [], score: pose.score}

	pose.filter((kp) => KEY_POINT_TO_USE.includes(kp.name)).forEach((kp, i) => {
		newPose.keypoints.push({
			part: underscore_to_camelCase(kp.name), // function from helpers
			score: kp.score, // posenet used confidence rather than score...
			position: {
				x: kp.x,
				y: kp.y
				//z: kp.z
			}
		})
		newPose[underscore_to_camelCase(kp.name)] = {
			x: kp.x,
			y: kp.y,
			//z: kp.z,
			score: kp.score
		}
	})
	return newPose
}

export const underscore_to_camelCase = (old_word) => {
	let newWord = old_word.replace(/_([a-z])/g, (m, w) => w.toUpperCase())
	return newWord
}

//this check either browser is being used as in mobile or in web view
export const isMobile = () => {
	const userAgent = window.navigator.userAgent.toLowerCase()
	const mobileKeywords = ['iphone', 'ipad', 'android', 'blackberry', 'windows phone']
	return mobileKeywords.some((keyword) => userAgent.includes(keyword))
}

export const POSE_PARTS = KEY_POINT_TO_USE.map((kp) => {
	return {
		caption: underscore_to_camelCase(kp),
		value: underscore_to_camelCase(kp),
		meta: 'property'
	}
})

//this is universal fucntion to calculate random value form 2 given numbers
export const randomIntFromInterval = (min, max) => {
	return Math.floor(Math.random() * (max - min + 1) + min)
}

//this is universal fucntion to calculate distance from 2 given points in x1,y1 and x2,y2
export const calculateDistance = (x1, y1, x2, y2) => {
	const deltaX = x2 - x1
	const deltaY = y2 - y1
	const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
	return distance
}
