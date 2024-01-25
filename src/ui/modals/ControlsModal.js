/**
 * it simply handle controls modal/ui
 */
import React, {Component} from 'react'

import {CacheTypes, getCacheItem, setCacheItem} from '../../utils/LocalStorage'

class ControlsModal extends Component {
	constructor(props) {
		super(props)
		this.state = {
			inProgress: props.inProgress,
			openLoginModal: false,
			openSignUpModal: false,
			isCursor: getCacheItem(CacheTypes.Cursor) == 'true' ? true : false,
			isSkeleton: getCacheItem(CacheTypes.Skeleton) == 'true' ? true : false,
			fontSize: getCacheItem(CacheTypes.Font),
			modelType: getCacheItem(CacheTypes.ModelType),
			supportedModels: getCacheItem(CacheTypes.SupportedModels),
			flipCamera: getCacheItem(CacheTypes.FlipCamera) == 'true' ? true : false,
			threeD: getCacheItem(CacheTypes.ThreeD) == 'true' ? true : false,
			uploadedVideo: ''
		}
	}

	closeSettings = () => {
		this.props.closeControlModal()
	}

	switchCameraVideo = () => {
		this.setState({inProgress: true})
		this.props.changeMode()
	}

	handleCursor = (event) => {
		setCacheItem(CacheTypes.Cursor, event.target.checked ? 'true' : 'false')
		this.setState({isCursor: event.target.checked})
		this.props.handleCursor(event.target.checked)
	}

	handleSkeleton = (event) => {
		setCacheItem(CacheTypes.Skeleton, event.target.checked ? 'true' : 'false')
		this.setState({isSkeleton: event.target.checked})
		this.props.handleSkeleton(event.target.checked)
	}

	handleFontSize = (event) => {
		setCacheItem(CacheTypes.Font, event.target.value)
		this.setState({fontSize: event.target.value})
		this.props.handleFontSize(event.target.value)
	}

	handleFlipCamera = (event) => {
		setCacheItem(CacheTypes.FlipCamera, event.target.checked ? 'true' : 'false')
		this.setState({flipCamera: event.target.checked})
		this.props.handleFlipCamera(event.target.checked)
	}

	handle3DCamera = (event) => {
		setCacheItem(CacheTypes.ThreeD, event.target.checked ? 'true' : 'false')
		this.setState({threeD: event.target.checked})
		this.props.handle3DCamera(event.target.checked)
	}

	updateUI = () => {
		this.setState({inProgress: false})
	}

	handleModelType = (event) => {
		this.setState({inProgress: true, modelType: event.target.value})
		this.props.handleModelType(event.target.value)
	}

	handleSupportedModels = (event) => {
		this.setState({supportedModels: event.target.value})
		this.props.handleSupportedModels(event.target.value)
	}

	handelVideoUpload = (event) => {
		//todo store file in localstorage
		this.setState({uploadedVideo: event.target.files[0]})
		this.props.handleUploadVideo(event)
	}

