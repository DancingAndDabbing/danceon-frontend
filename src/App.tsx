//this is the starting point of our app

import React, {Component} from 'react'
import Navbar from './ui/components/Navbar'
import Footer from './ui/components/Footer'
import Camera from './tensorFlow/camera/Camera'
import Video from './tensorFlow/video/Video'
import './App.css'
import Editor from './editor/Editor'
import CodeStatus from './ui/components/CodeStatus'
import ExampleTitleForm from './ui/components/ExampleTitleForm'
// import * as poseDetection from '@tensorflow-models/pose-detection'
import {CacheTypes, getCacheItem, setCacheItem} from './utils/LocalStorage'
import {isMobile} from './utils/Helper'
import './utils/GlobalFunctions'
import {connect} from 'react-redux'
import {saveSingleExample} from './actions/authActions'

interface App {
	navbarRef: any
	editorRef: any
	cameraRef: any
	videoRef: any
	isVideo: any
	isCameraSetup: any
	modalContent: any
	codeStatusRef: any
	modelType: any
	supportedModel: any
	videoEvent: any
	tooltipValue: any
	progressBar: any
	tooltip: any
	specificFrame: any
	parent: any
	myVideoRef: any
	progressBarValue: any
}

class App extends Component<any, any> {
	constructor(props: any) {
		super(props)
		this.videoEvent = null
		//these ref are very important.
		//only one instance of each class will be used because this constructor function will run only once in app life cycle
		//for more about createRef follow this link https://react.dev/reference/react/createRef#
		this.navbarRef = React.createRef()
		this.editorRef = React.createRef()
		this.cameraRef = React.createRef()
		this.videoRef = React.createRef()
		this.myVideoRef = React.createRef()
		this.codeStatusRef = React.createRef()

		this.isCameraSetup = false
		this.modelType = getCacheItem(CacheTypes.ModelType)
		this.supportedModel = getCacheItem(CacheTypes.SupportedModels)
		// this.supportedModel = poseDetection.SupportedModels.BlazePose
		this.state = {
			isVideo: false,
			tooltipValue: 0
		}
		this.progressBar = React.createRef()
		this.tooltip = React.createRef()
		this.specificFrame = React.createRef()
		this.parent = React.createRef()
	}

	//in case user want to change mode from camera to video or vice versa than we uses this function
	changeMode = async () => {
		const cameraSection: any = document.querySelector('#camera_section')
		const videoSection: any = document.querySelector('#video_section')
		if (this.state.isVideo) {
			this.showCamera(cameraSection, videoSection)
		} else {
			this.showVideo(cameraSection, videoSection)
		}
		this.setState({isVideo: !this.state.isVideo})
	}

	showCamera = async (cameraSection: any, videoSection: any) => {
		cameraSection.classList.remove('output_hide')
		videoSection.classList.add('output_hide')
	}

	showVideo = async (cameraSection: any, videoSection: any) => {
		cameraSection.classList.add('output_hide')
		videoSection.classList.remove('output_hide')
	}

	//once poser is updated from editor we update its value to video or camera object accordingly
	onUpdatePoser = async (poser: any, status: any, codeChanged: any) => {
		this.codeStatusRef.current.updateCompileStatus(status, codeChanged)
		if (this.state.isVideo && this.videoRef.current) {
			this.videoRef.current.onUpdatePoser(poser)
		} else if (this.cameraRef.current) {
			this.cameraRef.current.onUpdatePoser(poser)
		}
	}

	revertToPreviousCode = async () => {
		this.editorRef.current.revertToPreviousCode()
	}

	cameraSetupCB = async () => {
		this.navbarRef.current.updateUI()
		if (this.state.isVideo && this.videoRef.current) {
			this.videoRef.current.onUpdatePoser(this.editorRef.current.poser)
		} else if (this.cameraRef.current) {
			this.cameraRef.current.onUpdatePoser(this.editorRef.current.poser)
		}
	}

	handleCursor = async (isCursorOn: any) => {
		if (this.state.isVideo && this.videoRef.current) {
			this.videoRef.current.videoCanvas.cursor = isCursorOn
		} else if (this.cameraRef.current) {
			this.cameraRef.current.cameraCanvas.cursor = isCursorOn
		}
	}

