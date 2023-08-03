/**
 * it draws all shapes on camera and video canvas. almost all of the code is custom and written from scratch
 */

import {
	DEFAULT_LINE_WIDTH,
	DEFAULT_DIAMETER,
	DEFAULT_LINE_HEIGHT,
	DEFAULT_RADIUS,
	SHAPES,
	returnCondition,
	splitArgs,
	fallbackToDefault,
	convertToML5Structure,
	randomIntFromInterval,
	convertOrigin,
	convertCursorOrigin,
	constrain,
	calculateDistance
} from '../utils/Helper'
import {CacheTypes, getCacheItem, setCacheItem} from '../utils/LocalStorage'

export class Draw {
	constructor(props, isCamera) {
		this.ctx = props
		this.isCamera = isCamera
		this.isFlip = getCacheItem(CacheTypes.FlipCamera) == 'false' ? false : true
		this.originWidth = isCamera ? this.ctx.canvas.width : null
		this.centerX = this.ctx.canvas.width / 2
		this.centerY = this.ctx.canvas.height / 2
		this.randomLinesInterval = null
		this.isVideoPaused = false
		this.videoWidth = 0
		this.videoHeight = 0
		this.poseHistory = []
	}

	flip() {
		this.isFlip = this.isCamera ? (getCacheItem(CacheTypes.FlipCamera) == 'false' ? false : true) : false
	}

	updateDrawDimension(width, height) {
		window.width = width
		window.height = height
		this.ctx.canvas.width = width
		this.ctx.canvas.height = height
		this.originWidth = this.isCamera ? this.ctx.canvas.width : null
		this.centerX = this.ctx.canvas.width / 2
		this.centerY = this.ctx.canvas.height / 2
		const rect = this.ctx.canvas.getBoundingClientRect()
		this.videoWidth = rect.width
		this.videoHeight = rect.height
	}

