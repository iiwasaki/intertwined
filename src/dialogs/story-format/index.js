import Vue from 'vue';
import {mapGetters} from 'vuex';
import formatActions from '../../data/actions/story-format';
import locale from '../../locale';
import notify from '../../ui/notify';
import semverUtils from 'semver-utils';
import modaldialog from '../../ui/modal-dialog';
import formatitem from './item';

require('./index.less');

export default Vue.extend({
	template: require('./index.html'),

	data: () => ({
		loadIndex: 0,
		loadedFormats: [],
		storyId: '',
	}),

	filters: {
		say: (message) => {
			return locale.say(message);
		}
	},

	computed: {
		...mapGetters(["allFormats", "allStories", "story"]),
		allFormatsProc(){
			let result = this.allFormats.map(
				format => ({ name: format.name, version: format.version })
			);
			6
			result.sort((a, b) => {
				if (a.name < b.name) {
					return -1;
				}
				
				if (a.name > b.name) {
					return 1;
				}

				const aVersion = semverUtils.parse(a.version);
				const bVersion = semverUtils.parse(b.version);

				if (aVersion.major > bVersion.major) {
					return -1;
				}
				else if (aVersion.major < bVersion.major) {
					return 1;
				}
				else {
					if (aVersion.minor > bVersion.minor) {
						return -1;
					}
					else if (aVersion.minor < bVersion.minor) {
						return 1;
					}
					else {
						if (aVersion.patch > bVersion.patch) {
							return -1;
						}
						else if (aVersion.patch < bVersion.patch) {
							return 1;
						}
						else {
							return 0;
						}
					}
				}
			});

			return result;
		},

		selectedFormat() {
			return this.loadedFormats.find(
				format => format.name === this.story.storyFormat &&
					format.version === this.story.storyFormatVersion
			);
		},

		working() {
			return this.loadIndex < this.allFormatsProc.length;
		}
	},

	methods: {
		loadNext() {
			if (!this.working) {
				return;
			}

			const nextFormat = this.allFormatsProc[this.loadIndex];

			formatActions.loadFormat(this.$store, nextFormat.name, nextFormat.version)
			.then(format => {
				if (!format.properties.proofing) {
					this.loadedFormats.push(format);
				}

				this.loadIndex++;
				this.loadNext();
			})
			.catch(e => {
				notify(
					locale.say(
						'The story format &ldquo;%1$s&rdquo; could not ' +
						'be loaded (%2$s).',
						nextFormat.name + ' ' + nextFormat.version,
						e.message
					),
					'danger'
				);
				this.loadIndex++;
				this.loadNext();
			});
		}
	},

	mounted() {
		this.loadNext();
	},

	components: {
		'format-item': formatitem,
		'modal-dialog': modaldialog,
	}
});
