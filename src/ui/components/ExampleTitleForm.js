import React, {Component} from 'react'
import {connect} from 'react-redux'

import Loader from './Loader'
import {loginUser, saveAllExamples, saveSingleExample, saveUserExamples} from '../../actions/authActions'
import {CacheTypes, getCacheItem, setCacheItem} from '../../utils/LocalStorage'
import ExampleFormModel from '../modals/ExampleFormModel'
import {doDeleteExamples, doGetExampleById} from '../../apis'
import ConfirmationModel from '../modals/ConfirmationModel'

class ExampleTitleForm extends Component {
	constructor(props) {
		super(props)
		this.state = {
			isCompile: true,
			step: 1,
			title: '',
			description: '',
			exampleId: '',
			loading: false,
			exampleDetails: {},
			openModel: false,
			deleteExampleModel: false
		}
	}

	componentDidUpdate(prevProps) {
		this.props.dispatch(loginUser(getCacheItem(CacheTypes.UserData) ? true : false))

		if (prevProps.singleExample != this.props.singleExample) {
			const response = this.props.singleExample
			this.setState({exampleDetails: response, title: response.title ? response.title : '', description: response.description ? response.description : '', exampleId: response._id ? response._id : ''})
			if (response.examples) {
				this.props.editorRef.current.setExampleCodeOnEditor(response.examples)
			} else {
				this.props.editorRef.current.setExampleCodeOnEditor(this.props.editorRef.current.STARTING_CODE)
			}
		}
	}

	updateCompileStatus = async (isCompile, isCodeUpdated) => {
		this.setState({isCompile: isCompile, step: isCodeUpdated == true ? 2 : 1})
	}

	handleDeleteExample = async () => {
		if (this.state.exampleId) {
			this.setState({loading: true, title: ''})
			await doDeleteExamples(this.state.exampleId)

			this.props.dispatch(saveSingleExample({}))

			let updatedExample = this.props.userExamples.examples.filter((example) => {
				return example._id !== this.state.exampleId && example.title
			})

			let updatedAllExample = this.props.allExamples.examples.filter((example) => {
				return example._id !== this.state.exampleId && example.title
			})

			this.props.dispatch(saveUserExamples({examples: updatedExample, totalRecords: this.props.userExamples.totalRecords - 1 > 0 ? this.props.userExamples.totalRecords - 1 : 0, page: this.props.userExamples.page}))
			this.props.dispatch(saveAllExamples({examples: updatedAllExample, totalRecords: this.props.allExamples.totalRecords - 1 > 0 ? this.props.allExamples.totalRecords - 1 : 0, page: this.props.allExamples.page}))
			this.setState({title: '', loading: false, deleteExampleModel: false})
			// this.props.dispatch(saveUserExamples({examples: updatedExample, totalRecords: this.props.userExamples.totalRecords - 1 > 0 ? this.props.userExamples.totalRecords - 1 : 0, page: this.props.userExamples.page}))
		}
	}

	render() {
		const {loading, exampleDetails, deleteExampleModel} = this.state
		return this.props.login ? (
			<div className="field is-grouped top_ui_gap">
				<Loader loading={loading} />

				<div className="field top_input">
					<div className="control">
						<input className="input is-success " type="text" placeholder="Enter title" name="title" id="title" value={this.state.title} onChange={(e) => this.setState({title: e.target.value})} />
					</div>
				</div>

				<div className="field is-grouped">
					<div className="control">
						<button className="button is-link" onClick={() => this.setState({openModel: true})}>
							Save
						</button>
					</div>
					{exampleDetails.title && JSON.parse(getCacheItem(CacheTypes.UserData)).admin ? (
						<div className="">
							<button className="button is-link is-light" onClick={() => this.setState({deleteExampleModel: true})}>
								Delete
							</button>
						</div>
					) : (
						exampleDetails.title &&
						exampleDetails.userId === JSON.parse(getCacheItem(CacheTypes.UserData)).id && (
							<div className="">
								<button className="button is-link is-light" onClick={() => this.setState({deleteExampleModel: true})}>
									Delete
								</button>
							</div>
						)
					)}
				</div>

				{this.state.openModel === true && (
					<ExampleFormModel
						closeModal={(e) => {
							this.setState({openModel: false})
						}}
						editorRef={this.props.editorRef}
						isVideo={this.props.isVideo}
						cameraRef={this.props.cameraRef}
						videoRef={this.props.videoRef}
						title={this.state.title}
					/>
				)}
				{deleteExampleModel && (
					<ConfirmationModel closeModal={() => this.setState({deleteExampleModel: false})} title={'Delete Example ?'} body={'Are you sure you want to delete this example ?'} onDelete={this.handleDeleteExample} deleteModel={true} />
				)}
			</div>
		) : null
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

export default connect(mapStateToProps)(ExampleTitleForm)
