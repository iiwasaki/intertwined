// A lightweight Vue component that wraps a CodeMirror instance.

import Vue from 'vue';
import CodeMirror from 'codemirror';
import eventHub from '../vue/eventhub';

require('./codemirror-theme.less');

export default Vue.extend({
	template: '<div></div>',

	props: ['options', 'text'],

	watch: {
		text() {
			// Only change CodeMirror if it's actually a meaningful change,
			// e.g. not the result of CodeMirror itself changing.

			if (this.text !== this.$cm.getValue()) {
				this.$cm.setValue(this.text);
			}
		}
	},

	creeated() {
		eventHub.$on('transition-entered', this.transitionEntered);
	},

	beforeDestroy(){
		eventHub.$off('transition-entered', this.transitionEntered);
	},

	mounted() {
		this.$cm = CodeMirror(this.$el, this.options);
		this.$cm.setValue((this.text || '') + '');

		/*
		Remove the empty state from existing in undo history, e.g. so if the
		user immediately hits Undo, the editor becomes empty.
		*/

		this.$cm.clearHistory();

		this.$cm.on('change', () => {
			let newText = this.$cm.getValue();
			this.$emit('cm-change', newText);
		});

		this.$nextTick (function () {
			this.$cm.focus();
		});
	},

	methods: {
		// Since CodeMirror initialises incorrectly when special CSS such as
		// scaleY is present on its containing element, it should be
		// refreshed once transition is finished - hence, this event.
		transitionEntered() {
			this.$cm.refresh();
		}
	}
});
