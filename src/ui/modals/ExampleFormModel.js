import React, { Component } from 'react'
import { connect } from 'react-redux'
import { loginUser, saveAllExamples, saveSingleExample, saveUserExamples } from '../../actions/authActions'

import Loader from '../components/Loader'
import { CacheTypes, getCacheItem, setCacheItem } from '../../utils/LocalStorage'
import { doAddExamples, doDeleteExamples, doGetExampleById, doUpdateExampleById } from '../../apis'
import ConfirmationModel from './ConfirmationModel'

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
			titleError: false,
			deleteExampleModel: false,
			error: ''
		}
	}

	closeModal = () => {
		this.props.closeModal()
	}

	componentDidMount() {
		if (this.props.singleExample.title) {
			let response = this.props.singleExample
			this.setState({ exampleDetails: response, title: this.props.title ? this.props.title : response.title, description: response.description, tag: response.tags, exampleId: response._id })
			// this.props.editorRef.current.setExampleCodeOnEditor(response.examples)
		}
	}

	componentDidUpdate(prevProps) {
		this.props.dispatch(loginUser(getCacheItem(CacheTypes.UserData) ? true : false))
	}

	updateCompileStatus = async (isCompile, isCodeUpdated) => {
		this.setState({ isCompile: isCompile, step: isCodeUpdated == true ? 2 : 1 })
	}

	compressImage = async (base64String, quality = 0.5) => {
		return await new Promise((resolve, reject) => {
			const img = new Image()
			img.src = base64String

			img.onload = () => {
				const canvas = document.createElement('canvas')
				const ctx = canvas.getContext('2d')

				// Set canvas dimensions to match the image
				canvas.width = img.width
				canvas.height = img.height

				// Draw the image onto the canvas
				ctx.drawImage(img, 0, 0, img.width, img.height)

				// Compress the image to the specified quality
				canvas.toBlob(
					(blob) => {
						const reader = new FileReader()
						reader.readAsDataURL(blob)
						reader.onloadend = () => {
							const compressedBase64 = reader.result
							resolve(compressedBase64)
						}
					},
					'image/jpeg',
					quality
				)
			}

			img.onerror = (error) => reject(error)
		})
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
			this.setState({ loading: true })
			const user = JSON.parse(getCacheItem(CacheTypes.UserData))
			const imageData =
				this.props.isVideo == true
					? await this.compressImage(this.props.videoRef.current.videoCanvas.ctx.canvas.toDataURL('image/png'))
					: await this.compressImage(this.props.cameraRef.current.cameraCanvas.ctx.canvas.toDataURL('image/png'))
						.then((result) => result)
						.catch((error) => console.error('Error:', error))
			let response = await doAddExamples('', this.props.editorRef.current.currentCode, this.state.title, this.state.description, this.state.tag, imageData, user.id)
			if (response && response.title) {
				this.setState({ title: '', description: '', tag: 'Easy', loading: false })
				this.props.closeModal(true)
				this.props.dispatch(saveSingleExample(response))
				this.props.dispatch(saveUserExamples({ examples: [...this.props.userExamples.examples, response], totalRecords: this.props.userExamples.totalRecords, page: this.props.userExamples.page }))
				this.props.dispatch(saveAllExamples({ examples: [...this.props.allExamples.examples, response], totalRecords: this.props.allExamples.totalRecords, page: this.props.allExamples.page }))
			} else {
				if (response.success == false) {
					this.setState({ loading: false, titleError: this.state.title ? false : true, error: response.message })
				} else {
					this.setState({ loading: false, titleError: this.state.title ? false : true, error: '' })
				}
			}
		} else {
			this.setState({ titleError: this.state.title ? false : true })
		}
	}

	handleDeleteExample = async () => {
		if (this.state.exampleId) {
			this.setState({ loading: true })
			await doDeleteExamples(this.state.exampleId)

			this.props.dispatch(saveSingleExample({}))
			let updatedExample = this.props.userExamples.examples.filter((example) => {
				return example._id !== this.state.exampleId && example.title
			})

			let updatedAllExample = this.props.allExamples.examples.filter((example) => {
				return example._id !== this.state.exampleId && example.title
			})

			this.props.dispatch(saveUserExamples({ examples: updatedExample, totalRecords: this.props.userExamples.totalRecords - 1 > 0 ? this.props.userExamples.totalRecords - 1 : 0, page: this.props.userExamples.page }))
			this.props.dispatch(saveAllExamples({ examples: updatedAllExample, totalRecords: this.props.allExamples.totalRecords - 1 > 0 ? this.props.allExamples.totalRecords - 1 : 0, page: this.props.allExamples.page }))
			this.props.closeModal()
			this.setState({ title: '', description: '', tag: 'Easy', loading: false, deleteExampleModel: false })
		}
	}

	handleUpdateExampleById = async (id) => {
		let user = JSON.parse(getCacheItem(CacheTypes.UserData))
		if (user && this.state.exampleDetails.userId != user.id) {

			this.handleSubmit()
		} else if (this.state.title) {
			this.setState({ loading: true })
			const imageData =
				this.props.isVideo == true
					? await this.compressImage(this.props.videoRef.current.videoCanvas.ctx.canvas.toDataURL('image/png'))
					: await this.compressImage(this.props.cameraRef.current.cameraCanvas.ctx.canvas.toDataURL('image/png'))
						.then((result) => result)
						.catch((error) => console.error('Error:', error))
			let response = await doUpdateExampleById(this.state.exampleId, this.props.editorRef.current.currentCode, this.state.title, this.state.description, this.state.tag, imageData)
			if (response.title) {
				this.setState({ title: response.title, description: response.description, tag: response.tags, loading: false })
				this.props.dispatch(saveSingleExample(response))
				let updatedExample = this.props.userExamples.examples.map((example) => {
					if (example._id == response._id) {
						return response
					} else {
						return example
					}
				})
				let updatedinAllExample = this.props.allExamples.examples.map((example) => {
					if (example._id == response._id) {
						return response
					} else {
						return example
					}
				})
				this.props.editorRef.current.setExampleCodeOnEditor(response.examples)
				this.props.dispatch(saveUserExamples({ examples: updatedExample, totalRecords: this.props.userExamples.totalRecords, page: this.props.userExamples.page }))
				this.props.dispatch(saveAllExamples({ examples: updatedinAllExample, totalRecords: this.props.allExamples.totalRecords, page: this.props.allExamples.page }))
				this.props.closeModal(true)
			} else {
				if (response.success == false) {
					this.setState({ loading: false, titleError: this.state.title ? false : true, error: response.message })
				} else {
					this.setState({ loading: false, titleError: this.state.title ? false : true, error: '' })
				}
			}
		} else {
			this.setState({ titleError: this.state.title ? false : true })
		}
	}

	render() {
		const { tag, loading, exampleDetails, titleError, deleteExampleModel, error } = this.state
		return (
			<>
				<div className="modal is-active" id="egID">
					<div className="modal-background"></div>
					<div className="modal-content">
						<div className="box">
							<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
								<button className="delete" aria-label="close" onClick={this.closeModal}></button>
							</div>

							<Loader loading={loading} />
							<div className="field">
								<label className="label">Title</label>
								<div className="control">
									<input className="input is-success" type="text" placeholder="Text title" name="title" id="title" value={this.state.title} required="" onChange={(e) => this.setState({ title: e.target.value, titleError: false })} />
								</div>
								{titleError && <div style={{ color: 'red', marginBottom: '0.5rem' }}>Title is required</div>}
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
										onChange={(e) => this.setState({ description: e.target.value })}
									/>
								</div>
							</div>
							<div className="field is-grouped example-stats" style={{ gap: '0.5rem' }}>
								<div className="example-stats">
									<input
										type="radio"
										style={{ cursor: 'pointer' }}
										name={'Easy'}
										checked={tag === 'Easy' ? true : false}
										onChange={(e) => {
											this.setState({ tag: 'Easy' })
										}}
									/>
									Easy
								</div>
								<div className="example-stats">
									<input
										type="radio"
										style={{ cursor: 'pointer' }}
										name={'Medium'}
										checked={tag === 'Medium' ? true : false}
										onChange={(e) => {
											this.setState({ tag: 'Medium' })
										}}
									/>
									Medium
								</div>
								<div className="example-stats">
									<input
										type="radio"
										style={{ cursor: 'pointer' }}
										name={'Tough'}
										checked={tag === 'Tough' ? true : false}
										onChange={(e) => {
											this.setState({ tag: 'Tough' })
										}}
									/>
									Tough
								</div>
							</div>
							{error && <div style={{ color: 'red', marginBottom: '0.5rem' }}>{error}</div>}

							{exampleDetails ? (
								<div className="field is-grouped">
									<div className="control">
										<button className="button is-link" onClick={this.state.exampleId && this.state.title != '' ? this.handleUpdateExampleById : this.handleSubmit}>
											Save Example
										</button>
									</div>
									{exampleDetails.title && JSON.parse(getCacheItem(CacheTypes.UserData)).admin ? (
										<div className="">
											<button className="button is-link is-light" onClick={() => this.setState({ deleteExampleModel: true })}>
												Delete
											</button>
										</div>
									) : (
										exampleDetails.title &&
										exampleDetails.userId == JSON.parse(getCacheItem(CacheTypes.UserData)).id && (
											<div className="">
												<button className="button is-link is-light" onClick={() => this.setState({ deleteExampleModel: true })}>
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

							{deleteExampleModel && (
								<ConfirmationModel
									closeModal={() => this.setState({ deleteExampleModel: false })}
									title={'Delete Example ?'}
									body={'Are you sure you want to delete this example ?'}
									onDelete={this.handleDeleteExample}
									deleteModel={true}
								/>
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