	handleSkeleton = async (isSkeleton: any) => {
		if (this.state.isVideo && this.videoRef.current) {
			this.videoRef.current.videoCanvas.skeleton = isSkeleton
		} else if (this.cameraRef.current) {
			this.cameraRef.current.cameraCanvas.skeleton = isSkeleton
		}
	}

	handleFontSize = async (fontSize: any) => {
		this.editorRef.current.updateFontSize(fontSize)
	}

	openRecordingModal = async () => {
		this.navbarRef.current.toggleRecordingModal()
	}

	allowRecordVideo = async () => {
		this.videoRef.current.recordVideo()
	}

	handleModelType = async (val: any) => {
		if (isMobile()) {
			return
		}
		this.modelType = val.toLowerCase()
		setCacheItem(CacheTypes.ModelType, this.modelType)
		if (this.state.isVideo && this.videoRef.current) {
			this.videoRef.current.onChangeModelType()
		} else if (this.cameraRef.current) {
			this.cameraRef.current.onChangeModelType()
		}
	}

	handleSupportedModels = async (val: any) => {
		this.supportedModel = val
		setCacheItem(CacheTypes.SupportedModels, this.supportedModel)
		// if (val == 'BlazePose') {
		// 	this.supportedModel = poseDetection.SupportedModels.BlazePose
		// } else if (val == 'MoveNet') {
		// 	this.supportedModel = poseDetection.SupportedModels.MoveNet
		// } else if (val == 'PoseNet') {
		// 	this.supportedModel = poseDetection.SupportedModels.PoseNet
		// }
	}

	//once user click on downloadfile we call downloadDeclarations of editor
	handleDownloadFile = () => {
		this.editorRef.current.downloadDeclarations()
	}

	handleUploadFile = (file: any) => {
		this.editorRef.current.uploadDeclarations(file)
	}

	//once user click on flip camera from ui this fucntion is called
	handleFlipCamera = () => {
		if (this.cameraRef.current) {
			this.cameraRef.current.cameraCanvas.flip()
		}
	}

	handle3DCamera = () => {
		if (this.cameraRef.current) {
			this.cameraRef.current.cameraCanvas.setup3D()
		}
	}

	handleUploadVideo = (e: any) => {
		this.videoEvent = e
		if (this.state.isVideo && this.videoRef.current) {
			this.videoRef.current.uploadVideo(e)
		}
	}

	handleDanceOnClick = (e: any) => {
		this.props.dispatch(saveSingleExample({}))
	}

	//this handles the tooltip of video toolbar
	showTooltip = (e) => {
		const myVideo = this.myVideoRef.current.duration
		const progressBar = this.progressBar
		const tooltip = this.tooltip
		const w = progressBar.clientWidth
		const x = e.nativeEvent.offsetX
		const percents = x / w
		const max = parseInt(progressBar.max, 10)
		tooltip.innerHTML = 'sec:' + ' ' + (percents * myVideo + 0.5).toFixed(2)
		this.handleMouseMove(Math.floor(percents * max + 0.5))
	}

	//this handle mouce movement and show its value in ui
	handleMouseMove = (e) => {
		const parentRightSpace = this.parent.getBoundingClientRect()
		const tooltipRightSpace = this.tooltip.getBoundingClientRect()
		const specificFrameRightSpace = this.specificFrame.getBoundingClientRect()

		const toolTipDistanceFromRight = parentRightSpace.right - tooltipRightSpace.right
		const specificFramepDistanceFromRight = parentRightSpace.right - specificFrameRightSpace.right
		// const x = `${e.clientX + 20}px`;
		// const x = e < 50 ? `${e + 4}%` : '50%';
		if (toolTipDistanceFromRight > 20 || specificFramepDistanceFromRight > 70) {
			this.tooltip.style.left = `${e}%`
		}

		this.specificFrame.style.left = `${e}%`
	}

	handleInputChange = (e) => {
		const value = parseInt(e.target.value)
		this.setState({tooltipValue: value})
		this.videoRef.current.progressBarClick(value)
	}

	invalidShapeError = async () => {
		this.editorRef.current.showInvalidShapeError()
	}