	drawCursor(x, y, isCursor, pose) {
		if (this.isCamera) {
			if (isCursor) {
				let w = 40
				let h = 30

				let {_x, _y} = convertCursorOrigin(x, y, this.ctx.canvas.height, this.originWidth)

				this.ctx.fillStyle = 'rgba(30, 30, 30, 0.5)'
				this.ctx.strokeStyle = 'rgba(30, 30, 30, 0.5)'
				this.ctx.lineWidth = DEFAULT_LINE_WIDTH

				const rect = new Path2D()
				if (this.isFlip) {
					rect.rect(constrain(this.ctx.canvas.width - x, 0, this.ctx.canvas.width - w), constrain(y, 0, this.ctx.canvas.height - 30), w, h)
				} else {
					rect.rect(constrain(x, 0, this.ctx.canvas.width - w), constrain(y, 0, this.ctx.canvas.height - 30), w, h)
				}
				this.ctx.fill(rect)

				this.ctx.save()
				if (this.isFlip) {
					this.ctx.translate(this.ctx.canvas.width, 0)
					this.ctx.scale(-1, 1)
				}
				this.ctx.fillStyle = 'white'
				this.ctx.font = '14px Arial'
				this.ctx.textAlign = 'left'
				this.ctx.textBaseline = 'middle'

				let xText = (this.ctx.canvas.width - _x).toFixed(0)
				xText = xText <= 0 ? 0 : xText

				_y = _y <= 1 ? 0 : _y //todo..hard fix to show 0
				let yText = _y.toFixed(0)

				const text = 'y:' + yText + '\nx:' + xText
				const lines = text.split('\n')
				lines.forEach((line, index) => {
					const yConstrain = index == 1 ? this.ctx.canvas.height - 20 : this.ctx.canvas.height - 8
					if (this.isFlip) {
						this.ctx.fillText(line, constrain(x - 38, 0, this.ctx.canvas.width - w), constrain(20 + parseFloat(y) - index * 12, 0, yConstrain))
					} else {
						this.ctx.fillText(line, constrain(x, 0, this.ctx.canvas.width - w), constrain(20 + parseFloat(y) - index * 12, 0, yConstrain))
					}
				})
			}
			if (pose) {
				if (!isCursor) {
					this.ctx.save()
					if (this.isFlip) {
						this.ctx.translate(this.ctx.canvas.width, 0)
						this.ctx.scale(-1, 1)
					}
				}
				pose.keypoints.forEach((p, i) => {
					let sx = p.x
					let sy = p.y
					if (calculateDistance(x, y, sx, sy) < 8) {
						this.ctx.fillStyle = 'white'
						this.ctx.font = '14px Arial'
						this.ctx.textAlign = 'left'
						this.ctx.textBaseline = 'middle'
						const name = p.name.includes('left') ? p.name.replace('left', 'right') : p.name.replace('right', 'left')
						this.ctx.fillText(name, sx, sy + 20)
					}
				})
			}
			this.ctx.restore()
		} else {
			if (isCursor) {
				let w = this.videoWidth > this.videoHeight ? 100 : 240
				let h = w / 2

				let _x = (this.ctx.canvas.width / this.videoWidth) * x
				_x = parseFloat(_x.toFixed(0))

				let _y = (this.ctx.canvas.height / this.videoHeight) * y
				_y = parseFloat(_y.toFixed(0))

				let {_x: x2, _y: y2} = convertOrigin(_x, _y, this.ctx.canvas.height, this.isFlip ? this.originWidth : null)

				this.ctx.fillStyle = 'rgba(30, 30, 30, 0.5)'
				this.ctx.strokeStyle = 'rgba(30, 30, 30, 0.5)'
				this.ctx.lineWidth = DEFAULT_LINE_WIDTH

				const rect = new Path2D()
				if (this.videoWidth < this.videoHeight) {
					//potrait
					rect.rect(constrain(x2, 0, this.ctx.canvas.width - w), constrain(this.ctx.canvas.height - y2, 0, this.ctx.canvas.height - 160), w, h)
				} else {
					//landscape
					rect.rect(constrain(x2, 0, this.ctx.canvas.width - w), constrain(this.ctx.canvas.height - y2, 30, this.ctx.canvas.height - 60), w, h)
				}
				this.ctx.fill(rect)

				this.ctx.fillStyle = 'white'
				this.ctx.font = '56px Arial'
				this.ctx.textAlign = 'left'
				this.ctx.textBaseline = 'middle'

				let xText = _x.toFixed(0)
				xText = xText <= 0 ? 0 : xText

				let yText = (this.ctx.canvas.height - _y).toFixed(0)
				yText = yText <= 0 ? 0 : yText

				const text = 'y:' + yText + '\nx:' + xText
				const lines = text.split('\n')
				lines.forEach((line, index) => {
					const yConstrain = index == 1 ? this.ctx.canvas.height - 130 : this.ctx.canvas.height - 70
					this.ctx.fillText(line, constrain(x2 + 20, 0, this.ctx.canvas.width - w), constrain(parseFloat(this.ctx.canvas.height - y2) + 80 - index * 60, 0, yConstrain))
				})
			}
			if (pose) {
				pose.keypoints.forEach((p, i) => {
					let sx = p.x
					let sy = p.y
					if (calculateDistance(x, y, sx, sy) < 8) {
						this.ctx.fillStyle = 'white'
						this.ctx.font = '14px Arial'
						this.ctx.textAlign = 'left'
						this.ctx.textBaseline = 'middle'
						const name = p.name //.includes('left') ? p.name.replace('left', 'right') : p.name.replace('right', 'left')
						this.ctx.fillText(name, sx, sy + 20)
					}
				})
			}
		}
	}

	drawShapes(poser, keyPoints) {
		if (poser && keyPoints) {
			const allPoses = convertToML5Structure(keyPoints)
			window._allPoses = allPoses
			// let scaledPoseUnfilled = allPoses //scalePoseToWindow(allPoses)
			// let scaledPose = scaledPoseUnfilled //fillInEmptyPoints(scaledPoseUnfilled, this.poseHistory)
			if (!this.isVideoPaused) {
				this.poseHistory.unshift(allPoses)
				if (this.poseHistory.length >= 1000) {
					this.poseHistory.pop()
				}
			}
			this.execute(allPoses, this.poseHistory, 0, poser)
		}
	}

