/**
 * it simply handle/renders examples modal/ui
 */

import React, {Component} from 'react'
import {connect} from 'react-redux'

import LoginModal from './LoginModal'
import SignUpModal from './SignUpModal'
import {doAutoLogin, doGetAllExamples, doGetMyExamples, doGetSearchAllExamples, doGetSearchMyExamples} from '../../apis'
import Loader from '../components/Loader'
import {loginUser, saveUserExamples, saveAllExamples, saveSingleExample} from '../../actions/authActions'
import {CacheTypes, getCacheItem, removeCacheItem, setCacheItem} from '../../utils/LocalStorage'

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
			page: 1
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.login === true && prevProps.login !== this.props.login && prevProps.userExamples.examples.length == 0 && this.props.userExamples.examples.length == 0) {
			this.getMyExamples()
		}

		if (prevState.activeTab != this.state.activeTab && this.state.activeTab == 0 && this.props.userExamples.examples.length && this.state.searchQuery.trim().length == 0) {
			this.setState({myExamples: this.props.userExamples.examples, totalExamples: this.props.userExamples.totalRecords ? this.props.userExamples.totalRecords : 0, page: this.props.userExamples.page ? this.props.userExamples.page : 1})
		}

		if (prevState.activeTab != this.state.activeTab && this.state.activeTab == 1 && this.props.allExamples.examples.length && this.state.searchQuery.trim().length == 0) {
			this.setState({examples: this.props.allExamples.examples, totalExamples: this.props.allExamples.totalRecords ? this.props.allExamples.totalRecords : 0, page: this.props.allExamples.page ? this.props.allExamples.page : 1})
		}
	}

	componentDidMount() {
		this.autoLogin()
		if (this.props.userExamples.examples.length && this.state.activeTab == 0 && this.state.examples.length == 0) {
			this.setState({myExamples: this.props.userExamples.examples, totalExamples: this.props.userExamples.totalRecords, page: this.props.userExamples.page})
		} else if (this.props.userExamples.examples.length == 0 && this.state.activeTab == 0 && this.state.examples.length == 0) {
			this.getMyExamples()
		}

		if (this.props.allExamples.examples && this.state.examples.length == 0 && this.state.activeTab === 1) {
			this.setState({examples: this.props.allExamples.examples, totalExamples: this.props.allExamples.totalRecords, page: this.props.allExamples.page})
		}
	}

	autoLogin = async () => {
		const user = JSON.parse(getCacheItem(CacheTypes.UserData))
		if (user) {
			const response = await doAutoLogin(user.username, user.id)
			if (response && response.username) {
				setCacheItem(CacheTypes.UserData, JSON.stringify({username: response.username, id: response._id, admin: response.admin}))
				this.props.loginUser(true)
				// this.getMyExamples()
			} else {
				removeCacheItem(CacheTypes.UserData)
				this.props.loginUser(false)
				this.setState({loading: false, login: false})
			}
		} else {
			removeCacheItem(CacheTypes.UserData)
			this.props.loginUser(false)
			this.setState({login: false})
		}
	}

	getAllExamples = async (page = 1) => {
		if (this.state.login === true) {
			this.setState({loading: true})
			const response = await doGetAllExamples(page, this.state.examples.length)
			if (response) {
				let responseData = this.state.examples.concat(response.examples)
				const uniqueExamples = Object.values(
					responseData.reduce((acc, item) => {
						acc[item._id] = item
						return acc
					}, {})
				)
				this.props.saveAllExamples({examples: uniqueExamples, totalRecords: response.remainingRecords, page: page})
				this.setState({examples: uniqueExamples, totalExamples: response.remainingRecords, loading: false})
			} else {
				this.setState({loading: false})
			}
		}
	}

	getMyExamples = async (page = 1) => {
		if (this.props.login === true) {
			this.setState({loading: true})
			const response = await doGetMyExamples(page, this.state.myExamples.length)
			if (response) {
				let responseData = this.state.myExamples.concat(response.examples)
				const uniqueExamples = Object.values(
					responseData.reduce((acc, item) => {
						acc[item._id] = item
						return acc
					}, {})
				)
				this.props.saveUserExamples({examples: uniqueExamples, totalRecords: response.remainingRecords, page: page})
				this.setState({myExamples: uniqueExamples, totalExamples: response.remainingRecords, loading: false})
			} else {
				this.setState({loading: false})
			}
		}
	}

	searchAllExamples = async (page = 1) => {
		if (this.state.login === true) {
			this.setState({loading: true})
			const response = await doGetSearchAllExamples(page, this.state.examples.length, this.state.searchQuery)
			if (response) {
				const uniqueExamples = Object.values(
					response.examples.reduce((acc, item) => {
						acc[item._id] = item
						return acc
					}, {})
				)
				this.setState({examples: uniqueExamples, totalExamples: 0, loading: false})
			} else {
				this.setState({loading: false})
			}
		}
	}

	searchMyExamples = async (page = 1) => {
		if (this.props.login === true) {
			this.setState({loading: true})
			const response = await doGetSearchMyExamples(page, this.state.myExamples.length, this.state.searchQuery)
			if (response) {
				const uniqueExamples = Object.values(
					response.examples.reduce((acc, item) => {
						acc[item._id] = item
						return acc
					}, {})
				)

				this.setState({myExamples: uniqueExamples, totalExamples: 0, loading: false})
			} else {
				this.setState({loading: false})
			}
		}
	}

	closeModal = () => {
		this.props.closeControlModal()
	}

	handleSearchInputChange = (event) => {
		this.setState({loading: true})
		this.setState({searchQuery: event.target.value, loading: false})
	}

	handleKeyPress = (event) => {
		if (event.key === 'Enter') {
			event.preventDefault()
			if (this.state.searchQuery.trim().length && this.state.activeTab == 0) {
				this.searchMyExamples()
			} else if (this.state.searchQuery.trim().length == 0 && this.state.activeTab == 0) {
				this.setState({myExamples: this.props.userExamples.examples, totalExamples: this.props.userExamples.totalRecords, page: this.props.userExamples.page})
			}
			if (this.state.searchQuery.trim().length && this.state.activeTab == 1) {
				this.searchAllExamples()
			} else if (this.state.searchQuery.trim().length == 0 && this.state.activeTab == 1) {
				this.setState({examples: this.props.allExamples.examples, totalExamples: this.props.allExamples.totalRecords, page: this.props.allExamples.page})
			}
		}
	}

	render() {
		const {examples, searchQuery, loading, myExamples, activeTab} = this.state
		let totalExamples = activeTab == 0 ? myExamples : activeTab == 1 && examples

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
													this.props.loginUser(false)
													removeCacheItem(CacheTypes.UserData)
													this.props.saveSingleExample({})
													this.props.saveAllExamples({examples: [], page: 1})
													this.props.saveUserExamples({examples: [], page: 1})
													this.setState({examples: [], myExamples: [], login: false, page: 1, searchQuery: ''})
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
														this.setState({openLoginModal: true})
													}}>
													Login
												</button>
												<button
													className="button button is-light js-modal-trigger"
													id="auth-signup"
													data-target="signup"
													onClick={() => {
														this.setState({openSignUpModal: true})
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
									<input className="input" type="text" placeholder="Search examples" id="search" value={searchQuery} onKeyPress={this.handleKeyPress} onChange={this.handleSearchInputChange} />
								</div>
							</div>
							<div className="tabs">
								<button
									className={this.state.activeTab === 0 ? 'tab_button active' : 'tab_button'}
									onClick={() => {
										this.setState({activeTab: 0, page: 1, totalExamples: 0})
										if (this.props.userExamples.examples.length == 0) {
											this.setState({myExamples: [], totalExamples: 0})
											this.getMyExamples()
										}
									}}>
									My Examples
								</button>
								<button
									className={this.state.activeTab === 1 ? 'tab_button active' : 'tab_button'}
									onClick={() => {
										this.setState({activeTab: 1, page: 1, totalExamples: 0})
										if (this.props.allExamples.examples.length == 0) {
											this.setState({examples: [], totalExamples: 0})
											this.getAllExamples()
										}
									}}>
									All Examples
								</button>
							</div>
							<div className="container is-clipped">
								<div className="card-container columns is-centered is-multiline" id="exampleID">
									<div className="column" style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
										{totalExamples.length
											? totalExamples.map((res, index) => {
													return (
														<div className="card" style={{width: '240px', marginBottom: '0.5rem'}} key={index}>
															<div className="card-header">
																<p className="card-header-title">states {index + 1}</p>
															</div>

															<div
																className="container"
																onClick={() => {
																	this.props.saveSingleExample(res)
																	this.closeModal()
																}}
																style={{cursor: 'pointer'}}>
																{/* <a href={`/?id=${res._id}`}> */}
																<>
																	<div style={{display: 'flex', justifyContent: 'center', margin: '0.5rem'}}>
																		<img src={res.image ? res.image : '/assets/devil-face-icon.png'} className={res.image && 'user_image'} style={{heigth: '10rem', width: '10rem'}} />
																	</div>

																	<div className="card-content">
																		<div className="">{res.title}</div>
																		{/* <div className="">persistent state!</div> */}
																		<div className="">{res.description}</div>
																	</div>
																</>
															</div>
														</div>
													)
											  })
											: ''}
									</div>
								</div>

								{this.state.totalExamples != 0 && totalExamples.length && !loading && (
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
								)}
								{totalExamples.length == 0 && !loading ? <div style={{whiteSpace: 'nowrap', textAlign: 'center'}}>no examples found</div> : ''}
							</div>
						</div>
					</div>
				</div>
				{this.state.openLoginModal && (
					<LoginModal
						closeLoginModal={() => {
							if (getCacheItem(CacheTypes.UserData)) {
								this.setState({login: true})
							}
							this.setState({openLoginModal: false})
						}}
					/>
				)}
				{this.state.openSignUpModal && (
					<SignUpModal
						closeSignUpModal={() => {
							if (getCacheItem(CacheTypes.UserData)) {
								this.setState({login: true})
							}
							this.setState({openSignUpModal: false})
						}}
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
