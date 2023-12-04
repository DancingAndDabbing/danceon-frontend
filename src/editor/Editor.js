/**
 * react-ace is the package name
 * willie_custom theme is used as it is
 * : and . are used for auto compeltors
 */
import React, {Component} from 'react'
import AceEditor from 'react-ace'
import {addCompleter} from 'ace-builds/src-noconflict/ext-language_tools'

import * as esprima from 'esprima'

import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/src-noconflict/ext-language_tools'

import ace from 'ace-builds/src-noconflict/ace'

import Poser from '../poser/Poser'
import {KEY_POINT_NOT_TO_USE, POSE_PARTS, POSE_PART_POSITIONS, WHAT_TO_DRAW_WORDS, WORD_LIST} from '../utils/Helper'
import {CacheTypes, getCacheItem, setCacheItem} from '../utils/LocalStorage'
import WillieTheme from './WillieTheme'

//these are 3 global variables to access the specfic action done by user at multiple places
let poseAutoComplete = false
let posePositionAutoComplete = false
let whatAutoComplete = false

//this is require to use same theme as it was in classical mode setup by willie. nothing speical is done here. same code is used
ace.define('ace/theme/willie_custom', ['require', 'exports', 'module', 'ace/lib/dom'], WillieTheme)

class Editor extends Component {
	constructor(props) {
		super(props)
		this.editor = React.createRef()
		this.poser = new Poser()
		this.fontSize = getCacheItem(CacheTypes.Font)
		this.STARTING_CODE = `(pose) => [

];` //keep it as it is for farmatting only
		this.fromSetValueCall = false
		this.currentCode = this.STARTING_CODE
	}

	shouldComponentUpdate() {
		return false // Prevent re-renders
	}

	componentDidMount() {
		//completer is hooked inside componentDidMount.. due to this words mapping will be shown to user in popup
		addCompleter({
			getCompletions: function (editor, session, pos, prefix, callback) {
				let wordsToShow = WORD_LIST
				if (poseAutoComplete) {
					wordsToShow = POSE_PARTS
				} else if (posePositionAutoComplete) {
					wordsToShow = POSE_PART_POSITIONS
				} else if (whatAutoComplete) {
					wordsToShow = WHAT_TO_DRAW_WORDS
				}
				let comp = wordsToShow.map(function (word) {
					return {
						name: word.caption,
						caption: word.caption,
						value: word.value,
						meta: word.meta,
						score: 1000
					}
				})
				poseAutoComplete = false
				posePositionAutoComplete = false
				whatAutoComplete = false
				callback(null, comp)
			}
		})
	}

	//if editor values changes than this function is called
	onChange = async (val) => {
		const status = await this.parseAndShowErrors(val)
		if (val.trim().length == 0 && !this.fromSetValueCall && this.editor.current.editor.getSession().curOp.command.name != 'paste') {
			// this.editor.current.editor.insert(this.STARTING_CODE)
			// or
			this.editor.current.editor.getSession().setValue(this.STARTING_CODE)
			return
		}
		await this.poser.update(val)
		this.props.onUpdatePoser(this.poser, status, this.poser.declarations.text.replace(/\s/g, '') != this.STARTING_CODE.replace(/\s/g, ''))
		this.fromSetValueCall = false
		this.currentCode = val
	}

	//this is undo function
	revertToPreviousCode = async () => {
		const currentCode = this.poser.revertToPreviousCode()
		this.fromSetValueCall = true
		this.editor.current.editor.getSession().setValue(currentCode.text)
	}

	//in case user wants to change the font size of editor
	updateFontSize = async (fontSize) => {
		this.editor.current.editor.setFontSize(parseInt(fontSize))
	}

	onBlur = async (val) => {
		//todo..if there is code error then show default message
	}

	//this fucntion take cares of error handling for user
	parseAndShowErrors = async (currentCode) => {
		let errAnnotations = []
		try {
			let tree = esprima.parseScript(currentCode, {tolerant: true})
			tree.errors.forEach((err) => errAnnotations.push(this.createErrorAnnotation(err)))
		} catch (e) {
			errAnnotations.push(this.createErrorAnnotation(e))
		} finally {
			this.editor.current.editor.getSession().setAnnotations(errAnnotations)
			return errAnnotations.length == 0
		}
	}

	showInvalidShapeError = async () => {
		this.editor.current.editor.getSession().setAnnotations([
			{
				type: 'error',
				row: 2,
				column: 2,
				text: 'Invalid shape'
			}
		])
	}

