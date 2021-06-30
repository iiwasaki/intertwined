/*
A component showing a modal dialog where a story's stylesheet can be edited.
*/

import Vue from 'vue';
import storyActions from '../../data/actions/story';
import {mapGetters} from 'vuex';
import modaldialog from '../../ui/modal-dialog';
import codemirrorcomponent from '../../vue/codemirror';


require('codemirror/mode/css/css');
require('codemirror/addon/display/placeholder');
require('codemirror/addon/hint/show-hint');

export default Vue.extend({
	template: require('./index.html'),

	data: () => ({
		storyId: '',
		origin: null
	}),

	computed: {
		...mapGetters(["allStories"]),
		source() {
			return this.allStories.find(
				story => story.id === this.storyId
			).stylesheet;
		},

		cmOptions: () => ({
			lineWrapping: true,
			lineNumbers: false,
			tabSize: 4,
			indentWithTabs: true,
			mode: 'css',
			extraKeys: {
				'Ctrl-Space'(cm) {
					cm.showHint();
				}
			}
		})
	},

	methods: {
		resetCm() {
			this.$refs.codemirror.reset();
		},

		save(text) {
			storyActions.updateStory(this.$store, this.storyId, { stylesheet: text });
		}
	},

	components: {
		'modal-dialog': modaldialog,
		'code-mirror': codemirrorcomponent,
	},

});