	execute(allPoses, poseHistory, tm, poser) {
		try {
			let newFuncList = poser.declarations.func(allPoses, poseHistory, tm)
			if (!newFuncList.length) {
				// empty
				// if (!this.usingOldCode) this.callEventListenersIfStateChange('starting')
				return
			}
			newFuncList.forEach((ff, i) => {
				// dynamic or static
				let type = 'static'
				// fix - if (ff.where != undefined)
				if (ff.where == undefined) {
					type = 'static'
				} else if (ff.where.start != undefined) {
					type = 'dynamic'
				}
				let when = fallbackToDefault(ff.when, true)
				if (returnCondition(when, allPoses)) {
					if (type == 'static') {
						let where = fallbackToDefault(ff.where, {})
						let how = fallbackToDefault(ff.how, {})

						let whereList = splitArgs(where) // false or list
						let howList = splitArgs(how)

						// if either is false - there is something wrong

						let bindings = []
						let numberOfBindings

						// If either list has only length one - apply its values
						// to everything
						if (whereList.length == 1 || howList.length == 1) {
							numberOfBindings = Math.max(whereList.length, howList.length)
						} else {
							numberOfBindings = Math.min(whereList.length, howList.length)
						}

						for (let i = 0; i < numberOfBindings; i++) {
							let w, h

							if (whereList.length == 1) w = whereList[0]
							else w = whereList[i]

							if (howList.length == 1) h = howList[0]
							else h = howList[i]

							bindings.push({what: ff.what, where: w, how: h})
						}

						if (bindings) {
							bindings.forEach((b) => this.draw(b))
						}
					}
					// framesToActivate parameter?
					else if (type == 'dynamic') {
						poser.movers.add(ff)
					}
				}
			})
			poser.movers.update()
			let funcArray = poser.movers.show()
			funcArray.forEach((ff) => {
				this.draw(ff)
			})
			poser.addWorkingCodeToHistory()
		} catch (e) {
			console.log(e)
		}
	}

	draw(targetPose) {
		switch (targetPose.what) {
			case SHAPES.TEXT.toLowerCase():
				this.drawText(targetPose)
				break
			case SHAPES.ARC.toLowerCase():
				this.drawArc(targetPose)
				break
			case SHAPES.CIRCLE.toLowerCase():
				this.drawCircle(targetPose)
				break
			case SHAPES.ELLIPSE.toLowerCase():
				this.drawEllipse(targetPose)
				break
			case SHAPES.LINE.toLowerCase():
				this.drawLine(targetPose)
				break
			case SHAPES.POINT.toLowerCase():
				this.drawPoint(targetPose)
				break
			case SHAPES.QUAD.toLowerCase():
				this.drawQuad(targetPose)
				break
			case SHAPES.RECT.toLowerCase():
				this.drawRect(targetPose)
				break
			case SHAPES.SQUARE.toLowerCase():
				this.drawSquare(targetPose)
				break
			case SHAPES.TRIANGLE.toLowerCase():
				this.drawTriangle(targetPose)
				break
			case SHAPES.CURVE.toLowerCase():
				this.drawCurve(targetPose)
				break
			case SHAPES.BEZIER_CURVE.toLowerCase():
				this.drawBezierCurve(targetPose)
				break
			case SHAPES.HEART.toLowerCase():
				this.drawHeart(targetPose)
				break
			default:
				break
		}
	}

	clearRandomLines = async () => {
		clearInterval(this.randomLinesInterval)
	}

	drawLoadingMessage = async (message, color, isCamera = true) => {
		await this.clearRandomLines()
		this.drawRandomLines(color, message, isCamera)
	}

