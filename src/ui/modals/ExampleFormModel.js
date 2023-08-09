import React, {Component} from 'react'
import {connect} from 'react-redux'
import {loginUser, saveAllExamples, saveSingleExample, saveUserExamples} from '../../actions/authActions'

import Loader from '../components/Loader'
import {CacheTypes, getCacheItem, setCacheItem} from '../../utils/LocalStorage'
import {doAddExamples, doDeleteExamples, doGetExampleById, doUpdateExampleById} from '../../apis'

class ExampleFormModel extends Component {
	constructor(props) {
		super(props)
		this.state = {
			isCompile: true,
			step: 1,
			title: this.props.title ? this.props.title : '',
			description: '',
			exampleId: '',
			tag: 'Easy',
			loading: false,
			exampleDetails: {},
			errorModel: false,
			titleError: false
		}
	}

	closeModal = () => {
		this.props.closeModal()
	}

	componentDidMount() {
		if (this.props.singleExample.title) {
			let response = this.props.singleExample
			this.setState({exampleDetails: response, title: this.props.title ? this.props.title : response.title, description: response.description, tag: response.tags, exampleId: response._id})
			// this.props.editorRef.current.setExampleCodeOnEditor(response.examples)
		}
	}

	componentDidUpdate(prevProps) {
		this.props.dispatch(loginUser(getCacheItem(CacheTypes.UserData) ? true : false))
	}

	updateCompileStatus = async (isCompile, isCodeUpdated) => {
		this.setState({isCompile: isCompile, step: isCodeUpdated == true ? 2 : 1})
	}

	handleSubmit = async () => {
		if (!this.props.isVideo && !this.props.cameraRef.current.canUserAddExample()) {
			alert('camera canvas not prepared yet')
			return
		}
		if (this.props.isVideo && !this.props.videoRef.current.canUserAddExample()) {
			alert('Upload video first')
			return
		}
		if (this.state.title) {
			this.setState({loading: true})
			const user = JSON.parse(getCacheItem(CacheTypes.UserData))
			const imageData = this.props.isVideo == true ? this.props.videoRef.current.videoCanvas.ctx.canvas.toDataURL('image/png') : this.props.cameraRef.current.cameraCanvas.ctx.canvas.toDataURL('image/png')
			const response = await doAddExamples('', this.props.editorRef.current.currentCode, this.state.title, this.state.description, this.state.tag, imageData, user.id)
			if (response && response.title) {
				this.setState({title: '', description: '', tag: 'Easy', loading: false})
				this.props.closeModal(true)
				this.props.dispatch(saveSingleExample(response))
				this.props.dispatch(saveUserExamples({examples: [...this.props.userExamples.examples, response], totalRecords: this.props.userExamples.totalRecords, page: this.props.userExamples.page}))
				this.props.dispatch(saveAllExamples({examples: [...this.props.allExamples.examples, response], totalRecords: this.props.allExamples.totalRecords, page: this.props.allExamples.page}))
			} else {
				this.setState({loading: false, titleError: this.state.title ? false : true})
			}
		} else {
			this.setState({titleError: this.state.title ? false : true})
		}
	}

	handleDeleteExample = async () => {
		if (this.state.exampleId) {
			this.setState({loading: true})
			await doDeleteExamples(this.state.exampleId)
			this.setState({title: '', description: '', tag: 'Easy', loading: false})
			this.props.dispatch(saveSingleExample({}))
			let updatedExample = this.props.userExamples.examples.filter((example) => {
				return example._id !== this.state.exampleId && example.title
			})

			let updatedAllExample = this.props.allExamples.examples.filter((example) => {
				return example._id !== this.state.exampleId && example.title
			})

			this.props.dispatch(saveUserExamples({examples: updatedExample, totalRecords: this.props.userExamples.totalRecords - 1 > 0 ? this.props.userExamples.totalRecords - 1 : 0, page: this.props.userExamples.page}))
			this.props.dispatch(saveAllExamples({examples: updatedAllExample, totalRecords: this.props.allExamples.totalRecords - 1 > 0 ? this.props.allExamples.totalRecords - 1 : 0, page: this.props.allExamples.page}))
			this.props.closeModal()
		}
	}

