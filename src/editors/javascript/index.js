// A component showing a modal dialog where a story's JavaSCript.

import Vue from 'vue';
import {mapGetters} from 'vuex';
import storyActions from '../../data/actions/story';
import modaldialog from '../../ui/modal-dialog';
import codemirrorcomponent from '../../vue/codemirror';

require('codemirror/mode/javascript/javascript');
require('codemirror/addon/display/placeholder');
require('codemirror/addon/hint/show-hint');

export default Vue.extend({
	template: require('./index.html'),

	data: () => ({
		storyId: ''
	}),

	computed: {
		...mapGetters(["allStories"]),
		source() {
			return this.allStories.find(
				story => story.id === this.storyId
			).script;
		},

		cmOptions: () => ({
			lineWrapping: true,
			lineNumbers: false,
			tabSize: 2,
			indentWithTabs: true,
			mode: 'javascript',
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
			storyActions.updateStory(this.$store, this.storyId, { script: text });
		}
	},
	
	components: {
		'modal-dialog': modaldialog,
		'code-mirror': codemirrorcomponent,
	},

	vuex: {
		

		getters: {
			allStories: state => state.story.stories
		}
	}
});