	drawRandomLines(color, message, isCamera) {
		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
		const targetPose = {what: 'text', text: message, where: {x: this.centerX, y: this.centerY}}
		if (isCamera) {
			this.ctx.save()
			if (this.isFlip) {
				this.ctx.translate(this.ctx.canvas.width, 0)
				this.ctx.scale(-1, 1)
			}
		}
		this.ctx.fillStyle = color
		this.ctx.font = `32px Helvetica`
		this.ctx.textAlign = 'center'
		this.ctx.textBaseline = 'middle'
		this.ctx.fillText(message, targetPose.where.x, targetPose.where.y)
		if (isCamera) {
			this.ctx.restore()
		}
		this.ctx.fillStyle = color
		this.ctx.lineWidth = DEFAULT_LINE_WIDTH / 2

		for (let i = 0; i < 20; i++) {
			let x1 = randomIntFromInterval(10, this.ctx.canvas.width)
			let y1 = randomIntFromInterval(20, this.ctx.canvas.height)
			let x2 = randomIntFromInterval(20, this.ctx.canvas.width)
			let y2 = randomIntFromInterval(10, this.ctx.canvas.height)

			const line = new Path2D()
			line.moveTo(x1, y1)
			line.lineTo(x2, y2)
			this.ctx.beginPath(line)
			this.ctx.stroke(line)
		}
	}

	drawText(targetPose) {
		if (this.isCamera) {
			this.ctx.save()
			if (this.isFlip) {
				this.ctx.translate(this.ctx.canvas.width, 0)
				this.ctx.scale(-1, 1)
			}
		}
		let x = fallbackToDefault(targetPose.where.x, randomIntFromInterval(0, this.ctx.canvas.width))
		let y = fallbackToDefault(targetPose.where.y, randomIntFromInterval(0, this.ctx.canvas.height))
		let {_x, _y} = convertOrigin(x, y, this.ctx.canvas.height, this.isFlip ? this.originWidth : null)

		let text = fallbackToDefault(targetPose.how.str, 'Words, words, words.')
		let textSize = fallbackToDefault(targetPose.how.textSize, 32)
		let textAlign = fallbackToDefault(targetPose.how.textAlign, 'center')
		let textFont = fallbackToDefault(targetPose.how.textFont, 'Helvetica')

		this.ctx.fillStyle = fallbackToDefault(targetPose.how.fill, 'White')
		this.ctx.font = `${textSize}px ${textFont}`
		this.ctx.textAlign = textAlign
		this.ctx.fillText(text, _x, _y)
		if (this.isCamera) {
			this.ctx.restore()
		}
	}

	drawCircle(targetPose) {
		let x = fallbackToDefault(targetPose.where.x, randomIntFromInterval(0, this.ctx.canvas.width))
		let y = fallbackToDefault(targetPose.where.y, randomIntFromInterval(0, this.ctx.canvas.height))
		let d = fallbackToDefault(targetPose.how.d, DEFAULT_DIAMETER)
		let {_x, _y} = convertOrigin(x, y, this.ctx.canvas.height, this.isFlip ? this.originWidth : null)

		this.ctx.fillStyle = fallbackToDefault(targetPose.how.fill, 'White')
		this.ctx.strokeStyle = fallbackToDefault(targetPose.how.stroke, 'White')
		this.ctx.lineWidth = fallbackToDefault(targetPose.how.strokeWeight, DEFAULT_LINE_WIDTH)

		const circle = new Path2D()
		circle.arc(_x, _y, d, 0, Math.PI * 2)
		this.ctx.fill(circle)
		this.ctx.stroke(circle)
	}

	drawArc(targetPose) {
		let x = fallbackToDefault(targetPose.where.x, randomIntFromInterval(0, this.ctx.canvas.width))
		let y = fallbackToDefault(targetPose.where.y, randomIntFromInterval(0, this.ctx.canvas.height))
		let w = fallbackToDefault(targetPose.how.w, DEFAULT_DIAMETER)
		let h = fallbackToDefault(targetPose.how.h, w)
		let r = fallbackToDefault(targetPose.how.r, w)
		let {_x, _y} = convertOrigin(x, y, this.ctx.canvas.height, this.isFlip ? this.originWidth : null)

		let start = fallbackToDefault(targetPose.how.start, 0)
		let stop = fallbackToDefault(targetPose.how.stop, Math.PI)

		const circle = new Path2D()
		circle.arc(_x, _y, r, start, stop)

		this.ctx.fillStyle = fallbackToDefault(targetPose.how.fill, 'White')
		this.ctx.strokeStyle = fallbackToDefault(targetPose.how.stroke, 'White')
		this.ctx.lineWidth = fallbackToDefault(targetPose.how.strokeWeight, DEFAULT_LINE_WIDTH)

		this.ctx.fill(circle)
		this.ctx.stroke(circle)
	}

