import React, {Component} from 'react'

class ConfirmationModel extends Component {
	constructor(props) {
		super(props)
	}
	render() {
		return (
			<div>
				<div className="modal is-active" id="egID">
					<div className="modal-background"></div>
					<div className="modal-content" style={{width: '31rem'}}>
						<section>
							<div className="level modal-nav has-background-light is-fixed-top">
								<div className="level-left">
									<p className="modal-card-title">{this.props.title}</p>
								</div>
								<div style={{display: 'flex', justifyContent: 'flex-end'}}>
									<button className="delete" aria-label="close" onClick={this.props.closeModal}></button>
								</div>
							</div>
						</section>
						<div className="modal-body has-background-light">
							<div className="eg-body" style={{padding: '2rem'}}>
								{this.props.body}
							</div>
							<div className="field is-grouped" style={{justifyContent: 'flex-end', padding: '0.5rem', background: 'white', gap: '0.5rem'}}>
								<div className="">
									<button className="button is-light" onClick={this.props.closeModal}>
										Cancel
									</button>
								</div>
								{this.props.deleteModel && (
									<div className="">
										<button className="button is-link" onClick={this.props.onDelete}>
											Delete
										</button>
									</div>
								)}

								{this.props.overwriteModel && (
									<div className="control">
										<button className="button is-link" onClick={this.props.onContinue}>
											Overwrite editor code
										</button>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

export default ConfirmationModel
