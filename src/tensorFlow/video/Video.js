/**
 * it initalise tensorflow setup, poseDetection, video and video canvas.
 * requestAnimationFrame is used to render each frame
 * isPreparing means setup is complete and we can use video with ui and editor etc
 */

import React, {Component} from 'react'

import '@tensorflow/tfjs-backend-webgl'
import '@tensorflow/tfjs-backend-webgpu'

import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm'
import * as tf from '@tensorflow/tfjs-core'
import * as poseDetection from '@tensorflow-models/pose-detection'
import {VideoCanvas} from './VideoCanvas'

tfjsWasm.setWasmPaths(`https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`)

let file = null
let lastFrame = null //to show cursor position in case video is pause

class Video extends Component {
	constructor(props) {
		super(props)
		this.videoCanvas = null
		this.detector = null
		this.maxPoses = 1

		this.startInferenceTime = 0
		this.numInferences = 0
		this.inferenceTimeSum = 0
		this.lastPanelUpdate = 0

		this.message = ''
		this.messageAnimationFrameId = null
		this.isPreparing = true

		this.playButtonRef = null
		this.volumeButtonRef = null
		this.progressBarRef = null
		this.recordButtonRef = null
		this.previousPoser = null
	}

	async componentDidMount() {
		if (this.videoCanvas == null) {
			this.initSetup()
		}
	}

	//todo..if  its called before isPreparing=false then previous message is called again & again
	componentWillUnmount() {
		if (this.isPreparing) {
			return
		}
		this.destroySetup()
	}

	async initSetup() {
		this.videoCanvas = new VideoCanvas()
		this.message = 'preparing detection'
		this.messageAnimationFrameId = requestAnimationFrame(this.renderMessage)
		tf.env().setFlags({})
		const ENGINE = tf.engine()
		const _backendName = 'tfjs-webgl'
		const backendName = _backendName.split('-')[1]
		if (!(backendName in ENGINE.registryFactory)) {
			throw new Error(`${backendName} backend is not registered.`)
		}
		if (backendName in ENGINE.registry) {
			const backendFactory = tf.findBackendFactory(backendName)
			tf.removeBackend(backendName)
			tf.registerBackend(backendName, backendFactory)
		}
		await tf.setBackend(backendName)
		// await tf.ready()

		const uploadButton = document.getElementById('videofile')
		uploadButton.onchange = this.uploadVideo

		this.playButtonRef = document.getElementById('playButton')
		this.playButtonRef.onclick = this.playVideo

		this.volumeButtonRef = document.getElementById('volumeButton')
		this.volumeButtonRef.onclick = this.volumeButton

		this.recordButtonRef = document.getElementById('recordButton')
		this.recordButtonRef.onclick = this.recordButton

		this.progressBarRef = document.getElementById('progressBar')

		this.setUpVideoPoseDetection()
		this.videoCanvas.ctx.canvas.addEventListener('mousemove', this.handleMouseMove)
		this.videoCanvas.ctx.canvas.addEventListener('mouseout', this.handleMouseOut)
		if (this.props.videoEvent) {
			this.uploadVideo(this.props.videoEvent)
		}
	}

	async destroySetup() {
		try {
			this.isPreparing = true
			cancelAnimationFrame(this.messageAnimationFrameId)
			this.progressBarRef.value = 0
			this.handleVideoEnded() //stop previous video
			file = null
			this.videoCanvas.ctx.canvas.removeEventListener('mouseout', this.handleMouseOut)
			this.videoCanvas.ctx.canvas.removeEventListener('mousemove', this.handleMouseMove)
			this.videoCanvas.video.removeEventListener('ended', this.handleVideoEnded)
			if (this.videoCanvas) {
				this.videoCanvas.clearCtx()
				this.videoCanvas.video.style.visibility = 'hidden'
				this.videoCanvas = null
			}
			if (this.detector) {
				this.detector.dispose()
				this.detector = null
			}
			this.previousPoser = null
		} catch (error) {
			console.log('video 1' + error)
		}
	}

	handleMouseMove = (event) => {
		if (!this.videoCanvas.ctx || this.isPreparing) {
			return
		}
		this.videoCanvas.cursorPosition = {x: event.offsetX, y: event.offsetY}
		if (!this.isPreparing && this.videoCanvas.video.paused) {
			this.videoCanvas.drawCursor(window.lastPose, true, lastFrame)
		}
	}