	drawEllipse(targetPose) {
		let x = fallbackToDefault(targetPose.where.x, randomIntFromInterval(0, this.ctx.canvas.width))
		let y = fallbackToDefault(targetPose.where.y, randomIntFromInterval(0, this.ctx.canvas.height))
		let w = fallbackToDefault(targetPose.how.w, DEFAULT_LINE_HEIGHT)
		let h = fallbackToDefault(targetPose.how.h, w / 2)
		let {_x, _y} = convertOrigin(x, y, this.ctx.canvas.height, this.isFlip ? this.originWidth : null)

		this.ctx.fillStyle = fallbackToDefault(targetPose.how.fill, 'White')
		this.ctx.strokeStyle = fallbackToDefault(targetPose.how.stroke, 'White')
		this.ctx.lineWidth = fallbackToDefault(targetPose.how.strokeWeight, 2)

		const ellips = new Path2D()
		ellips.ellipse(_x, _y, w, h, 0, 0, Math.PI * 2)
		this.ctx.fill(ellips)
		this.ctx.stroke(ellips)
	}

	drawLine(targetPose) {
		let x1 = fallbackToDefault(targetPose.where.x1, randomIntFromInterval(0, this.ctx.canvas.width))
		let y1 = fallbackToDefault(targetPose.where.y1, randomIntFromInterval(0, this.ctx.canvas.height))
		let x2 = fallbackToDefault(targetPose.where.x2, x1 + DEFAULT_LINE_HEIGHT)
		let y2 = fallbackToDefault(targetPose.where.y2, y1 + DEFAULT_LINE_HEIGHT)
		let {_x: _x1, _y: _y1} = convertOrigin(x1, y1, this.ctx.canvas.height, this.isFlip ? this.originWidth : null)
		let {_x: _x2, _y: _y2} = convertOrigin(x2, y2, this.ctx.canvas.height, this.isFlip ? this.originWidth : null)

		this.ctx.fillStyle = fallbackToDefault(targetPose.how.fill, 'White')
		this.ctx.strokeStyle = fallbackToDefault(targetPose.how.stroke, 'White')
		this.ctx.lineWidth = fallbackToDefault(targetPose.how.strokeWeight, DEFAULT_LINE_WIDTH)

		const line = new Path2D()
		line.moveTo(_x1, _y1)
		line.lineTo(_x2, _y2)
		this.ctx.beginPath(line)
		this.ctx.stroke(line)
	}

	drawPoint(targetPose) {
		this.ctx.fillStyle = fallbackToDefault(targetPose.how.fill, 'White')
		this.ctx.strokeStyle = fallbackToDefault(targetPose.how.stroke, 'White')
		this.ctx.lineWidth = fallbackToDefault(targetPose.how.strokeWeight, DEFAULT_LINE_WIDTH)

		let x = fallbackToDefault(targetPose.where.x, randomIntFromInterval(0, this.ctx.canvas.width))
		let y = fallbackToDefault(targetPose.where.y, randomIntFromInterval(0, this.ctx.canvas.height))
		let {_x, _y} = convertOrigin(x, y, this.ctx.canvas.height, this.isFlip ? this.originWidth : null)

		const rect = new Path2D()
		rect.arc(_x, _y, DEFAULT_RADIUS, 0, DEFAULT_RADIUS * Math.PI)

		this.ctx.fill(rect)
		this.ctx.stroke(rect)
	}

