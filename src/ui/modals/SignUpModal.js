/**
 * it renders the signup popup and communicates with the server via the doLogin function present in APIs.
 */

import React, { Component } from 'react'
import { connect } from 'react-redux'

import { doSignUp } from '../../apis'
import Loader from '../components/Loader'
import { CacheTypes, getCacheItem, setCacheItem } from '../../utils/LocalStorage'
import { loginUser } from '../../actions/authActions'

class SignUpModal extends Component {
	constructor(props) {
		super(props)
		this.state = {
			username: '',
			password: '',
			loading: false,
			error: false,
			signUpError: ''
		}
	}

	closeSignUpModal = () => {
		this.props.closeSignUpModal()
	}

	handleSubmit = async () => {
		this.setState({ loading: true })
		let response = await doSignUp(this.state.username, this.state.password)
		if (response && response.username) {
			setCacheItem(CacheTypes.UserData, JSON.stringify({ username: response.username, id: response._id, admin: response.admin }))
			this.props.dispatch(loginUser(true))
			this.props.closeSignUpModal()
		} else {
			if (response.success == false) {
				this.setState({ loading: false, error: true, signUpError: response.message })
			} else {
				this.setState({ loading: false, error: true, signUpError: '' })
			}
		}
	}

	render() {
		const { loading, error, signUpError } = this.state
		return (
			<div class="modal is-active" id="signup">
				<Loader loading={loading} />
				<div class="modal-background" onClick={this.closeSignUpModal}></div>
				<div class="modal-content is-clipped">
					<div class="columns">
						<div class="column is-one-third"></div>
						<div class="column is-one-third">
							<div class="box">
								<div class="field">
									<label class="label">Username</label>
									<div class="control has-icons-left has-icons-right">
										<input class="input is-success" type="text" placeholder="Enter username" name="username" id="uname" required="" onChange={(e) => this.setState({ username: e.target.value })} />
										<span class="icon is-small is-left">
											<i class="fas fa-user"></i>
										</span>
										<span class="icon is-small is-right">
											<i class="fas fa-check"></i>
										</span>
									</div>
									<p class="help is-success">{signUpError ? '' : 'This username is available'}</p>
								</div>

								<div class="field">
									<label class="label">Password</label>
									<div class="control has-icons-left has-icons-right">
										<input class="input is-success" type="text" placeholder="Enter password" name="password" id="psw" required="" onChange={(e) => this.setState({ password: e.target.value })} />
										<span class="icon is-small is-left">
											<i class="fas fa-user"></i>
										</span>
										<span class="icon is-small is-right">
											<i class="fas fa-check"></i>
										</span>
									</div>
								</div>
								{error && <div style={{ color: 'red', marginBottom: '0.5rem' }}>{signUpError ? signUpError : 'Signup Failed'}</div>}
								<div class="field is-grouped">
									<div class="control">
										<button class="button is-link" onClick={this.handleSubmit}>
											Submit
										</button>
									</div>
									<div class="">
										<button class="button is-light" onClick={this.closeSignUpModal}>
											Cancel
										</button>
									</div>
								</div>
							</div>
						</div>
						<div class="column is-one-third"></div>
					</div>
				</div>
				<button class="modal-close is-large" aria-label="close" onClick={this.closeSignUpModal}></button>
			</div>
		)
	}
}

export default connect()(SignUpModal)
