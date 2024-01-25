/**
 * it simply handle/renders examples modal/ui
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'

import LoginModal from './LoginModal'
import SignUpModal from './SignUpModal'
import { doAutoLogin, doGetAllExamples, doGetMyExamples, doGetSearchAllExamples, doGetSearchMyExamples } from '../../apis'
import Loader from '../components/Loader'
import { loginUser, saveUserExamples, saveAllExamples, saveSingleExample } from '../../actions/authActions'
import { CacheTypes, getCacheItem, removeCacheItem, setCacheItem } from '../../utils/LocalStorage'
import ConfirmationModel from './ConfirmationModel'

class ExamplesModal extends Component {
	constructor(props) {
		super(props)
		this.state = {
			openLoginModal: false,
			openSignUpModal: false,
			login: getCacheItem(CacheTypes.UserData) ? true : false,
			examples: [],
			myExamples: [],
			searchQuery: '',
			loading: false,
			activeTab: 0,
			totalExamples: 0,
			page: 1,
			confirmationModel: false,
			saveSelectedExample: {}
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.examples.length != this.state.examples.length && this.state.examples.length && this.state.totalExamples != 0 && this.state.activeTab == 1) {
			this.getAllExamples(this.state.page + 1, false)
		}

		if (prevState.myExamples.length != this.state.myExamples.length && this.state.myExamples.length && this.state.totalExamples != 0 && this.state.activeTab == 0) {
			this.getMyExamples(this.state.page + 1, false)
		}

		if (this.props.login === true && prevProps.login !== this.props.login && prevProps.userExamples.examples.length == 0 && this.props.userExamples.examples.length == 0 && this.state.activeTab == 0) {
			this.getMyExamples()
		}

		if (this.props.login === true && prevProps.login !== this.props.login && prevProps.allExamples.examples.length == 0 && this.props.allExamples.examples.length == 0 && this.state.activeTab == 1) {
			this.getAllExamples()
		}

		if (prevState.activeTab != this.state.activeTab && this.state.activeTab == 0 && this.props.userExamples.examples.length && this.state.searchQuery.trim().length == 0 && this.props.login === true) {
			this.setState({ myExamples: this.props.userExamples.examples, totalExamples: this.props.userExamples.totalRecords ? this.props.userExamples.totalRecords : 0, page: this.props.userExamples.page ? this.props.userExamples.page : 1 })
		}

		if (prevState.activeTab != this.state.activeTab && this.state.activeTab == 1 && this.props.allExamples.examples.length && this.state.searchQuery.trim().length == 0 && this.props.login === true) {
			this.setState({ examples: this.props.allExamples.examples, totalExamples: this.props.allExamples.totalRecords ? this.props.allExamples.totalRecords : 0, page: this.props.allExamples.page ? this.props.allExamples.page : 1 })
		}
	}

	componentDidMount() {
		this.autoLogin()
		if (this.props.userExamples.examples.length && this.state.activeTab == 0 && this.state.examples.length == 0) {
			this.setState({ myExamples: this.props.userExamples.examples, totalExamples: this.props.userExamples.totalRecords, page: this.props.userExamples.page })
		} else if (this.props.userExamples.examples.length == 0 && this.state.activeTab == 0 && this.state.myExamples.length == 0) {
			this.getMyExamples()
		}

		if (this.props.allExamples.examples && this.state.examples.length == 0 && this.state.activeTab === 1) {
			this.setState({ examples: this.props.allExamples.examples, totalExamples: this.props.allExamples.totalRecords, page: this.props.allExamples.page })
		} else if (this.props.allExamples.examples.length == 0 && this.state.activeTab == 0 && this.state.examples.length == 0) {
			this.getAllExamples()
		}
	}

	autoLogin = async () => {
		const user = JSON.parse(getCacheItem(CacheTypes.UserData))
		if (user) {
			const response = await doAutoLogin(user.username, user.id)
			if (response && response.username) {
				setCacheItem(CacheTypes.UserData, JSON.stringify({ username: response.username, id: response._id, admin: response.admin }))
				this.props.loginUser(true)
				// this.getMyExamples()
			} else {
				removeCacheItem(CacheTypes.UserData)
				this.props.loginUser(false)
				this.setState({ loading: false, login: false })
			}
		} else {
			removeCacheItem(CacheTypes.UserData)
			this.props.loginUser(false)
			this.setState({ login: false })
		}
	}

	getAllExamples = async (page = 1, loading = true) => {
		if (this.props.login === true) {
			this.setState({ loading: loading })
			const response = await doGetAllExamples(page, this.state.examples.length)
			if (response.examples.length) {
				let responseData = this.state.examples.concat(response.examples)
				const uniqueExamples = Object.values(
					responseData.reduce((acc, item) => {
						acc[item._id] = item
						return acc
					}, {})
				)
				if (this.props.login === true) {
					this.props.saveAllExamples({ examples: uniqueExamples, totalRecords: response.remainingRecords, page: page })
					this.setState({ examples: uniqueExamples, totalExamples: response.remainingRecords, loading: false, page: page })
				}
				this.setState({ loading: false })
			} else {
				this.setState({ loading: false })
			}
		}
	}

	getMyExamples = async (page = 1, loading = true) => {
		if (this.props.login === true) {
			this.setState({ loading: loading })
			const response = await doGetMyExamples(page, this.state.myExamples.length)
			if (response.examples.length) {
				let responseData = this.state.myExamples.concat(response.examples)
				const uniqueExamples = Object.values(
					responseData.reduce((acc, item) => {
						acc[item._id] = item
						return acc
					}, {})
				)
				if (this.props.login === true) {
					this.props.saveUserExamples({ examples: uniqueExamples, totalRecords: response.remainingRecords, page: page })
					this.setState({ myExamples: uniqueExamples, totalExamples: response.remainingRecords, loading: false, page: page })
				}
				this.setState({ loading: false })
			} else {
				this.setState({ loading: false })
			}
		}
	}

	searchAllExamples = async (page = 1, query) => {
		if (this.state.login === true && query.trim().length) {
			const response = await doGetSearchAllExamples(page, this.state.examples.length, query)
			if (response.examples) {
				const uniqueExamples = Object.values(
					response.examples.reduce((acc, item) => {
						acc[item._id] = item
						return acc
					}, {})
				)
				if (this.props.login === true) {
					this.setState({ examples: uniqueExamples, totalExamples: 0 })
				}
			}
		} else if (query.trim().length == 0) {
			this.setState({ examples: this.props.allExamples.examples, totalExamples: 0 })
		}
	}

	searchMyExamples = async (page = 1, query) => {
		if (this.props.login === true && query.trim().length) {
			const response = await doGetSearchMyExamples(page, this.state.myExamples.length, query)
			if (response.examples) {
				const uniqueExamples = Object.values(
					response.examples.reduce((acc, item) => {
						acc[item.id] = item
						return acc
					}, {})
				)
				if (this.props.login === true) {
					this.setState({ myExamples: uniqueExamples, totalExamples: 0 })
				}
			} else if (query.trim().length == 0) {
				this.setState({ myExamples: this.props.userExamples.examples, totalExamples: 0 })
			}
		}
	}

	closeModal = () => {
		this.props.closeControlModal()
	}

	// handleSearchInputChange = (event) => {
	// 	this.setState({loading: true})
	// 	this.setState({searchQuery: event.target.value, loading: false})
	// }

	handleSearchInputChange = (event) => {
		this.setState({ searchQuery: event.target.value })
		if (event.target.value.trim().length && this.state.activeTab == 0 && this.state.totalExamples != 0) {
			this.searchMyExamples(1, event.target.value)
		} else if (event.target.value.trim().length == 0 && this.state.activeTab == 0) {
			this.setState({ myExamples: this.props.userExamples.examples, totalExamples: this.props.userExamples.totalRecords, page: this.props.userExamples.page })
		}
		if (event.target.value.trim().length && this.state.activeTab == 1 && this.state.totalExamples != 0) {
			this.searchAllExamples(1, event.target.value)
		} else if (event.target.value.trim().length == 0 && this.state.activeTab == 1) {
			this.setState({ examples: this.props.allExamples.examples, totalExamples: this.props.allExamples.totalRecords, page: this.props.allExamples.page })
		}
	}

	render() {
		const { examples, searchQuery, loading, myExamples, activeTab, saveSelectedExample, confirmationModel } = this.state
		let totalExamples = activeTab == 0 ? myExamples : activeTab == 1 && examples

		if (this.state.totalExamples == 0) {
			totalExamples = totalExamples.length ? totalExamples.filter((example) => example.title.toLowerCase().includes(searchQuery.toLowerCase()) || example.description.toLowerCase().includes(searchQuery.toLowerCase())) : []
		}

		return (
			<>
				<div className="modal is-active" id="egID">
					<Loader loading={loading} />
					<div className="modal-background"></div>
					<div className="modal-content">
						<section>
							<div className="level modal-nav has-background-light is-fixed-top">
								<div className="level-left">
									<p className="modal-card-title">Examples</p>
								</div>
								<div className="level-right">
									<div className="buttons">
										{this.state.login ? (
											<button
												className="button button is-light js-modal-trigger"
												id="auth-login"
												data-target="login"
												onClick={() => {
													this.props.saveSingleExample({})
													this.props.saveAllExamples({ examples: [], page: 1 })
													this.props.saveUserExamples({ examples: [], page: 1 })
													this.setState({ examples: [], myExamples: [], login: false, page: 1, searchQuery: '' })
													this.props.loginUser(false)
													removeCacheItem(CacheTypes.UserData)
												}}>
												Logout
											</button>
										) : (
											<>
												<button
													className="button button is-light js-modal-trigger"
													id="auth-login"
													data-target="login"
													onClick={() => {
														this.setState({ openLoginModal: true })
													}}>
													Login
												</button>
												<button
													className="button button is-light js-modal-trigger"
													id="auth-signup"
													data-target="signup"
													onClick={() => {
														this.setState({ openSignUpModal: true })
													}}>
													Sign Up
												</button>
											</>
										)}
										<button className="delete" aria-label="close" onClick={this.closeModal}></button>
									</div>
								</div>
							</div>
						</section>
						<div className="modal-body eg-body has-background-light">
							<div className="field has-addons">
								<div className="control search-input">
									<input className="input" type="text" placeholder="Search examples" id="search" value={searchQuery} onChange={this.handleSearchInputChange} />
								</div>
							</div>
							<div className="tabs">
								<button
									className={this.state.activeTab === 0 ? 'tab_button active' : 'tab_button'}
									onClick={() => {
										this.setState({ activeTab: 0, page: 1, totalExamples: 0, searchQuery: '' })
										if (this.props.userExamples.examples.length == 0) {
											this.setState({ myExamples: [], totalExamples: 0 })
											this.getMyExamples()
										}
									}}>
									My Examples
								</button>
								<button
									className={this.state.activeTab === 1 ? 'tab_button active' : 'tab_button'}
									onClick={() => {
										this.setState({ activeTab: 1, page: 1, totalExamples: 0, searchQuery: '' })
										if (this.props.allExamples.examples.length == 0) {
											this.setState({ examples: [], totalExamples: 0 })
											this.getAllExamples()
										}
									}}>
									All Examples
								</button>
							</div>
							<div className="container is-clipped">
								<div className="card-container columns is-centered is-multiline" id="exampleID">
									<div className="column" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
										{totalExamples.length
											? totalExamples.map((res, index) => {
												return (
													<div className="card" style={{ width: '240px', marginBottom: '0.5rem' }} key={index}>
														<div className="card-header">
															<p className="card-header-title">{res.title}</p>
														</div>

														<div
															className=""
															onClick={() => {
																this.setState({ saveSelectedExample: res, confirmationModel: true })
															}}
															style={{ cursor: 'pointer' }}>
															<a href={`#`}>
																<div style={{ backgroundImage: `url(${res.image ? process.env.REACT_APP_IMAGE_URL ? process.env.REACT_APP_IMAGE_URL + res.image : 'https://danceonstuff.s3.amazonaws.com/' + res.image : '/assets/devil-face-icon.png'})` }} id="egImage" className={res.image && ' image is-3by4'} />

																<div className="card-content">
																	{/* <div className="">{res.title}</div> */}
																	{/* <div className="">persistent state!</div> */}
																	<div className="content">{res.description}</div>
																</div>
															</a>
														</div>
													</div>
												)
											})
											: ''}
									</div>
								</div>

								{/* {this.state.totalExamples != 0 && totalExamples.length && !loading && (
									 <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
										 <button
											 className="button is-link"
											 onClick={() => {
												 this.setState({page: this.state.page + 1})
												 if (this.state.activeTab === 0) {
													 this.getMyExamples(this.state.page + 1)
												 } else if (this.state.activeTab === 1) {
													 this.getAllExamples(this.state.page + 1)
												 }
											 }}>
											 Load More
										 </button>
									 </div>
								 )} */}
								{totalExamples.length == 0 && !loading ? <div style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>no examples found</div> : ''}
							</div>
						</div>
					</div>
				</div>
				{this.state.openLoginModal && (
					<LoginModal
						closeLoginModal={() => {
							if (getCacheItem(CacheTypes.UserData)) {
								this.setState({ login: true })
							}
							this.setState({ openLoginModal: false })
						}}
					/>
				)}
				{this.state.openSignUpModal && (
					<SignUpModal
						closeSignUpModal={() => {
							if (getCacheItem(CacheTypes.UserData)) {
								this.setState({ login: true })
							}
							this.setState({ openSignUpModal: false })
						}}
					/>
				)}

				{confirmationModel && (
					<ConfirmationModel
						closeModal={() => this.setState({ confirmationModel: false, saveSelectedExample: {} })}
						title={'Overwrite ?'}
						body={'Are you sure you want to overwrite editor code with this example ?'}
						onContinue={() => {
							this.props.saveSingleExample({})
							setTimeout(() => {
								this.props.saveSingleExample(saveSelectedExample)
							}, 300)
							this.closeModal()
							// this.props.saveSingleExample(saveSelectedExample)
							// this.closeModal()
						}}
						overwriteModel={true}
					/>
				)}
			</>
		)
	}
}

const mapStateToProps = (state) => {
	return {
		login: state.auth.login,
		userExamples: state.auth.userExamples,
		allExamples: state.auth.allExamples
	}
}

const mapDispatchToProps = {
	loginUser,
	saveUserExamples,
	saveAllExamples,
	saveSingleExample
}
export default connect(mapStateToProps, mapDispatchToProps)(ExamplesModal)