	drawQuad(targetPose) {
		const ranndomX = randomIntFromInterval(0, this.ctx.canvas.width)
		const ranndomY = randomIntFromInterval(0, this.ctx.canvas.height)

		let x1 = fallbackToDefault(targetPose.where.x1, ranndomX - DEFAULT_LINE_HEIGHT / 2)
		let y1 = fallbackToDefault(targetPose.where.y1, ranndomY - DEFAULT_LINE_HEIGHT / 2)
		let x2 = fallbackToDefault(targetPose.where.x2, ranndomX + DEFAULT_LINE_HEIGHT / 2)
		let y2 = fallbackToDefault(targetPose.where.y2, ranndomY - DEFAULT_LINE_HEIGHT / 2)
		let x3 = fallbackToDefault(targetPose.where.x3, ranndomX + DEFAULT_LINE_HEIGHT / 2)
		let y3 = fallbackToDefault(targetPose.where.y3, ranndomY + DEFAULT_LINE_HEIGHT / 2)
		let x4 = fallbackToDefault(targetPose.where.x4, ranndomX - DEFAULT_LINE_HEIGHT / 2)
		let y4 = fallbackToDefault(targetPose.where.y4, ranndomY + DEFAULT_LINE_HEIGHT / 2)

		let {_x: _x1, _y: _y1} = convertOrigin(x1, y1, this.ctx.canvas.height, this.isFlip ? this.originWidth : null)
		let {_x: _x2, _y: _y2} = convertOrigin(x2, y2, this.ctx.canvas.height, this.isFlip ? this.originWidth : null)
		let {_x: _x3, _y: _y3} = convertOrigin(x3, y3, this.ctx.canvas.height, this.isFlip ? this.originWidth : null)
		let {_x: _x4, _y: _y4} = convertOrigin(x4, y4, this.ctx.canvas.height, this.isFlip ? this.originWidth : null)

		this.ctx.fillStyle = fallbackToDefault(targetPose.how.fill, 'White')
		this.ctx.strokeStyle = fallbackToDefault(targetPose.how.stroke, 'White')
		this.ctx.lineWidth = fallbackToDefault(targetPose.how.strokeWeight, DEFAULT_LINE_WIDTH)

		const quad = new Path2D()
		quad.moveTo(_x1, _y1)
		quad.lineTo(_x2, _y2)
		quad.lineTo(_x3, _y3)
		quad.lineTo(_x4, _y4)
		quad.closePath()

		this.ctx.fill(quad)
		this.ctx.stroke(quad)
	}

	drawRect(targetPose) {
		let w = fallbackToDefault(targetPose.how.w, DEFAULT_LINE_HEIGHT)
		let h = fallbackToDefault(targetPose.how.h, w / 2)

		let x = fallbackToDefault(targetPose.where.x, randomIntFromInterval(0, this.ctx.canvas.width))
		let y = fallbackToDefault(targetPose.where.y, randomIntFromInterval(0, this.ctx.canvas.height))
		let {_x, _y} = convertOrigin(x, y, this.ctx.canvas.height, this.originWidth)

		this.ctx.fillStyle = fallbackToDefault(targetPose.how.fill, 'White')
		this.ctx.strokeStyle = fallbackToDefault(targetPose.how.stroke, 'White')
		this.ctx.lineWidth = fallbackToDefault(targetPose.how.strokeWeight, DEFAULT_LINE_WIDTH)

		const rect = new Path2D()
		rect.rect(_x, _y, w, h)

		this.ctx.fill(rect)
		this.ctx.stroke(rect)
	}

	drawSquare(targetPose) {
		const ranndomX = randomIntFromInterval(0, this.ctx.canvas.width)
		const ranndomY = randomIntFromInterval(0, this.ctx.canvas.height)

		let x = fallbackToDefault(targetPose.where.x, ranndomX)
		let y = fallbackToDefault(targetPose.where.y, ranndomY)
		let s = fallbackToDefault(targetPose.how.s, DEFAULT_LINE_HEIGHT)
		let {_x, _y} = convertOrigin(x, y, this.ctx.canvas.height, this.isFlip ? this.originWidth : null)

		this.ctx.fillStyle = fallbackToDefault(targetPose.how.fill, 'White')
		this.ctx.strokeStyle = fallbackToDefault(targetPose.how.stroke, 'White')
		this.ctx.lineWidth = fallbackToDefault(targetPose.how.strokeWeight, DEFAULT_LINE_WIDTH)

		const rect = new Path2D()
		rect.rect(_x, _y, s, s)
		this.ctx.fill(rect)
		this.ctx.stroke(rect)
	}

