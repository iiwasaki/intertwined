// A lightweight Vue component that wraps a CodeMirror instance.

import Vue from 'vue';
import CodeMirror from 'codemirror';

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

	mounted() {
		this.$cm = CodeMirror(this.$el, this.options);
		this.$cm.setValue((this.text || '') + '');

		/*
		Remove the empty state from existing in undo history, e.g. so if the
		user immediately hits Undo, the editor becomes empty.
		*/

		this.$cm.clearHistory();

		this.$cm.on('change', () => {
			this.text = this.$cm.getValue();
			this.$dispatch('cm-change', this.text);
		});

		this.$nextTick (function () {
			this.$cm.focus();
		})
	},

	events: {
		// Since CodeMirror initialises incorrectly when special CSS such as
		// scaleY is present on its containing element, it should be
		// refreshed once transition is finished - hence, this event.
		'transition-entered'() {
			this.$cm.refresh();
		}
	}
});
