/**
 * it initalise tensorflow setup, poseDetection, camera video and camera canvas.
 * requestAnimationFrame is used to render each frame
 * isPreparing means setup is complete and we can use camera with ui and editor etc
 */

import React, {Component} from 'react'

import '@tensorflow/tfjs-backend-webgl'
import '@tensorflow/tfjs-backend-webgpu'

import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm'
import * as tf from '@tensorflow/tfjs-core'

tfjsWasm.setWasmPaths(`https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`)
import * as poseDetection from '@tensorflow-models/pose-detection'

import {CameraVideo} from './CameraVideo'

import CameraCanvas from './CameraCanvas'

interface Camera {
	cameraVideo: any
	cameraCanvas: any
	videoCamera: any
	detector: any
	startInferenceTime: any
	numInferences: any
	inferenceTimeSum: any
	lastPanelUpdate: any
	maxPoses: any
	isPreparing: any
	message: any
	messageAnimationFrameId: any
	previousPoser: any
}

class Camera extends Component<any, any> {
	constructor(props: any) {
		super(props)
		this.cameraVideo = null
		this.cameraCanvas = null
		this.detector = null
		this.message = ''
		this.maxPoses = 1
		this.startInferenceTime = 0
		this.numInferences = 0
		this.inferenceTimeSum = 0
		this.lastPanelUpdate = 0
		this.isPreparing = true
		this.messageAnimationFrameId = null
	}

	async componentDidMount() {
		if (this.messageAnimationFrameId == null) {
			await this.initSetup()
		}
	}

	async componentWillUnmount() {
		if (this.isPreparing) {
			return
		}
		this.destroySetup()
	}

	async initSetup() {
		;(window as any).videoTime = 0
		this.messageAnimationFrameId = requestAnimationFrame(this.renderMessage)
		await this.setUpCamera()
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
		this.setUpCameraPoseDetection()
		this.cameraCanvas.ctx.canvas.addEventListener('mousemove', this.handleMouseMove)
	}

	async destroySetup() {
		try {
			this.isPreparing = true
			cancelAnimationFrame(this.messageAnimationFrameId)
			this.cameraCanvas.ctx.canvas.removeEventListener('mousemove', this.handleMouseMove)
			if (this.cameraVideo) {
				this.cameraVideo.stream.getTracks().forEach((track: any) => track.stop())
			}
			if (this.detector) {
				this.detector.dispose()
				this.detector = null
			}
			if (this.cameraCanvas) {
				this.cameraCanvas.clearCtx()
				this.cameraCanvas = null
			}
			this.previousPoser = null
		} catch (error) {
			console.log('camera 1' + error)
		}
	}

	handleMouseMove = (e: any) => {
		const rect = this.cameraCanvas.ctx.canvas.getBoundingClientRect()
		const x = e.clientX - rect.left
		const x1 = x.toFixed(2)

		const y = e.clientY - rect.top
		const y1 = y.toFixed(2)
		// console.log(x1, y1)
		this.cameraCanvas.cursorPosition = {x: x1, y: y1}
	}

	setUpCamera = async () => {
		this.cameraVideo = await CameraVideo.setup({targetFPS: 60, sizeOption: '640 X 480'}, this.props.cameraSetupCB)
		if (this.cameraVideo.video.readyState < 2) {
			await new Promise((resolve) => {
				this.cameraVideo.video.onloadeddata = () => {
					resolve(this.cameraVideo.video)
				}
			})
		}
		if (this.cameraVideo.video.readyState === 4) {
			const videoWidth = this.cameraVideo.video.width
			const videoHeight = this.cameraVideo.video.height
			if (this.cameraCanvas == null) {
				const canvas: any = document.getElementById('camera_output')
				canvas.width = videoWidth
				canvas.height = videoHeight
				this.cameraCanvas = new CameraCanvas(canvas, this.props.invalidShapeError)
				this.message = 'preparing detection'
			}
		} else {
			alert('failed')
			console.log('detect failed')
			// this.cameraCanvas.drawLoadingMessage('loading camera')
		}
	}

	setUpCameraPoseDetection = async () => {
		try {
			this.isPreparing = false
			this.detector = await poseDetection.createDetector(this.props.supportedModel, {runtime: 'tfjs', modelType: this.props.modelType})
			this.cameraCanvas.clearCtx()
			// this.message = ''//todo.. no need to do
			cancelAnimationFrame(this.messageAnimationFrameId)
			requestAnimationFrame(this.renderResult)
			if (this.previousPoser) {
				this.onUpdatePoser(this.previousPoser)
			}
		} catch (e) {
			console.log(e)
		}
	}

	renderResult = async () => {
		if (this.isPreparing) {
			if (this.cameraCanvas) {
				this.message = 'detection in progress'
			}
			return
		}
		;(window as any).videoTime++
		let poses = null
		if (this.detector != null) {
			this.beginEstimatePosesStats()
			try {
				poses = await this.detector.estimatePoses(this.cameraVideo.video, {maxPoses: this.maxPoses, flipHorizontal: this.cameraCanvas.isCameraFlip})
			} catch (error) {
				if (this.detector) {
					this.detector.dispose()
					this.detector = null
				}
				console.log('camera:: ' + error)
			}
			this.endEstimatePosesStats()
		}
		if (this.cameraCanvas != null) {
			this.cameraCanvas.redrawCtx(this.cameraVideo.video)
			if (poses && poses.length > 0) {
				this.cameraCanvas.drawResults(poses)
			}
		}
		requestAnimationFrame(this.renderResult)
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
			const averageInferenceTime = this.inferenceTimeSum / this.numInferences
			this.inferenceTimeSum = 0
			this.numInferences = 0
			// console.log('current fps is: ' + 1000.0 / averageInferenceTime, 120)
			this.lastPanelUpdate = endInferenceTime
		}
	}

	renderMessage = async () => {
		if (this.message && this.cameraCanvas) {
			this.cameraCanvas.drawLoadingMessage(this.message)
		} else {
			// console.log('camera renderMessage failed')
		}
		this.messageAnimationFrameId = requestAnimationFrame(this.renderMessage)
	}

	onUpdatePoser = async (poser: any) => {
		if (this.isPreparing) {
			this.previousPoser = poser
			if (this.cameraCanvas) {
				this.message = 'Preparing canvas'
			}
		} else {
			this.cameraCanvas.updatePoser(poser)
		}
	}

	onChangeModelType = async () => {
		await this.destroySetup()
		await this.initSetup()
	}

	//if camera is still preparing than do nothing
	canUserAddExample = () => {
		return !this.isPreparing
	}

	render() {
		return null
	}
}

export default Camera
