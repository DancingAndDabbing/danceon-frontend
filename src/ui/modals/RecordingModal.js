/**
 * it renders rencording confirmation popup and if user allows it than 'allowRecoding = () => {' function is called as callback
 */

import React, {Component} from 'react'

class RecordingModal extends Component {
	constructor(props) {
		super(props)
	}

	closeModal = () => {
		this.props.closeRecordingPrompt()
	}

	allowRecoding = () => {
		this.props.allowRecordingPrompt()
		this.closeModal()
	}

	render() {
		return (
			<div class="modal is-active" id="recordingPrompt">
				<div class="modal-background" onClick={this.closeModal}></div>
				<div class="modal-card">
					<header class="modal-card-head">
						<p class="modal-card-title">Record your video and animations</p>
						<button class="delete" onClick={this.closeModal} aria-label="close"></button>
					</header>
					<section class="modal-card-body">
						<p>Are you sure you are ready to make a recording? This will play through your entire video and might take some time.</p>
						<p>Your video should automatically download after recording finishes.</p>
					</section>
					<footer class="modal-card-foot">
						<button id="recordingPromptStart" class="button is-danger" onClick={this.allowRecoding}>
							<span class="icon is-small is-left">
								<i class="fas fa-circle"></i>
							</span>
							<span>Yes, record!</span>
						</button>
						<button class="button" onClick={this.closeModal}>
							No, keep coding.
						</button>
					</footer>
				</div>
			</div>
		)
	}
}

export default RecordingModal
