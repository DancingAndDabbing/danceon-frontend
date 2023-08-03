/**
 * this class only renders the code status ui. like revert or code is live!
 */

import React, {Component} from 'react'

class CodeStatus extends Component {
	constructor(props) {
		super(props)
		this.state = {
			isCompile: true,
			step: 1
		}
	}

	updateCompileStatus = async (isCompile, isCodeUpdated) => {
		this.setState({isCompile: isCompile, step: isCodeUpdated == true ? 2 : 1})
	}

	render() {
		return (
			<>
				<div id="editorControls" className="mb-2">
					<button id="revertButton" className={`button ${this.state.isCompile ? 'is-success' : 'is-warning'} is-light is-fullwidth`} onClick={this.props.revertToPreviousCode}>
						<span className="icon">
							<i className={`${this.state.isCompile ? 'fas fa-check' : 'fas fa-history'}`}></i>
						</span>
						<span> {`${this.state.isCompile ? 'Code is Live!' : 'Revert Back!'}`}</span>
					</button>
				</div>
				<div id="codeProgress" style={{marginTop: '0.5rem'}}>
					<ul className="steps has-gaps is-horizontal">
						<li id="startingStep" className={`steps-segment ${this.state.step == 1 ? 'is-active' : ''}`}>
							<span className="steps-marker is-hollow"></span>
						</li>
						<li id="editingStep" className={`steps-segment is-dashed ${this.state.step == 2 && this.state.isCompile == false ? 'is-active' : ''} `}>
							<span className="steps-marker">
								<span className="icon">
									<i className="fas fa-pencil-alt"></i>
								</span>
							</span>
							<div className="steps-content is-divider-content">
								<p className="heading is-size-8">code run</p>
							</div>
						</li>

						<li id="debuggingStep" className={`steps-segment`}>
							<span className="steps-marker">
								<span className="icon">
									<i className="fas fa-hammer"></i>
								</span>
							</span>
						</li>
						<li id="runningStep" className={`steps-segment ${this.state.step == 2 && this.state.isCompile == true ? 'is-active' : ''} `}>
							<span className="steps-marker">
								<span className="icon">
									<i className="fa fa-check"></i>
								</span>
							</span>
						</li>
					</ul>
				</div>
			</>
		)
	}
}

export default CodeStatus
