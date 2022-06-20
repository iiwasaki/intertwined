// A component showing a modal dialog where a story's JavaSCript.

import Vue from 'vue';
import {mapGetters} from 'vuex';
import storyActions from '../../data/actions/story';
import modaldialog from '../../ui/modal-dialog';
import codemirrorcomponent from '../../vue/codemirror';
import { firepadRef } from '../../data/firebase-handler';

require('codemirror/mode/javascript/javascript');
require('codemirror/addon/display/placeholder');
require('codemirror/addon/hint/show-hint');

export default Vue.extend({
	template: require('./index.html'),

	data: () => ({
		storyId: ''
	}),

	computed: {
		...mapGetters(["story"]),
		source() {
			return this.story.script;
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

		canClose() {
			const Firepad = require('firepad');
			const storyRef = firepadRef.child(this.storyId).child("javascript");
			var headless = new Firepad.Headless(storyRef);
			const newText = headless.getText(text => {
				this.$store.dispatch("updateStory", {
					id: this.storyId,
					groupID: this.story.groupName,
					props: {
						script: text
					}
				}).then(() => {
					headless.dispose();
				})
			})
			return true;
		}
	},

	components: {
		'modal-dialog': modaldialog,
		'code-mirror': codemirrorcomponent,
	},

});
