/**
 * this class renders the title, save button and delete button
 */

import React, {Component} from 'react'

import ControlsModal from '../modals/ControlsModal'
import ExamplesModal from '../modals/ExamplesModal'
import ReferenceModal from '../modals/ReferenceModal'
import RecordingModal from '../modals/RecordingModal'
import {saveSingleExample} from '../../actions/authActions'
import {connect} from 'react-redux'

interface Navbar {
	inProgress: any
	controlsModalRef: any
	isVideo: any
	openRecordingModal: any
	subMenuDropToggle: any
}

class Navbar extends Component<any, any> {
	constructor(props: any) {
		super(props)
		this.inProgress = true
		this.controlsModalRef = React.createRef()
		this.state = {
			openControlModal: false,
			openExamplesModal: false,
			openQuickView: false,
			openRecordingModal: false,
			subMenuDropToggle: false
		}
	}

	updateUI = () => {
		if (this.controlsModalRef.current) {
			this.controlsModalRef.current.updateUI()
		} else {
			this.inProgress = false
		}
	}

	toggleRecordingModal = async () => {
		this.setState({openRecordingModal: !this.state.openRecordingModal})
	}

	render() {
		return (
			<nav style={{boxShadow: '0 2px 2px -2px rgba(0,0,0,.2)'}} className="navbar is-light is-fixed-top" role="navigation" aria-label="main navigation">
				<div className="navbar-brand">
					<li className="is-family-code navbar-item is-size-4 title_text" style={{cursor: 'pointer'}} onClick={this.props.handleDanceOnClick}>
						() ={`>`} [
						<i>
							<b>danceON</b>
						</i>
						]
					</li>
					<a
						role="button"
						onClick={() => {
							this.setState({subMenuDropToggle: !this.state.subMenuDropToggle})
						}}
						className={`navbar-burger ${this.state.subMenuDropToggle ? 'is-active' : ''} `}
						data-target="navMenu"
						aria-label="menu"
						aria-expanded="false">
						<span aria-hidden="true"></span>
						<span aria-hidden="true"></span>
						<span aria-hidden="true"></span>
					</a>
				</div>
				<div className={`navbar-menu ${this.state.subMenuDropToggle ? 'is-active' : ''}`} id="navMenu">
					<div className="navbar-end">
						<div className="navbar-item">
							<div className="buttons">
								<button
									id="settingsButton"
									className="button is-light"
									onClick={() => {
										this.setState({openControlModal: true})
									}}>
									<span className="icon">
										<i className="fas fa-sliders-h"></i>
									</span>
									<span>Controls</span>
								</button>
								<button
									className="button button is-light"
									data-show="quickview"
									data-target="quickviewDefault"
									onClick={() => {
										this.setState({openQuickView: true})
									}}>
									<span className="icon">
										<i className="far fa-file-code"></i>
									</span>
									<span>Reference</span>
								</button>
								<button
									className="button button is-light js-modal-trigger"
									onClick={() => {
										this.setState({openExamplesModal: true})
									}}
									data-target="egID">
									<span className="icon">
										<i className="far fa-file-code"></i>
									</span>
									<span>Examples</span>
								</button>
							</div>
						</div>
					</div>
				</div>
				{this.state.openControlModal && (
					<ControlsModal
						ref={this.controlsModalRef}
						inProgress={this.inProgress}
						changeMode={this.props.changeMode}
						handleCursor={this.props.handleCursor}
						handleSkeleton={this.props.handleSkeleton}
						handleFontSize={this.props.handleFontSize}
						isVideo={this.props.isVideo}
						handleModelType={this.props.handleModelType}
						handleSupportedModels={this.props.handleSupportedModels}
						closeControlModal={() => {
							this.setState({openControlModal: false})
						}}
						onUploadFile={this.props.onUploadFile}
						onDownloadFile={this.props.onDownloadFile}
						handleFlipCamera={this.props.handleFlipCamera}
						handle3DCamera={this.props.handle3DCamera}
						handleUploadVideo={this.props.handleUploadVideo}
					/>
				)}
				{this.state.openExamplesModal && (
					<ExamplesModal
						closeControlModal={() => {
							this.setState({openExamplesModal: false})
						}}
					/>
				)}
				{this.state.openQuickView && (
					<ReferenceModal
						closeControlModal={() => {
							this.setState({openQuickView: false})
						}}
					/>
				)}
				{this.state.openRecordingModal && (
					<RecordingModal
						closeRecordingPrompt={() => {
							this.toggleRecordingModal()
						}}
						allowRecordingPrompt={() => {
							this.props.allowRecordVideo()
						}}
					/>
				)}
			</nav>
		)
	}
}

export default Navbar
