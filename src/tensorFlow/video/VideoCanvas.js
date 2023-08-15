/**
 * this class draws the main key points and skeleton on a 2D canvas.
 * it passes shapes to the draw function
 */

import * as posedetection from '@tensorflow-models/pose-detection'
import {DEFAULT_LINE_WIDTH, DEFAULT_RADIUS, SCORE_THRESHOLD} from '../../utils/Helper'
import {CacheTypes, getCacheItem, setCacheItem} from '../../utils/LocalStorage'

import {Draw} from '../../poser/Draw'

export class VideoCanvas {
	constructor() {
		this.video = document.getElementById('video')
		this.canvas = document.getElementById('video_output')
		//fix for ui
		// this.canvas.width = 640
		// this.canvas.height = 480
		this.source = document.getElementById('currentVID')
		this.ctx = this.canvas.getContext('2d')
		this.draw = new Draw(this.ctx, false)
		this.poser = null
		this.recordVideo = false
		this.skeleton = getCacheItem(CacheTypes.Skeleton) == 'true' ? true : false
		this.cursor = getCacheItem(CacheTypes.Cursor) == 'true' ? true : false
		this.cursorPosition = {x: -1, y: -1}
		const stream = this.canvas.captureStream()
		const options = {mimeType: 'video/webm; codecs=vp9'}
		this.mediaRecorder = new MediaRecorder(stream, options)
		this.handleDataAvailable = this.handleDataAvailable.bind(this)
		this.mediaRecorder.ondataavailable = this.handleDataAvailable
		this.model = posedetection.SupportedModels.BlazePose
	}

	redrawCtx() {
		this.ctx.clearRect(0, 0, this.video.videoWidth, this.video.videoHeight)
		this.ctx.drawImage(this.video, 0, 0, this.video.videoWidth, this.video.videoHeight)
	}

	clearCtx(isReset = true) {
		this.draw.clearRandomLines()
		this.ctx.clearRect(0, 0, this.video.videoWidth, this.video.videoHeight)
		if (isReset) {
			this.reset()
		}
	}

	updateDrawDimension(width, height, videoWidth, videoHeight) {
		this.draw.updateDrawDimension(width, height, videoWidth, videoHeight)
	}

	drawLoadingMessage(message, isLoop) {
		this.draw.drawLoadingMessage(message, 'Green', false)
	}

	/**
	 * Draw the keypoints and skeleton on the video.
	 * @param poses A list of poses to render.
	 */
	drawResults(poses) {
		for (const pose of poses) {
			this.drawResult(pose)
		}
	}

	/**
	 * Draw the keypoints and skeleton on the video.
	 * @param pose A pose with keypoints to render.
	 */
	drawResult(pose) {
		if (pose.keypoints != null) {
			if (this.skeleton) {
				this.drawKeypoints(pose.keypoints)
				this.drawSkeleton(pose.keypoints)
			}
			this.draw.drawShapes(this.poser, pose.keypoints)
			this.drawCursor(this.skeleton ? pose : null, false, null)
		}
	}

	drawCursor(pose, isClearCtx, lastFrame) {
		if (isClearCtx) {
			this.clearCtx(false)
		}
		if (lastFrame) {
			const savedImage = new Image()
			savedImage.src = lastFrame
			this.ctx.drawImage(savedImage, 0, 0, this.video.videoWidth, this.video.videoHeight)
		}
		if ((this.cursor == true || this.skeleton == true) && this.cursorPosition.x >= 0 && this.cursorPosition.y >= 0) {
			this.draw.drawCursor(this.cursorPosition.x, this.cursorPosition.y, this.cursor, pose)
		}
	}

	/**
	 * Draw the keypoints on the video.
	 * @param keypoints A list of keypoints.
	 */
	drawKeypoints(keypoints) {
		const keypointInd = posedetection.util.getKeypointIndexBySide(this.model)
		this.ctx.fillStyle = 'White'
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

	drawKeypoint(keypoint) {
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
	drawSkeleton(keypoints) {
		this.ctx.fillStyle = 'White'
		this.ctx.strokeStyle = 'White'
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

	handleDataAvailable(event) {
		if (event.data.size > 0 && this.recordVideo) {
			const recordedChunks = [event.data]
			const blob = new Blob(recordedChunks, {type: 'video/webm'})
			const url = URL.createObjectURL(blob)
			const a = document.createElement('a')
			document.body.appendChild(a)
			a.style = 'display: none'
			a.href = url
			a.download = 'MyVideo.webm'
			a.click()
			window.URL.revokeObjectURL(url)
			this.recordVideo = false
		}
	}

	updatePoser(poser) {
		this.poser = poser
	}

	updatePauseStatus(pause) {
		this.draw.isVideoPaused = pause
	}

	reset() {
		this.ctx = null
		this.draw = null
		this.mediaRecorder = null
		this.canvas = null
		this.poser = null
	}
}
