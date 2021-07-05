/*
A component showing a modal dialog where a story's stylesheet can be edited.
*/

import Vue from 'vue';
import storyActions from '../../data/actions/story';
import {mapGetters} from 'vuex';
import modaldialog from '../../ui/modal-dialog';
import codemirrorcomponent from '../../vue/codemirror';
import { firepadRef } from '../../data/firebase-handler';

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
		...mapGetters(["story"]),
		source() {
			return this.story.stylesheet;
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

		canClose() {
			const Firepad = require('firepad');
			const storyRef = firepadRef.child(this.storyId).child("stylesheet");
			var headless = new Firepad.Headless(storyRef);
			const newText = headless.getText(text => {
				this.$store.dispatch("updateStory", {
					id: this.storyId,
					props: {
						stylesheet: text
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
