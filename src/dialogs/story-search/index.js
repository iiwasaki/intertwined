/*
A modal which allows the user to perform find and replace on a array of
passages.
*/

import Vue from 'vue';
import escapeRegexp from 'lodash.escaperegexp';
import modaldialog from '../../ui/modal-dialog';
import result from './result';
import locale from '../../locale';
import eventHub from '../../vue/eventhub';

require('./index.less');

export default Vue.extend({
	template: require('./index.html'),

	data: () => ({
		story: {},
		search: '',
		replace: '',
		searchNames: true,
		caseSensitive: false,
		regexp: false,
		working: false,
		origin: null
	}),

	filters: {
		say: (message) => {
			return locale.say(message);
		},
		sayPlural: (sourceSingular, sourcePlural, count) => {
			return locale.sayPlural(sourceSingular, sourcePlural, count);
		}
	},

	computed: {
		searchRegexp() {
			let flags = 'g';

			if (!this.caseSensitive) {
				flags += 'i';
			}

			let source = this.search;

			/*
			Escape regular expression characters in what the user typed unless
			they indicated that they're using a regexp.
			*/

			if (!this.regexp) {
				source = escapeRegexp(source);
			}

			return new RegExp('(' + source + ')', flags);
		},

		passageMatches() {
			if (this.search === '') {
				return [];
			}

			this.working = true;

			let result = this.story.passages.reduce((matches, passage) => {
				let numMatches = 0;
				let passageName = passage.name;
				let passageId = passage.id;
				let passageText = passage.text;
				let highlightedName = passageName;
				let highlightedText = passageText;
				let textMatches = passageText.match(this.searchRegexp);

				if (textMatches) {
					numMatches += textMatches.length;
					highlightedText = passageText.replace(
						this.searchRegexp,
						'<span class="highlight">$1</span>'
					);
				}

				if (this.searchNames) {
					let nameMatches = passageName.match(this.searchRegexp);

					if (nameMatches) {
						numMatches += nameMatches.length;
						highlightedName = passageName.replace(
							this.searchRegexp,
							'<span class="highlight">$1</span>'
						);
					}
				}

				if (numMatches > 0) {
					matches.push({
						passage,
						passageId,
						numMatches,
						highlightedName,
						highlightedText
					});
				}

				return matches;
			}, []);
			this.working = false;
			return result;
		}
	},

	methods: {
		expandAll() {
			eventHub.$emit('expand');
		},

		collapseAll() {
			eventHub.$emit('collapse');
		},

		replaceAll() {
			eventHub.$emit('replace');
		}
	},

	mounted() {
		this.$refs.search.focus();
	},

	components: {
		'modal-dialog': modaldialog,
		'search-result': result,
	}
});