	render() {
		return (
			<>
				<div className="modal is-active" id="settings">
					<div className="modal-background" onClick={this.closeSettings}></div>
					<div className="modal-content">
						<div className="tile is-ancestor is-vertical is-clipped">
							<div className="tile">
								{/* Top Row - Controls  */}
								<div className="tile is-4 is-parent">
									<div className="tile is-child notification is-light box">
										<p className="subtitle">Overlays</p>
										<div className="field">
											<input id="mousePosition" checked={this.state.isCursor} type="checkbox" onChange={this.handleCursor} name="mousePosition" className="switch is-rounded is-outlined" />
											<label htmlFor="mousePosition">cursor position</label>
										</div>
										<div className="field">
											<input id="skeleton" checked={this.state.isSkeleton} type="checkbox" onChange={this.handleSkeleton} name="skeleton" className="switch is-rounded is-outlined" />
											<label htmlFor="skeleton">skeleton</label>
										</div>
									</div>
								</div>
								<div className="tile is-parent">
									<div className="tile is-child notification is-light box">
										<p className="subtitle">Video Sources</p>
										<div className="content ">
											<div className="buttons has-addons">
												<button
													id="videoToggle"
													onClick={() => {
														this.switchCameraVideo()
													}}
													onKeyDown={(e) => {
														if (e.key == 'Enter') {
															e.preventDefault()
														}
													}}
													className={`button ${this.props.isVideo && 'is-link'}`}>
													Video
												</button>
												<button
													id="webcamToggle"
													onClick={() => {
														this.switchCameraVideo()
													}}
													onKeyDown={(e) => {
														if (e.key == 'Enter') {
															e.preventDefault()
														}
													}}
													className={`button ${!this.props.isVideo && 'is-link'}`}>
													Webcam
												</button>
											</div>
											<div className="field">
												<div className="file has-name is-link">
													<label className="file-label">
														{/* <input id="videoUpload" className="file-input" type="file" accept="video/*" name="video" value="Balance001.mp4" /> */}
														<input id="videoUpload" className="file-input" type="file" accept="video/*" name="video" onChange={(e) => e.target.files.length && this.handelVideoUpload(e)} />
														<span className="file-cta">
															<span className="file-icon">
																<i className="fas fa-upload"></i>
															</span>
															<span className="file-label">Video</span>
														</span>
														<span id="videoUploadName" className="file-name">
															{this.state.uploadedVideo ? this.state.uploadedVideo.name : 'Balance001.mp4'}
														</span>
													</label>
												</div>
											</div>
											<div className="loadingWrapper field">
												{this.state.inProgress && (
													<div className="loadingContent">
														<button className="button is-loading is-large custom-loding"></button>
													</div>
												)}
											</div>
										</div>
									</div>
								</div>
								<div className="tile is-parent">
									<div className="tile is-child notification is-light box">
										<p className="subtitle">Settings</p>
										<div className="content">
											<div className="field">
												font size
												<div className="control has-icons-left">
													<div className="select">
														<select id="fontSizeSelector" value={this.state.fontSize} onChange={this.handleFontSize}>
															<option>12</option>
															<option>14</option>
															<option>16</option>
															<option>18</option>
															<option>24</option>
															<option>36</option>
														</select>
													</div>
													<div className="icon is-small is-left">
														<i className="fas fa-text-height"></i>
													</div>
												</div>
											</div>
										</div>
										{/* <div className="field">
											<input id="flipCamera" checked={this.state.flipCamera} type="checkbox" onChange={this.handleFlipCamera} name="flipCamera" className="switch is-rounded is-outlined" />
											<label htmlFor="flipCamera">flip camera</label>
										</div> */}
									</div>
								</div>
							</div>

							{/* Bottom Row */}
							<div className="tile">
								<div className="tile is-3 is-parent">
									<div className="tile is-child notification is-light box">
										<p className="subtitle">Code</p>
										<div className="field">
											<div className="file is-primary">
												<label className="file-label">
													<input id="declarationsUpload" accept=".js" className="file-input" type="file" name="upload code" onChange={(e) => e.target.files.length && this.props.onUploadFile(e.target.files[0])} />
													<span className="file-cta">
														<span className="file-icon">
															<i className="fas fa-upload"></i>
														</span>
														<span className="file-label"> Upload </span>
													</span>
												</label>
											</div>
										</div>
										<button className="button is-primary is-outlined" id="declarationsDownload" onClick={this.props.onDownloadFile}>
											<span className="icon">
												<i className="fas fa-download"></i>
											</span>
											<span>Download</span>
										</button>
									</div>
								</div>
								<div className="tile is-3 is-parent">
									<div className="tile is-child notification is-light box">
										{/* <p className="subtitle">Code</p> */}
										<div className="field">
											Model Type
											<div className="control">
												<div className="select">
													<select id="modelType" value={this.state.modelType} onChange={this.handleModelType}>
														<option>heavy</option>
														<option>full</option>
														<option>lite</option>
													</select>
												</div>
											</div>
										</div>
										<div className="field">
											Supported Models
											<div className="control">
												<div className="select">
													<select id="supportedModels" className="supportedModelsSelect" value={this.state.supportedModels} onChange={this.handleSupportedModels}>
														<option>BlazePose</option>
														<option>MoveNet</option>
														<option>PoseNet</option>
													</select>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="tile is-parent">
									{/* <div className="tile is-child notification is-light box">
                      <p className="subtitle">Machine Learning Model</p>
                      <div className="field">
                          <p className="control has-icons-left">
                              <input id="mlInput" className="input" type="text" placeholder="e.g. https://teachablemachine.withgoogle.com/models/VYlFXZf_k/">
                              <span className="icon is-small is-left">
                                  <i className="fas fa-robot"></i>
                              </span>
                              <p id="mlHelp" className="help">Paste in a link from Teachable Machine.</p>
                          </p>
                      </div>
                      <div className="field">
                          <input id="teachableMachineOn" type="checkbox" checked name="teachableMachineOn" className="switch is-rounded is-outlined">
                          <label for="teachableMachineOn">Use Teachable Machine and Posenet for videos</label>
                      </div>
                  </div> */}
								</div>
							</div>
						</div>
					</div>

					<button className="modal-close is-large" onClick={this.closeSettings} aria-label="close"></button>
				</div>
				{this.state.inProgress && <div className="modal-loading is-active modal" style={{cursor: 'no-drop'}}></div>}
			</>
		)
	}
}

export default ControlsModal