	render() {
		const {tooltipValue} = this.state
		return (
			<div className="App">
				<Navbar
					ref={this.navbarRef}
					handleCursor={this.handleCursor}
					handleSkeleton={this.handleSkeleton}
					handleFontSize={this.handleFontSize}
					changeMode={this.changeMode}
					isVideo={this.state.isVideo}
					isCameraSetup={this.isCameraSetup}
					allowRecordVideo={this.allowRecordVideo}
					handleModelType={this.handleModelType}
					handleSupportedModels={this.handleSupportedModels}
					onDownloadFile={this.handleDownloadFile}
					onUploadFile={this.handleUploadFile}
					handleFlipCamera={this.handleFlipCamera}
					handle3DCamera={this.handle3DCamera}
					handleUploadVideo={this.handleUploadVideo}
					handleDanceOnClick={this.handleDanceOnClick}
				/>
				<div className="section">
					<div id="container" className="container is-fluid">
						<div className="columns">
							<div id="editorColumn" className="column">
								<ExampleTitleForm editorRef={this.editorRef} isVideo={this.state.isVideo} cameraRef={this.cameraRef} videoRef={this.videoRef} />
								<Editor ref={this.editorRef} onUpdatePoser={this.onUpdatePoser} />
								{this.state.isVideo ? (
									<Video
										videoEvent={this.videoEvent}
										ref={this.videoRef}
										cameraSetupCB={this.cameraSetupCB}
										openRecordingModal={this.openRecordingModal}
										modelType={this.modelType}
										supportedModel={this.supportedModel}
										invalidShapeError={this.invalidShapeError}
									/>
								) : (
									<Camera ref={this.cameraRef} cameraSetupCB={this.cameraSetupCB} modelType={this.modelType} supportedModel={this.supportedModel} invalidShapeError={this.invalidShapeError} />
								)}
								<CodeStatus ref={this.codeStatusRef} revertToPreviousCode={this.revertToPreviousCode} />
							</div>
							<div id="main" className="column is-narrow">
								<div id="example" />
								<div className="canvas-wrapper">
									{/* <!-- this div is for camera --> */}
									<div id="camera_section">
										<canvas id="camera_output" />
										<video
											id="cameravideo"
											playsInline
											style={{
												transform: 'scaleX(-1)',
												visibility: 'hidden',
												width: 'auto',
												height: 'auto',
												position: 'absolute',
												left: 0,
												right: 0
											}}
										/>
									</div>
									{/* <!-- this div is for video --> */}
									<div id="video_section" className="output_hide">
										<canvas id="video_output" className="videoWrapper" />
										<video id="video" ref={this.myVideoRef} className="videoWrapper">
											<source id="currentVID" src="" type="video/mp4" />
										</video>
										<div id="top-bar" className="fileControlsWrapper">
											<input type="file" id="videofile" name="video" accept="video/*" />
											<label htmlFor="videofile" className="uploadBtn">
												{' '}
												<i className="fas fa-upload"></i>
											</label>
											<button id="playButton" className="playBtn fas fa-play"></button>
											<button id="volumeButton" className="volumeBtn fas fa-volume"></button>
											<button id="recordButton" className="recordBtn fas fa-circle"></button>
											<div className="progress-bar" ref={(parent) => (this.parent = parent)}>
												<div id="specificFrame" ref={(specificFrame) => (this.specificFrame = specificFrame)}></div>
												<input type="range" value={tooltipValue} id="progressBar" min="0" max="100" onMouseMove={this.showTooltip} onChange={this.handleInputChange} ref={(progressBar) => (this.progressBar = progressBar)} />
												<p id="tooltip" ref={(tooltip) => (this.tooltip = tooltip)}>
													sec:{tooltipValue}
												</p>
											</div>
										</div>
										<div id="recordingNotifier" className="notification is-danger hide">
											<button className="button is-danger is-small is-loading"></button>
											<button className="button is-danger is-small" style={{cursor: 'default'}}>
												recording...
											</button>
										</div>
										<div id="analyzingNotifier" className="notification is-warning hide">
											<button className="button is-warning is-small is-loading"></button>
											<button id="notifyText" className="button is-warning is-small" style={{cursor: 'default'}}>
												detecting poses as video plays
											</button>
										</div>
									</div>
								</div>
								<div id="scatter-gl-container" />
							</div>
						</div>
					</div>
				</div>
				<Footer />
			</div>
		)
	}
}

export default connect()(App)
