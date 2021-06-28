/**
 Completely replaces the document with HTML source.

 @method replaceContent
 @param {String} html HTML source to replace, including DOCTYPE, <head>, and
	<body>.
**/

'use strict';
import ui from './index.js';

export default function(html){
	// remove our UI hooks
	console.log("in replace.js");
	ui.destroy();

	// blast the last of our JS globals

	window.CodeMirror = null;
	window.SVG = null;
	window.Store = null;
	window.StoryFormat = null;
	window.amdDefine = null;
	window.app = null;
	window.jQuery = null;

	// rewrite the document

	document.open();
	/* jshint -W060 */
	document.write(html);
	/* jshint +W060 */
	document.close();
};