	handleMouseOut = (event) => {
		if (this.videoCanvas) {
			this.videoCanvas.cursorPosition = {x: -1, y: -1}
		}
	}

	setUpVideoPoseDetection = async () => {
		try {
			this.isPreparing = false
			this.detector = await poseDetection.createDetector(this.props.supportedModel, {runtime: 'tfjs', modelType: this.props.modelType})
			this.props.cameraSetupCB()
			if (!file) {
				file = 'default'
				this.videoCanvas.source.src = '/assets/SFD_Nov.mp4'
			}
			this.setVideoOnCanvas(false)
		} catch (e) {
			console.log(e)
		}
	}

	setVideoOnCanvas = async (isUploaded = true) => {
		if (isUploaded) {
			this.videoCanvas.source.src = URL.createObjectURL(file)
		}
		this.videoCanvas.video.load()
		await new Promise((resolve) => {
			this.videoCanvas.video.onloadeddata = (video) => {
				resolve(video)
			}
		})
		this.videoCanvas.video.addEventListener('ended', this.handleVideoEnded)
		const videoWidth = this.videoCanvas.video.videoWidth
		const videoHeight = this.videoCanvas.video.videoHeight
		this.videoCanvas.video.width = videoWidth
		this.videoCanvas.video.height = videoHeight
		this.videoCanvas.canvas.width = videoWidth
		this.videoCanvas.canvas.height = videoHeight

		let _videoHeight = 1
		let _videoWidth = 300
		if (videoHeight > videoWidth) {
			_videoHeight = videoHeight / videoWidth
			_videoHeight = _videoHeight * _videoWidth
		} else {
			_videoWidth = 600
			_videoHeight = videoWidth / videoHeight
			_videoHeight = _videoWidth / _videoHeight
		}
		const canvasContainer = document.querySelector('.canvas-wrapper')
		canvasContainer.style = `width: ${_videoWidth}px; height: ${_videoHeight}px`
		this.videoCanvas.updateDrawDimension(videoWidth, videoHeight, _videoWidth, _videoHeight)

		this.videoCanvas.video.style.visibility = 'visible'
		cancelAnimationFrame(this.messageAnimationFrameId)
		this.videoCanvas.clearCtx(false)
	}

	uploadVideo = async (event) => {
		try {
			if (!event.target.files[0]) {
				return
			}
			this.progressBarRef.value = 0
			this.handleVideoEnded() //stop previous video
			URL.revokeObjectURL(this.videoCanvas.video.currentSrc)
			file = event.target.files[0]
			if (this.detector) {
				this.setVideoOnCanvas()
			}
		} catch (e) {
			console.log('uploadVideo ' + e)
		}
	}

	playVideo = async () => {
		if (file == null || !this.detector) {
			return
		}
		try {
			if (this.videoCanvas.mediaRecorder.state === 'inactive') {
				this.playButtonRef.classList.add('fa-pause')
				this.playButtonRef.classList.remove('fa-play')
				const warmUpTensor = tf.fill([this.videoCanvas.video.height, this.videoCanvas.video.width, 3], 0, 'float32')
				await this.detector.estimatePoses(warmUpTensor, {maxPoses: this.maxPoses, flipHorizontal: false})
				warmUpTensor.dispose()
				window.frameCount = 0
				window.videoTime = 0
				this.videoCanvas.video.style.visibility = 'hidden'
				this.videoCanvas.video.currentTime = 0
				this.videoCanvas.video.play()
				this.videoCanvas.mediaRecorder.start()
				await new Promise((resolve) => {
					this.videoCanvas.video.onseeked = (video) => {
						resolve(video)
					}
				})
				//todo..do we need stop previous frame if its failed?
				requestAnimationFrame(this.renderVideoResult)
				if (this.previousPoser) {
					this.onUpdatePoser(this.previousPoser)
				}
			} else if (this.videoCanvas.mediaRecorder.state === 'recording') {
				lastFrame = this.videoCanvas.ctx.canvas.toDataURL('image/png')
				this.videoCanvas.updatePauseStatus(true)
				this.playButtonRef.classList.add('fa-play')
				this.playButtonRef.classList.remove('fa-pause')
				this.videoCanvas.video.pause()
				this.videoCanvas.mediaRecorder.pause()
			} else if (this.videoCanvas.mediaRecorder.state === 'paused') {
				//todo..do we need stop previous frame if its failed?
				this.videoCanvas.updatePauseStatus(false)
				this.playButtonRef.classList.add('fa-pause')
				this.playButtonRef.classList.remove('fa-play')
				this.videoCanvas.video.style.visibility = 'hidden'
				this.videoCanvas.video.play()
				this.videoCanvas.mediaRecorder.resume()
				requestAnimationFrame(this.renderVideoResult)
			}
		} catch (e) {
			alert(e)
		}
	}

