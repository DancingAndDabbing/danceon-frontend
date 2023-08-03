/**
 * it renders the documentation in iframe.
 */

import React, {Component} from 'react'

class ReferenceModal extends Component {
	constructor(props) {
		super(props)
	}

	closeModal = () => {
		this.props.closeControlModal()
	}

	showLogin = () => {}

	showSignUp = () => {}

	render() {
		return (
			<div id="quickviewDefault" className="quickview is-active">
				<header className="quickview-header">
					<p className="title">Reference Code</p>
					<span className="delete" data-dismiss="quickview" onClick={this.closeModal}></span>
				</header>

				<div className="quickview-body">
					<div className="quickview-block">
						<div style={{position: 'relative', paddingTop: '85vh', overflow: 'hidden'}}>
							{/* <iframe src="/doc" style="top: 0; left: 0; border:none; height:100%; position: absolute; width:100%;"></iframe> */}
							<iframe
								src="./doc"
								style={{
									top: '0',
									left: '0',
									border: 'none',
									height: '100%',
									position: 'absolute',
									width: '100%'
								}}></iframe>
						</div>
					</div>
				</div>

				<footer className="quickview-footer">Copy and paste these examples into your code!</footer>
			</div>
		)
	}
}

export default ReferenceModal
