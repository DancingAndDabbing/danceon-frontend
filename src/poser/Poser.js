/**
 * it handles declaration history and revert code functionlaity.
 * in existing javascript code its also take care of excute function but in this project we move it to draw.js
 */

import React, {Component} from 'react'
import Movers from './Movers'

class Poser extends Component {
	constructor(props) {
		super(props)
		this.declarations = {text: '(pose) => [];', func: () => []}
		this.addWorkingCodeToHistory = this.addWorkingCodeToHistory.bind(this)
		this.movers = new Movers()
		this.declarationsHistory = [this.declarations]
		this.codeChanged = true
		this.usingOldCode = false
		// We can bind custom events based on where the user has progressed
		// All but the last event only get fired once on state change
		// The last event supports cases when the user has working code and
		// makes a change that is still working code
		this.events = {starting: [], editing: [], debugging: [], running: [], '*': [], runningChange: []} // any state change
		this.condition = 'starting'
	}

	//this conver plain text to new Function
	update = async (d) => {
		let func
		try {
			func = new Function(`return ${d}`.trim())()
		} catch (err) {
			if ((this.condition = 'debugging')) this.revertToPreviousCode()
			this.usingOldCode = true
			return false
		}
		this.declarations = {text: d, func: func}
		this.usingOldCode = false
		this.codeChanged = true //todo.. not required becuase we called this as callback
	}

	//if code was changed successfully than update the text and fucntion to working declariton history and save only 100
	//record for memory purpose
	addWorkingCodeToHistory() {
		if (this.codeChanged) {
			let workingDeclarations = {}
			workingDeclarations.text = this.declarations.text
			workingDeclarations.func = this.declarations.func
			this.declarationsHistory.unshift(workingDeclarations) //todo..purpose of this?why 100?
			this.declarationsHistory.length = Math.min(this.declarationsHistory.length, 100)
			this.codeChanged = false
		}
	}

	//incase user wants to revert to previous code than we serve first saved tet in declaration history
	revertToPreviousCode() {
		this.declarations = this.declarationsHistory[0]
		return this.declarations
	}

	clearMovers() {
		this.movers.clear()
	}

	render() {
		return null
	}
}

export default Poser