	drawTriangle(targetPose) {
		const ranndomX = randomIntFromInterval(0, this.ctx.canvas.width)
		const ranndomY = randomIntFromInterval(0, this.ctx.canvas.height)

		let x1 = fallbackToDefault(targetPose.where.x1, ranndomX - DEFAULT_LINE_HEIGHT / 2)
		let y1 = fallbackToDefault(targetPose.where.y1, ranndomY + (Math.sqrt(3) / 6) * DEFAULT_LINE_HEIGHT)
		let x2 = fallbackToDefault(targetPose.where.x2, ranndomX + DEFAULT_LINE_HEIGHT / 2)
		let y2 = fallbackToDefault(targetPose.where.y2, y1)
		let x3 = fallbackToDefault(targetPose.where.x3, ranndomX)
		let y3 = fallbackToDefault(targetPose.where.y3, ranndomY - (Math.sqrt(3) / 3) * DEFAULT_LINE_HEIGHT)

		let {_x: _x1, _y: _y1} = convertOrigin(x1, y1, this.ctx.canvas.height, this.isFlip ? this.originWidth : null)
		let {_x: _x2, _y: _y2} = convertOrigin(x2, y2, this.ctx.canvas.height, this.isFlip ? this.originWidth : null)
		let {_x: _x3, _y: _y3} = convertOrigin(x3, y3, this.ctx.canvas.height, this.isFlip ? this.originWidth : null)

		this.ctx.fillStyle = fallbackToDefault(targetPose.how.fill, 'White')
		this.ctx.strokeStyle = fallbackToDefault(targetPose.how.stroke, 'White')
		this.ctx.lineWidth = fallbackToDefault(targetPose.how.strokeWeight, DEFAULT_LINE_WIDTH)

		const triangle = new Path2D()
		triangle.moveTo(_x1, _y1)
		triangle.lineTo(_x2, _y2)
		triangle.lineTo(_x3, _y3)
		triangle.closePath()

		this.ctx.fill(triangle)
		this.ctx.stroke(triangle)
	}

	drawCurve(targetPose) {
		this.ctx.fillStyle = fallbackToDefault(targetPose.how.fill, 'White')
		this.ctx.strokeStyle = fallbackToDefault(targetPose.how.stroke, 'White')
		this.ctx.lineWidth = fallbackToDefault(targetPose.how.strokeWeight, DEFAULT_LINE_WIDTH)

		const vertices = this.generateVertices(targetPose)

		const curve = new Path2D()
		curve.moveTo(vertices[0].x, vertices[0].y)

		for (let i = 1; i < vertices.length - 1; i += 2) {
			const controlX = vertices[i].x
			const controlY = vertices[i].y
			const endX = vertices[i + 1].x
			const endY = vertices[i + 1].y
			curve.quadraticCurveTo(controlX, controlY, endX, endY)
		}
		this.ctx.fill(curve)
		this.ctx.stroke(curve)
	}

	generateVertices = (targetPose) => {
		const ranndomX = randomIntFromInterval(0, this.ctx.canvas.width)
		const ranndomY = randomIntFromInterval(0, this.ctx.canvas.height)
		let vertices = []
		let numPairs = Math.max(
			...Object.keys(targetPose.where)
				.map((k) => Number(k.substr(1)))
				.filter((n) => n)
		)
		if (numPairs == undefined) {
			numPairs = 0
		}
		for (var i = 1; i <= numPairs; i++) {
			if (targetPose.where[`x${i}`] != undefined && targetPose.where[`y${i}`] != undefined) {
				let {_x, _y} = convertOrigin(targetPose.where[`x${i}`], targetPose.where[`y${i}`], this.ctx.canvas.height, this.isFlip ? this.originWidth : null)
				vertices.push({x: _x, y: _y})
			}
		}
		if (!vertices.length) {
			let x1 = fallbackToDefault(targetPose.where.x1, ranndomX - DEFAULT_LINE_HEIGHT / 2)
			let y1 = fallbackToDefault(targetPose.where.y1, ranndomX - DEFAULT_LINE_HEIGHT / 2)
			let x2 = fallbackToDefault(targetPose.where.x2, ranndomX - DEFAULT_LINE_HEIGHT / 2)
			let y2 = fallbackToDefault(targetPose.where.y2, ranndomY - DEFAULT_LINE_HEIGHT / 2)
			let x3 = fallbackToDefault(targetPose.where.x3, ranndomX + DEFAULT_LINE_HEIGHT / 2)
			let y3 = fallbackToDefault(targetPose.where.y3, ranndomY - DEFAULT_LINE_HEIGHT / 2)

			let {_x: _x1, _y: _y1} = convertOrigin(x1, y1, this.ctx.canvas.height, this.isFlip ? this.originWidth : null)
			let {_x: _x2, _y: _y2} = convertOrigin(x2, y2, this.ctx.canvas.height, this.isFlip ? this.originWidth : null)
			let {_x: _x3, _y: _y3} = convertOrigin(x3, y3, this.ctx.canvas.height, this.isFlip ? this.originWidth : null)
			vertices.push({x: _x1, y: _y1})
			vertices.push({x: _x2, y: _y2})
			vertices.push({x: _x3, y: _y3})
		}
		return vertices
	}

