/*
A modal dialog for editing a single passage.
*/

import CodeMirror from 'codemirror';
import Vue from 'vue';
import {thenable} from '../../vue/mixins/thenable';
import passageActions from '../../data/actions/passage';
import formatActions from '../../data/actions/story-format';
import storyStore from '../../data/store/story';
import locale from '../../locale';
import { mapGetters } from 'vuex';
import codemirrorcomponent from '../../vue/codemirror';
import modaldialog from '../../ui/modal-dialog';
import tageditor from './tag-editor';
import eventHub from '../../vue/eventhub';
import { firepadRef, db } from '../../data/firebase-handler';



require('codemirror/addon/display/placeholder');
require('codemirror/addon/hint/show-hint');
require('../../codemirror/prefix-trigger');

require('./index.less');

/*
Expose CodeMirror to story formats, currently for Harlowe compatibility.
*/

window.CodeMirror = CodeMirror;

export default Vue.extend({
	template: require('./index.html'),

	data: () => ({
		passageId: '',
		storyId: '',
		oldWindowTitle: '',
		userPassageName: '',
		saveError: '',
		origin: null,
		//oldText: '',
	}),

	filters: {
		say: (message) => {
			return locale.say(message);
		}
	},

	computed: {
		...mapGetters({
			allStories: "allStories",
			parentStory: "story",
		}),
		cmOptions() {
			return {
				// placeholder: locale.say(
				// 	'Enter the body text of your passage here. To link to another ' +
				// 	'passage, put two square brackets around its name, [[like ' +
				// 	'this]].'
				// ),
				prefixTrigger: {
					prefixes: ['[[', '->'],
					callback: this.autocomplete.bind(this)
				},
				extraKeys: {
					'Ctrl-Space': this.autocomplete.bind(this)
				},
				indentWithTabs: true,
				lineWrapping: true,
				lineNumbers: false,
				mode: 'text'
			};
		},

		passage() {
			return this.parentStory.passages.find(
				passage => passage.id === this.passageId
			);
		},

		userPassageNameValid() {
			return !(this.parentStory.passages.some(
				passage => passage.name === this.userPassageName &&
					passage.id !== this.passage.id
			));
		},

		autocompletions() {
			return this.parentStory.passages.map(passage => passage.name);
		}
	},

	methods: {
		autocomplete() {
			this.$refs.codemirror.$cm.showHint({
				hint: cm => {
					const wordRange = cm.findWordAt(cm.getCursor());
					const word = cm.getRange(
						wordRange.anchor,
						wordRange.head
					).toLowerCase();

					const comps = {
						list: this.autocompletions.filter(
							name => name.toLowerCase().indexOf(word) !== -1
						),
						from: wordRange.anchor,
						to: wordRange.head
					};

					CodeMirror.on(comps, 'pick', () => {
						const doc = cm.getDoc();

						doc.replaceRange(']] ', doc.getCursor());
					});

					return comps;
				},

				completeSingle: false,

				extraKeys: {
					']'(cm, hint) {
						const doc = cm.getDoc();

						doc.replaceRange(']', doc.getCursor());
						hint.close();
					},

					'-'(cm, hint) {
						const doc = cm.getDoc();

						doc.replaceRange('-', doc.getCursor());
						hint.close();
					},

					'|'(cm, hint) {
						const doc = cm.getDoc();

						doc.replaceRange('|', doc.getCursor());
						hint.close();
					}
				}
			});
		},

		saveText(text) {
			passageActions.updatePassage(
				this.$store,
				this.parentStory.id,
				this.passage.id,
				{ text: text }
			);
		},

		saveTags(tags) {
			passageActions.updatePassage(
				this.$store,
				this.parentStory.id,
				this.passage.id,
				{ tags: tags }
			);
		},

		dialogDestroyed() {
			this.$destroy();
		},

		canClose() {
			if (this.userPassageNameValid) {
				if (this.userPassageName !== this.passage.name) {
					passageActions.changeLinksInStory(
						this.$store,
						this.parentStory,
						this.passage.name,
						this.userPassageName
					);

					passageActions.updatePassage(
						this.$store,
						this.parentStory,
						this.passage.id,
						{ name: this.userPassageName }
					);
				}

				const Firepad = require('firepad');
				const storyRef = firepadRef.child(this.storyId).child("passagetext").child(this.passageId);
				var headless = new Firepad.Headless(storyRef);
				let oldText;
				const newText = headless.getText(text => {
					db.collection('stories').doc(this.storyId).get().then(snapshot => {
						const passage = snapshot.data().passages.find(
							passage => passage.id === this.passageId
						);
						oldText = passage.text;
					}).then(() =>{
						this.$store.dispatch("updatePassageInStory", {
							story: this.parentStory,
							passageId: this.passageId,
							props: {
								text: text
							}
						})
					})
					.then(() => {
						// We handle updating new links here
						eventHub.$emit("new-links", this.passage.id, oldText);
						headless.dispose();
					})
				})
				return true;
			}

			return false;
		},

		setupCodeMirror() {
			this.userPassageName = this.passage.name;

			/* Update the window title. */

			this.oldWindowTitle = document.title;
			document.title = locale.say('Editing \u201c%s\u201d', this.passage.name);

			/*
			Load the story's format and see if it offers a CodeMirror mode.
			*/

			if (this.$options.storyFormat) {
				formatActions.loadFormat(
					this.$store,
					this.$options.storyFormat.name,
					this.$options.storyFormat.version
				).then(format => {
					let modeName = format.name.toLowerCase();
					/* TODO: Resolve this special case with PR #118 */

					if (modeName === 'harlowe') {
						modeName += `-${/^\d+/.exec(format.version)}`;
					}

					if (modeName in CodeMirror.modes) {
						/*
						This is a small hack to allow modes such as Harlowe to
						access the full text of the textarea, permitting its lexer
						to grow a syntax tree by itself.
						*/

						CodeMirror.modes[modeName].cm = this.$refs.codemirror.$cm;

						/*
						Now that's done, we can assign the mode and trigger a
						re-render.
						*/

						this.$refs.codemirror.$cm.setOption('mode', modeName);
					}
				});
			}

			/*
			Set the mode to the default, 'text'. The above promise will reset it if
			it fulfils.
			*/

			this.$refs.codemirror.$cm.setOption('mode', 'text');

			/*
			Either move the cursor to the end or select the existing text, depending
			on whether this passage has only default text in it.
			*/

			if (this.passage.text === storyStore.passageDefaults.text) {
				this.$refs.codemirror.$cm.execCommand('selectAll');
			}
			else {
				this.$refs.codemirror.$cm.execCommand('goDocEnd');
			}
		}
	},

	mounted() {
		this.setupCodeMirror();
	},

	destroyed() {
		document.title = this.oldWindowTitle;
	},

	components: {
		'code-mirror': codemirrorcomponent,
		'modal-dialog': modaldialog,
		'tag-editor': tageditor,
	},
	mixins: [thenable]
});
