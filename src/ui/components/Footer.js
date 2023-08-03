/**
 * this class renders the footer
 */

import React, {Component} from 'react'

class Footer extends Component {
	constructor(props) {
		super(props)
	}

	render() {
		return (
			<footer className="footer" id="test1">
				<div className="container">
					<div className="columns">
						<div className="column is-narrow has-text-centered">
							<img src="/assets/danceon_footer_img.png" className="footer_img" />
						</div>
						<div className="column">
							<div className="content">
								<p>
									<strong>danceON</strong> by the
									<a target="_blank" href="https://www.kayladesportes.com/project/dab/">
										&nbsp;Dancing Across Boundaries! Team at NYU
									</a>
									&nbsp;and&nbsp;
									<a target="_blank" href="https://www.stemfromdance.org">
										STEM From Dance
									</a>
									&nbsp;with support from the National Science Foundation (
									<a target="_blank" href="https://www.nsf.gov/awardsearch/showAward?AWD_ID=1933961&amp;HistoricalAwards=false">
										STEM+C 1933961
									</a>
									).
								</p>
								<p>
									The
									<a target="_blank" href="https://github.com/DancingAndDabbing/danceON">
										&nbsp;source code&nbsp;
									</a>
									is licensed
									<a target="_blank" href="http://opensource.org/licenses/mit-license.php">
										&nbsp;MIT
									</a>
									.
								</p>
							</div>
						</div>
					</div>
				</div>
			</footer>
		)
	}
}

export default Footer
