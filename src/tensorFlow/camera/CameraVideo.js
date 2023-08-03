/**
 * this class initializes the camera and informs the controls UI via the cameraSetupCB once the setup is successful.
 */

import {VIDEO_SIZE, isMobile} from '../../utils/Helper'

export class CameraVideo {
	constructor() {
		this.stream = null
		this.video = document.getElementById('cameravideo')
	}

	static async setup(cameraParam, cameraSetupCB) {
		if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
			cameraSetupCB()
			throw new Error('Browser API navigator.mediaDevices.getUserMedia not available')
		}

		const {targetFPS, sizeOption} = cameraParam
		const $size = VIDEO_SIZE[sizeOption]
		const videoConfig = {
			audio: false,
			video: {
				facingMode: 'user',
				width: isMobile() ? VIDEO_SIZE['360 X 270'].width : $size.width,
				height: isMobile() ? VIDEO_SIZE['360 X 270'].height : $size.height,
				frameRate: {
					ideal: targetFPS
				}
			}
		}

		const camera = new CameraVideo()
		const stream = await navigator.mediaDevices.getUserMedia(videoConfig)
		camera.stream = stream
		camera.video.srcObject = stream
		cameraSetupCB()

		await new Promise((resolve) => {
			camera.video.onloadedmetadata = (video) => {
				resolve(video)
			}
		})

		camera.video.play()

		const videoWidth = camera.video.videoWidth
		const videoHeight = camera.video.videoHeight

		camera.video.width = videoWidth
		camera.video.height = videoHeight

		const canvasContainer = document.querySelector('.canvas-wrapper')
		canvasContainer.style = `width: ${videoWidth}px; height: ${videoHeight}px`

		return camera
	}
}
