// A lightweight Vue component that wraps a CodeMirror instance.

import Vue from 'vue';
import { mapGetters } from 'vuex';
import CodeMirror from 'codemirror';
import eventHub from '../vue/eventhub';
import { firepadRef } from '../data/firebase-handler';
import locale from '../locale';

require('./codemirror-theme.less');

var storyRef;

export default Vue.extend({
	template: '<div></div>',

	props: ['options', 'text', 'storyId', 'passageId'],

	watch: {
		// text() {
		// 	// Only change CodeMirror if it's actually a meaningful change,
		// 	// e.g. not the result of CodeMirror itself changing.

		// 	if (this.text !== this.$cm.getValue()) {
		// 		this.$cm.setValue(this.text);
		// 	}
		// }
	},

	computed: {
		...mapGetters({parentStory: "story"}),
		passage() {
			return this.parentStory.passages.find(
				passage => passage.id === this.passageId
			);
		},
	},

	created() {
		eventHub.$on('transition-entered', this.transitionEntered);
	},

	beforeDestroy(){
		const Firepad = require('firepad');
		var headless = new Firepad.Headless(storyRef);
		headless.getText(function(text) {
			console.log("Contents of firepad: " + text);
		});
		eventHub.$off('transition-entered', this.transitionEntered);
	},

	mounted() {
		this.setupFirepad();
	},

	methods: {
		// Since CodeMirror initialises incorrectly when special CSS such as
		// scaleY is present on its containing element, it should be
		// refreshed once transition is finished - hence, this event.
		transitionEntered() {
			this.$cm.refresh();
		},

		setupFirepad(){
			this.$cm = CodeMirror(this.$el, this.options);
			storyRef = firepadRef.child(this.storyId).child(this.passageId);
			const Firepad = require("firepad");
			var firepad = Firepad.fromCodeMirror(storyRef, this.$cm, {
				defaultText: locale.say(
						'Enter the body text of your passage here. To link to another ' +
						'passage, put two square brackets around its name, [[like ' +
						'this]].'
						),
			});
			//this.$cm.setValue((this.text || '') + '');

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
