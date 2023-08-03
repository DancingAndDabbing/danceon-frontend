/**
 * this class renders loading spinner
 */

import React from 'react'

class Loader extends React.Component {
	render() {
		return (
			<div className="spinner-loader" style={{display: this.props.loading ? 'block' : 'none'}}>
				<div className="loader-content">
					<div className="loader-spinner"></div>
					<div className="loader-text">Loading...</div>
				</div>
			</div>
		)
	}
}

export default Loader