	handleVideoEnded = () => {
		this.videoCanvas.video.pause()
		this.recordButtonRef.classList.remove('recordingVideo')
		this.playButtonRef.classList.remove('fa-pause')
		this.playButtonRef.classList.add('fa-play')
		this.videoCanvas.mediaRecorder.stop()
		this.videoCanvas.clearCtx(false)
		this.videoCanvas.video.style.visibility = 'visible'
		document.querySelector('#recordingNotifier').classList.add('hide')
		document.querySelector('#top-bar').classList.remove('hide')
		this.progressBarRef.value = 100
		//if user switch window or browser and meantime video is finished this function
		//is invokved and ui does not updated as it was paused somehow so we just set  slider vaule to 100
	}

	renderVideoResult = async () => {
		if (this.isPreparing || this.videoCanvas.video.paused) {
			return
		}
		window.frameCount++
		window.videoTime = this.videoCanvas.video.currentTime
		this.progressBarRef.value = (this.videoCanvas.video.currentTime / this.videoCanvas.video.duration) * 100
		this.beginEstimatePosesStats()
		const poses = await this.detector.estimatePoses(this.videoCanvas.video, {maxPoses: this.maxPoses, flipHorizontal: false})
		this.endEstimatePosesStats()
		if (this.videoCanvas) {
			this.videoCanvas.redrawCtx()
			if (poses.length > 0) {
				this.videoCanvas.drawResults(poses)
			}
		}
		requestAnimationFrame(this.renderVideoResult)
	}

	beginEstimatePosesStats = async () => {
		this.startInferenceTime = (performance || Date).now()
	}

	endEstimatePosesStats = async () => {
		const endInferenceTime = (performance || Date).now()
		this.inferenceTimeSum += endInferenceTime - this.startInferenceTime
		++this.numInferences
		const panelUpdateMilliseconds = 1000
		if (endInferenceTime - this.lastPanelUpdate >= panelUpdateMilliseconds) {
			// const averageInferenceTime = this.inferenceTimeSum / this.numInferences
			this.inferenceTimeSum = 0
			this.numInferences = 0
			// console.log('current fps is: ' + 1000.0 / averageInferenceTime, 120)
			this.lastPanelUpdate = endInferenceTime
		}
	}

	renderMessage = async () => {
		if (this.message && this.videoCanvas) {
			this.videoCanvas.drawLoadingMessage(this.message)
		} else {
			console.log('video renderMessage failed')
		}
		this.messageAnimationFrameId = requestAnimationFrame(this.renderMessage)
	}

	volumeButton = async () => {
		if (file == null || !this.detector) {
			return
		}
		if (this.videoCanvas.video.muted) {
			this.videoCanvas.video.muted = false
			this.volumeButtonRef.classList.remove('fa-volume-mute')
			this.volumeButtonRef.classList.add('fa-volume')
		} else {
			this.videoCanvas.video.muted = true
			this.volumeButtonRef.classList.remove('fa-volume')
			this.volumeButtonRef.classList.add('fa-volume-mute')
		}
	}

	recordButton = async () => {
		if (file == null || !this.detector) {
			return
		}
		if (this.videoCanvas.mediaRecorder.state === 'recording') {
			this.props.openRecordingModal()
		} else {
			alert('Please play video first')
		}
	}

	recordVideo = async () => {
		this.recordButtonRef.classList.add('recordingVideo')
		this.videoCanvas.recordVideo = true
		document.querySelector('#top-bar').classList.add('hide')
		document.querySelector('#recordingNotifier').classList.remove('hide')
	}

	onUpdatePoser = async (poser) => {
		if (this.isPreparing) {
			if (this.videoCanvas) {
				this.message = 'Preparing canvas'
			}
		} else {
			if (this.videoCanvas.mediaRecorder.state === 'inactive') {
				this.previousPoser = poser
			}
			this.videoCanvas.updatePoser(poser)
		}
	}

	onChangeModelType = async () => {
		await this.destroySetup()
		await this.initSetup()
	}

	canUserAddExample = () => {
		return this.videoCanvas.mediaRecorder.state === 'recording' ? true : false
	}

	render() {
		return null
	}
}

export default Video
