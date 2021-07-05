// A lightweight Vue component that wraps a CodeMirror instance.

import Vue from 'vue';
import { mapGetters } from 'vuex';
import CodeMirror from 'codemirror';
import eventHub from '../vue/eventhub';
import { firepadRef } from '../data/firebase-handler';
import locale from '../locale';

require('./codemirror-theme.less');

var storyRef;
var firepad;

export default Vue.extend({
	template: '<div></div>',

	props: ['options', 'storyId', 'passageId', 'editType'],

	computed: {
		...mapGetters({parentStory: "story"}),
	},

	created() {
		eventHub.$on('transition-entered', this.transitionEntered);
	},

	beforeDestroy(){
		eventHub.$off('transition-entered', this.transitionEntered);
		firepad.dispose();
	},

	mounted() {
		this.setupFirepad(this.editType);
	},

	methods: {
		// Since CodeMirror initialises incorrectly when special CSS such as
		// scaleY is present on its containing element, it should be
		// refreshed once transition is finished - hence, this event.
		transitionEntered() {
			this.$cm.refresh();
		},

		setupFirepad(editType){
			this.$cm = CodeMirror(this.$el, this.options);
			const Firepad = require("firepad");
			switch(editType){
				case "javascript":
					storyRef = firepadRef.child(this.storyId).child("javascript");
					firepad = Firepad.fromCodeMirror(storyRef, this.$cm);
					break;
				case "passagetext":
					storyRef = firepadRef.child(this.storyId).child("passagetext").child(this.passageId);
					firepad = Firepad.fromCodeMirror(storyRef, this.$cm, {
						defaultText: locale.say(
								'Enter the body text of your passage here. To link to another ' +
								'passage, put two square brackets around its name, [[like ' +
								'this]].'
								),
					});
					break;
				case "stylesheet":
					storyRef = firepadRef.child(this.storyId).child("stylesheet");
					firepad = Firepad.fromCodeMirror(storyRef, this.$cm);
					break;
				default:
					break;
			}

			/*
			Remove the empty state from existing in undo history, e.g. so if the
			user immediately hits Undo, the editor becomes empty.
			*/

			this.$cm.clearHistory();

			// this.$cm.on('change', () => {
			// 	let newText = this.$cm.getValue();
			// 	this.$emit('cm-change', newText);
			// });

			this.$cm.focus();
		}
	}
});
