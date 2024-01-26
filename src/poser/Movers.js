/**
 * it handles mover functionaity. its contains most of the existing javascript code as it is.
 */

import React, {Component} from 'react'
import {fallbackToDefault, randomIntFromInterval} from '../utils/Helper'

class Mover {
	constructor(args) {
		this.width = 0
		this.height = 0
		this.framesAlive = 0
		this.what = args.what
		this.where = fallbackToDefault(args.where, {})

		this.how = fallbackToDefault(args.how, {})
		this.maxFrames = fallbackToDefault(this.how.frames, 10000)

		//todo..pass width and height to mover
		this.points = fallbackToDefault(this.where.start, {
			x: randomIntFromInterval(0, this.width),
			y: randomIntFromInterval(0, this.height),
			x1: randomIntFromInterval(0, this.width),
			y1: randomIntFromInterval(0, this.height),
			x2: randomIntFromInterval(0, this.width),
			y2: randomIntFromInterval(0, this.height),
			x3: randomIntFromInterval(0, this.width),
			y3: randomIntFromInterval(0, this.height),
			x4: randomIntFromInterval(0, this.width),
			y4: randomIntFromInterval(0, this.height)
		})

		this.velocityX = fallbackToDefault(this.points.velocityX, Math.random(-2, 2))
		this.velocityY = fallbackToDefault(this.points.velocityY, -10)

		this.accelerationX = fallbackToDefault(this.where.accelerationX, 0)
		this.accelerationY = fallbackToDefault(this.where.accelerationY, 0.5)

		// These don't belong in the args going forward as they are not
		// present in the static counterparts
		// * maybe reconsider - could be useful for animations...
		delete this.points.velocityX
		delete this.points.velocityY
		delete this.where.accelerationX
		delete this.where.accelerationY
	}

	// There is a bug if the user provides neither an x or a y value
	update() {
		for (const prop in this.points) {
			if (prop[0] == 'x') this.points[prop] += this.velocityX
			if (prop[0] == 'y') this.points[prop] += this.velocityY
		}

		// I could interpolate here if acceleration is passed an object arg

		this.velocityX += this.accelerationX
		this.velocityY += this.accelerationY

		this.framesAlive += 1
	}

	// function for dealing with key frames
	// This returns an object that should be identical to its static counterpart
	show() {
		let currentHow = {}
		let currentWhere = {}
		Object.assign(currentHow, this.how)

		for (const prop in currentHow) {
			if (Array.isArray(currentHow[prop])) {
				currentHow[prop] = this.interpolate(currentHow[prop])
			}
		}

		for (const prop in this.points) {
			currentWhere[prop] = this.points[prop]
		}
		return {what: this.what, where: currentWhere, how: currentHow}
	}

	// currently only supports numbers, arrays, and colors
	// linear interpolation using lerp() function

	interpolate(fr) {
		let ordered = fr.sort((a, b) => a.frame - b.frame)
		let frames = ordered.map((f) => f.frame)
		let values = ordered.map((f) => f.value)

		let ib = frames.findIndex((i) => i > this.framesAlive)

		if (ib == 0) return values[0]
		else if (ib == -1) return values[values.length - 1]
		else {
			let startFrame = frames[ib - 1]
			let endFrame = frames[ib]

			let startValue = values[ib - 1]
			let endValue = values[ib] // check if types match??

			let interpProgress = (this.framesAlive - startFrame) / (endFrame - startFrame)

			// Number case -> return a simple interpolation
			if (typeof startValue == typeof endValue && typeof endValue == 'number') {
				return this.lerp(startValue, endValue, interpProgress)
			}

			// Array case -> interpolate every value
			if (Array.isArray(startValue) && Array.isArray(endValue)) {
				return startValue.map((sv, i) => this.lerp(sv, endValue[i], interpProgress))
			}

			// Color case -> Use lerpColor function
			if (typeof startValue == typeof endValue && typeof endValue == 'object' && startValue.mode && endValue.mode) {
				// p5.Colors object have mode param
				return this.lerpColor(startValue, endValue, interpProgress)
			}

			// if we can't interpolate (e.g. string, obj) just return the
			// starting value - the object will still change, just not smoothly
			return startValue
		}
	}

	lerp(a, b, alpha) {
		return a + alpha * (b - a)
	}

	lerpColor(startColor, endColor, fraction) {
		const r = Math.round(this.lerp(startColor.r, endColor.r, fraction))
		const g = Math.round(this.lerp(startColor.g, endColor.g, fraction))
		const b = Math.round(this.lerp(startColor.b, endColor.b, fraction))
		const a = startColor.a !== undefined && endColor.a !== undefined ? Math.round(this.lerp(startColor.a, endColor.a, fraction)) : 1

		return `rgba(${r}, ${g}, ${b}, ${a})`
	}
}

class Movers extends Component {
	constructor(props) {
		super(props)
		this.movers = []
		this.maxNum = 100
	}

	add(args) {
		const mover = new Mover(args)
		this.movers.unshift(mover)
	}

	update() {
		this.movers = this.movers.slice(0, this.maxNum).filter((m) => m.framesAlive < m.maxFrames)
		// also maybe filter out objects that are too far out of view
		this.movers.forEach((m) => m.update())
	}

	show() {
		return this.movers.map((m) => m.show()).reverse()
	}

	clear() {
		this.movers = []
	}

	render() {
		return null
	}
}

export default Movers