	drawBezierCurve(targetPose) {
		const ranndomX = randomIntFromInterval(0, this.ctx.canvas.width)
		const ranndomY = randomIntFromInterval(0, this.ctx.canvas.height)

		let x1 = fallbackToDefault(targetPose.where.x1, ranndomX - DEFAULT_LINE_HEIGHT / 2)
		let y1 = fallbackToDefault(targetPose.where.y1, ranndomX - DEFAULT_LINE_HEIGHT / 2)

		let x2 = fallbackToDefault(targetPose.where.x2, ranndomX - DEFAULT_LINE_HEIGHT / 2)
		let y2 = fallbackToDefault(targetPose.where.y2, ranndomY - DEFAULT_LINE_HEIGHT / 2)
		let x3 = fallbackToDefault(targetPose.where.x3, ranndomX + DEFAULT_LINE_HEIGHT / 2)
		let y3 = fallbackToDefault(targetPose.where.y3, ranndomY - DEFAULT_LINE_HEIGHT / 2)
		let x4 = fallbackToDefault(targetPose.where.x4, ranndomX + DEFAULT_LINE_HEIGHT / 2)
		let y4 = fallbackToDefault(targetPose.where.y4, ranndomY - DEFAULT_LINE_HEIGHT / 2)

		let {_x: _x1, _y: _y1} = convertOrigin(x1, y1, this.ctx.canvas.height, this.isFlip ? this.originWidth : null)
		let {_x: _x2, _y: _y2} = convertOrigin(x2, y2, this.ctx.canvas.height, this.isFlip ? this.originWidth : null)
		let {_x: _x3, _y: _y3} = convertOrigin(x3, y3, this.ctx.canvas.height, this.isFlip ? this.originWidth : null)
		let {_x: _x4, _y: _y4} = convertOrigin(x4, y4, this.ctx.canvas.height, this.isFlip ? this.originWidth : null)

		this.ctx.fillStyle = fallbackToDefault(targetPose.how.fill, 'White')
		this.ctx.strokeStyle = fallbackToDefault(targetPose.how.stroke, 'White')
		this.ctx.lineWidth = fallbackToDefault(targetPose.how.strokeWeight, DEFAULT_LINE_WIDTH)

		const curve = new Path2D()
		curve.moveTo(_x1, _y1)
		curve.bezierCurveTo(_x2, _y2, _x3, _y3, _x4, _y4)

		this.ctx.fill(curve)
		this.ctx.stroke(curve)
	}

	drawHeart(targetPose) {
		const ranndomX = randomIntFromInterval(0, this.ctx.canvas.width)
		const ranndomY = randomIntFromInterval(0, this.ctx.canvas.height)

		let x = fallbackToDefault(targetPose.where.x, ranndomX)
		let y = fallbackToDefault(targetPose.where.y, ranndomY)
		const size = fallbackToDefault(targetPose.how.size, 80)

		this.ctx.beginPath()
		this.ctx.moveTo(x, y + size / 4)
		this.ctx.bezierCurveTo(x + size / 2, y - size / 2, x + size / 2, y + size / 2, x, y + size)
		this.ctx.bezierCurveTo(x - size / 2, y + size / 2, x - size / 2, y - size / 2, x, y + size / 4)
		this.ctx.closePath()
		this.ctx.fillStyle = 'red'
		this.ctx.fill()
	}
}