	createErrorAnnotation(errMess) {
		return {
			type: 'error',
			row: errMess.lineNumber - 1,
			column: errMess.column,
			text: errMess.description
		}
	}

	//this function return last token from editor code to check either its . or : or something else
	getlastToken() {
		let pos = this.editor.current.editor.selection.getCursor()
		let session = this.editor.current.editor.getSession()
		let curLine = session.getDocument().getLine(pos.row).trim()
		let noPuctuation = curLine.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
		let noExtraSpaces = noPuctuation.replace(/\s{2,}/g, ' ')
		let curTokens = noExtraSpaces.slice(0, pos.column).split(/\s+/)
		let curCmd = curTokens[0]
		if (!curCmd) {
			return false
		}
		let lastToken = curTokens[curTokens.length - 1]
		console.log(lastToken)
		return lastToken
	}

	setExampleCodeOnEditor = async (val) => {
		this.fromSetValueCall = true
		const status = await this.parseAndShowErrors(val)
		this.editor.current.editor.getSession().setValue(val)
		//todo... do we need to update poser ?.. yes definitely. but why not we added it on revert function
		await this.poser.update(val)
		this.props.onUpdatePoser(this.poser, status, this.poser.declarations.text.replace(/\s/g, '') != this.STARTING_CODE.replace(/\s/g, ''))
		this.currentCode = val
	}

	//in case user wants to upload his own declartion for editor we use this function
	//read file and set its values to editor
	uploadDeclarations = (newFile) => {
		newFile
			.text()
			.then((t) => {
				this.fromSetValueCall = true
				this.editor.current.editor.getSession().setValue(t)
			})
			.catch((e) => {
				console.log(e)
				alert('Hmmmm. something wrong with the code you uploaded...')
			})
	}

	//in case user want to downloads its declaration than we call this function
	downloadDeclarations = () => {
		try {
			const currentDec = this.editor.current.editor.getSession().getValue()
			const codeBlob = new Blob([currentDec], {type: 'text/js'})
			const url = window.URL.createObjectURL(codeBlob)
			let a = document.createElement('a')
			a.style.display = 'none'
			a.href = url
			a.download = 'my_danceON_code.js'
			document.body.appendChild(a)
			a.click()
			window.URL.revokeObjectURL(url)
		} catch (e) {
			console.log(e)
			alert('Hmmm. Something wrong downloading your code!')
		}
	}

	render() {
		return (
			<AceEditor
				ref={this.editor}
				fontSize={parseInt(this.fontSize)}
				cursorStart={1}
				showGutter={true}
				fontFamily={'Space Mono'}
				mode="javascript"
				theme="willie_custom" //same as theme name. we are using willie_custom
				value={this.STARTING_CODE}
				onChange={this.onChange}
				onBlur={(e) => {
					this.onBlur(e.target.value)
				}}
				enableLiveAutocompletion={true}
				enableBasicAutocompletion={true}
				enableSnippets={true}
				name="dance_on_editor" //you can set any name here
				editorProps={{$blockScrolling: true}}
				setOptions={{
					useWorker: false,
					enableBasicAutocompletion: true,
					enableLiveAutocompletion: true,
					enableSnippets: true
				}}
				style={{
					height: '480px',
					width: '100% !important'
				}}
				commands={[
					{
						name: 'poseAutoCompleter',
						bindKey: {win: '.', mac: '.'},
						multiSelectAction: 'forEach',
						exec: () => {
							let lastToken = this.getlastToken()
							this.editor.current.editor.insert('.')
							if (this.editor.current.editor.inMultiSelectMode) {
								return
							}
							if (!lastToken) {
								return
							}
							if (lastToken === 'pose') {
								poseAutoComplete = true
								this.editor.current.editor.completer.showPopup(this.editor.current.editor)
							} else if (POSE_PARTS.map((p) => 'pose' + p.caption).includes(lastToken)) {
								posePositionAutoComplete = true
								this.editor.current.editor.completer.showPopup(this.editor.current.editor)
							}
						}
					},
					{
						name: 'whatAutoCompleter',
						bindKey: {win: ':', mac: ':'},
						multiSelectAction: 'forEach',
						exec: () => {
							let lastToken = this.getlastToken()
							this.editor.current.editor.insert(':')
							if (this.editor.current.editor.inMultiSelectMode == true) {
								return
							}
							if (!lastToken) {
								return
							}
							if (lastToken === 'what') {
								whatAutoComplete = true
								this.editor.current.editor.completer.showPopup(this.editor.current.editor)
							}
						}
					}
				]}
			/>
		)
	}
}

export default Editor
