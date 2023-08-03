/**
 * this class draws the main key points and skeleton on a 2D canvas.
 * it passes shapes to the draw function.
 */

import React, {Component} from 'react'

import * as posedetection from '@tensorflow-models/pose-detection'
import {Draw} from '../../poser/Draw'
import {CacheTypes, getCacheItem, setCacheItem} from '../../utils/LocalStorage'
import {ANCHOR_POINTS, DEFAULT_LINE_WIDTH, DEFAULT_RADIUS, SCORE_THRESHOLD} from '../../utils/Helper'

interface CameraCanvas {
	ctx: any
	draw: any
	videoWidth: any
	videoHeight: any
	model: any
	poser: any
	cursor: any
	skeleton: any
	cursorPosition: any
	container: any
	editorColumn: any
	dispalySection: any
}

class CameraCanvas extends Component<any, any> {
	constructor(props: any) {
		super(props)
		this.poser = null
		this.ctx = props.getContext('2d')
		this.draw = new Draw(this.ctx, true)
		this.container = document.querySelector('#container')
		this.editorColumn = document.querySelector('#editorColumn')
		this.dispalySection = document.querySelector('#main')

		this.skeleton = getCacheItem(CacheTypes.Skeleton) == 'true' ? true : false
		this.cursor = getCacheItem(CacheTypes.Cursor) == 'true' ? true : false
		this.cursorPosition = {x: 0, y: 0}
		this.videoWidth = props.width
		this.videoHeight = props.height

		if (getCacheItem(CacheTypes.FlipCamera) != 'false') {
			//first time dont call
			this.flip()
		}

		this.model = posedetection.SupportedModels.BlazePose
	}

	flip() {
		this.ctx.translate(this.videoWidth, 0)
		this.ctx.scale(-1, 1)
		this.draw.flip()
	}

	drawLoadingMessage(message: any) {
		this.draw.drawLoadingMessage(message, 'Green')
	}

	redrawCtx(video: any) {
		this.ctx.clearRect(0, 0, this.videoWidth, this.videoHeight)
		this.ctx.drawImage(video, 0, 0, this.videoWidth, this.videoHeight)
	}

	clearCtx() {
		this.ctx.clearRect(0, 0, this.videoWidth, this.videoHeight)
		this.draw.clearRandomLines()
	}

	/**
	 * Draw the keypoints and skeleton on the video.
	 * @param poses A list of poses to render.
	 */
	drawResults(poses: any) {
		for (const pose of poses) {
			this.drawResult(pose)
		}
	}

	/**
	 * Draw the keypoints and skeleton on the video.
	 * @param pose A pose with keypoints to render.
	 */
	drawResult(pose: any) {
		if (pose.keypoints != null) {
			this.drawKeypoints(pose.keypoints)
			this.drawSkeleton(pose.keypoints, pose.id)
			this.draw.drawShapes(this.poser, pose.keypoints)
			if ((this.skeleton == true || this.cursor == true) && this.cursorPosition.x && this.cursorPosition.y) {
				this.draw.drawCursor(this.cursorPosition.x, this.cursorPosition.y, this.cursor, this.skeleton ? pose : null)
			}
		}
	}

	/**
	 * Draw the keypoints on the video.
	 * @param keypoints A list of keypoints.
	 */
	drawKeypoints(keypoints: any) {
		const keypointInd = posedetection.util.getKeypointIndexBySide(this.model)
		this.ctx.fillStyle = 'Red'
		this.ctx.strokeStyle = 'White'
		this.ctx.lineWidth = DEFAULT_LINE_WIDTH

		for (const i of keypointInd.middle) {
			this.drawKeypoint(keypoints[i])
		}

		this.ctx.fillStyle = 'Green'
		for (const i of keypointInd.left) {
			this.drawKeypoint(keypoints[i])
		}

		this.ctx.fillStyle = 'Orange'
		for (const i of keypointInd.right) {
			this.drawKeypoint(keypoints[i])
		}
	}

	drawKeypoint(keypoint: any) {
		// If score is null, just show the keypoint.
		const score = keypoint.score != null ? keypoint.score : 1

		if (score >= SCORE_THRESHOLD) {
			const circle = new Path2D()
			circle.arc(keypoint.x, keypoint.y, DEFAULT_RADIUS, 0, 2 * Math.PI)
			this.ctx.fill(circle)
			this.ctx.stroke(circle)
		}
	}

	/**
	 * Draw the skeleton of a body on the video.
	 * @param keypoints A list of keypoints.
	 */
	drawSkeleton(keypoints: any, poseId: any) {
		// Each poseId is mapped to a color in the color palette.
		const color = 'White' //poseId != null ? COLOR_PALETTE[poseId % 20] : 'White'
		this.ctx.fillStyle = color
		this.ctx.strokeStyle = color
		this.ctx.lineWidth = DEFAULT_LINE_WIDTH

		posedetection.util.getAdjacentPairs(this.model).forEach(([i, j]) => {
			const kp1 = keypoints[i]
			const kp2 = keypoints[j]

			// If score is null, just show the keypoint.
			const score1 = kp1.score != null ? kp1.score : 1
			const score2 = kp2.score != null ? kp2.score : 1

			if (score1 >= SCORE_THRESHOLD && score2 >= SCORE_THRESHOLD) {
				this.ctx.beginPath()
				this.ctx.moveTo(kp1.x, kp1.y)
				this.ctx.lineTo(kp2.x, kp2.y)
				this.ctx.stroke()
			}
		})
	}

	updatePoser(poser: any) {
		this.poser = poser
	}
}

export default CameraCanvas
