/**
 * it renders the login popup and communicates with the server via the doLogin function present in APIs.
 */

import React, { Component } from 'react'
import { connect, useDispatch } from 'react-redux'

import { doLogin } from '../../apis'
import Loader from '../components/Loader'
import { loginUser } from '../../actions/authActions'
import { CacheTypes, getCacheItem, setCacheItem } from '../../utils/LocalStorage'

class LoginModal extends Component {
	constructor(props) {
		super(props)
		this.state = {
			username: '',
			password: '',
			loading: false,
			error: false
		}
	}

	closeLoginModal = () => {
		this.props.closeLoginModal()
	}

	handleSubmit = async () => {
		this.setState({ loading: true })
		const response = await doLogin(this.state.username, this.state.password)
		if (response && response.username) {
			setCacheItem(CacheTypes.UserData, JSON.stringify({ username: response.username, id: response._id, admin: response.admin }))
			this.props.loginUser(true)
			this.props.closeLoginModal()
		} else {
			this.setState({ loading: false, error: true })
		}
	}

	render() {
		const { loading, error } = this.state

		return (
			<div className="modal is-active" id="login">
				<Loader loading={loading} />
				<div className="modal-background" onClick={this.closeLoginModal}></div>
				<div className="modal-content is-clipped">
					<div className="columns">
						<div className="column is-one-third"></div>
						<div className="column is-one-third">
							<div className="box">
								<div className="field">
									<label className="label">Username</label>
									<div className="control has-icons-left has-icons-right">
										<input
											className="input is-success"
											type="text"
											placeholder="Enter username"
											value={this.state.username}
											name="username"
											id="username"
											required=""
											onChange={(e) => this.setState({ username: e.target.value, error: false })}
										/>
										<span className="icon is-small is-left">
											<i className="fas fa-user"></i>
										</span>
										<span className="icon is-small is-right">
											<i className="fas fa-check"></i>
										</span>
									</div>
								</div>

								<div className="field">
									<label className="label">Password</label>
									<div className="control has-icons-left has-icons-right">
										<input
											className="input is-success"
											type="text"
											placeholder="Enter password"
											value={this.state.password}
											name="password"
											id="password"
											required=""
											onChange={(e) => this.setState({ password: e.target.value, error: false })}
										/>
										<span className="icon is-small is-left">
											<i className="fas fa-user"></i>
										</span>
										<span className="icon is-small is-right">
											<i className="fas fa-check"></i>
										</span>
									</div>
								</div>
								{error && <div style={{ color: 'red', marginBottom: '0.5rem' }}>Login failed</div>}
								<div className="field is-grouped">
									<div className="control">
										<button
											className="button is-link"
											onClick={() => {
												this.handleSubmit()
											}}>
											Submit
										</button>
									</div>
									<div className="">
										<button className="button is-light" onClick={this.closeLoginModal}>
											Cancel
										</button>
									</div>
								</div>
							</div>
						</div>
						<div className="column is-one-third"></div>
					</div>
				</div>

				<button className="modal-close is-large" aria-label="close" onClick={this.closeLoginModal}></button>
			</div>
		)
	}
}

const mapStateToProps = (state) => {
	return {
		login: state.auth.login
	}
}

const mapDispatchToProps = {
	loginUser
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginModal)