	handleUpdateExampleById = async (id) => {
		let user = JSON.parse(getCacheItem(CacheTypes.UserData))
		if (user && this.state.exampleDetails.userId !== user.id) {
			this.handleSubmit()
		} else if (this.state.title) {
			this.setState({loading: true})
			const imageData = this.props.isVideo == true ? this.props.videoRef.current.videoCanvas.ctx.canvas.toDataURL('image/png') : this.props.cameraRef.current.cameraCanvas.ctx.canvas.toDataURL('image/png')
			const response = await doUpdateExampleById(this.state.exampleId, this.props.editorRef.current.currentCode, this.state.title, this.state.description, this.state.tag, imageData)
			if (response.title) {
				this.setState({title: response.title, description: response.description, tag: response.tags, loading: false})
				this.props.dispatch(saveSingleExample(response))
				let updatedExample = this.props.userExamples.examples.map((example) => {
					if (example._id === response._id) {
						return response
					} else {
						return example
					}
				})
				this.props.editorRef.current.setExampleCodeOnEditor(response.examples)
				this.props.dispatch(saveUserExamples({examples: updatedExample, totalRecords: this.props.userExamples.totalRecords, page: this.props.userExamples.page}))
				this.props.dispatch(saveAllExamples({examples: updatedExample, totalRecords: this.props.allExamples.totalRecords, page: this.props.allExamples.page}))
				this.props.closeModal(true)
			} else {
				this.setState({loading: false, titleError: this.state.title ? false : true})
			}
		} else {
			this.setState({titleError: this.state.title ? false : true})
		}
	}

	render() {
		const {tag, loading, exampleDetails, titleError} = this.state
		return (
			<>
				<div className="modal is-active" id="egID">
					<div className="modal-background"></div>
					<div className="modal-content">
						<div className="box">
							<div style={{display: 'flex', justifyContent: 'flex-end'}}>
								<button className="delete" aria-label="close" onClick={this.closeModal}></button>
							</div>

							<Loader loading={loading} />
							<div className="field">
								<label className="label">Title</label>
								<div className="control">
									<input className="input is-success" type="text" placeholder="Text title" name="title" id="title" value={this.state.title} required="" onChange={(e) => this.setState({title: e.target.value, titleError: false})} />
								</div>
								{titleError && <div style={{color: 'red', marginBottom: '0.5rem'}}>Title is required</div>}
							</div>

							<div className="field">
								<label className="label">Description</label>
								<div className="control">
									<input
										className="input is-success"
										type="text"
										placeholder="Text description"
										name="description"
										id="description"
										required=""
										value={this.state.description}
										onChange={(e) => this.setState({description: e.target.value})}
									/>
								</div>
							</div>
							<div className="field is-grouped example-stats" style={{gap: '0.5rem'}}>
								<div className="example-stats">
									<input
										type="radio"
										style={{cursor: 'pointer'}}
										name={'Easy'}
										checked={tag === 'Easy' ? true : false}
										onChange={(e) => {
											this.setState({tag: 'Easy'})
										}}
									/>
									Easy
								</div>
								<div className="example-stats">
									<input
										type="radio"
										style={{cursor: 'pointer'}}
										name={'Medium'}
										checked={tag === 'Medium' ? true : false}
										onChange={(e) => {
											this.setState({tag: 'Medium'})
										}}
									/>
									Medium
								</div>
								<div className="example-stats">
									<input
										type="radio"
										style={{cursor: 'pointer'}}
										name={'Tough'}
										checked={tag === 'Tough' ? true : false}
										onChange={(e) => {
											this.setState({tag: 'Tough'})
										}}
									/>
									Tough
								</div>
							</div>

							{exampleDetails ? (
								<div className="field is-grouped">
									<div className="control">
										<button className="button is-link" onClick={this.state.exampleId && this.state.title != '' ? this.handleUpdateExampleById : this.handleSubmit}>
											Save Example
										</button>
									</div>
									{exampleDetails.title && JSON.parse(getCacheItem(CacheTypes.UserData)).admin ? (
										<div className="">
											<button className="button is-link is-light" onClick={this.handleDeleteExample}>
												Delete
											</button>
										</div>
									) : (
										exampleDetails.title &&
										exampleDetails.userId === JSON.parse(getCacheItem(CacheTypes.UserData)).id && (
											<div className="">
												<button className="button is-link is-light" onClick={this.handleDeleteExample}>
													Delete
												</button>
											</div>
										)
									)}
								</div>
							) : (
								exampleDetails.userId == undefined && (
									<div className="field is-grouped">
										<div className="control">
											<button className="button is-link" onClick={this.handleSubmit}>
												Save Example
											</button>
										</div>
									</div>
								)
							)}
						</div>
					</div>
				</div>
			</>
		)
	}
}

const mapStateToProps = (state) => {
	return {
		login: state.auth.login,
		singleExample: state.auth.singleExample,
		userExamples: state.auth.userExamples,
		allExamples: state.auth.allExamples
	}
}

export default connect(mapStateToProps)(ExampleFormModel)
