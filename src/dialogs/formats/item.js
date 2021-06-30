'use strict';
import Vue from 'vue';
import {mapGetters} from 'vuex';
import locale from '../../locale';
import confirmer from '../confirm';
import formatActions from '../../data/actions/story-format';
import prefActions from '../../data/actions/pref';
import eventHub from '../../vue/eventhub';

require('./item.less');

export default Vue.extend({
	template: require('./item.html'),

	props: {
		// A format that this component represents.
		format: Object
	},

	filters: {
		say: (message) => {
			return locale.say(message);
		}
	},

	created(){
		eventHub.$on("removeFormat", this.removeFormatPost);
	},

	beforeDestroy(){
		eventHub.$off("removeFormat", this.removeFormatPost);
	},

	computed: {
		...mapGetters(["allFormats", "defaultFormat", "proofingFormatPref"]),
		author(){
			return this.format.properties.author;
		},
		formId(){
			return this.format.name - this.format.properties.version;
		},
		isDefault() {
			if (this.format.properties.proofing) {
				return this.proofingFormatPref.name === this.format.name &&
					this.proofingFormatPref.version === this.format.version;
			}

			return this.defaultFormat.name === this.format.name &&
				this.defaultFormat.version === this.format.version;
		},

		author() {
			if (this.format.properties.author) {
				/* L10n: %s is the name of an author. */
				return locale.say('by %s', this.format.properties.author);
			}

			return '';
		},

		/*
		Calculates the image source relative to the format's path.
		*/

		imageSrc() {
			const path = this.format.url.replace(/\/[^\/]*?$/, '');
			
			return path + '/' + this.format.properties.image;
		}
	},

	methods: {
		removeFormat() {
			if (this.isDefault) {
				confirmer.confirm({
					message:
						locale.say('You may not remove the default story format. Please choose another one first.'),
					buttonLabel:
						'<i class="fa fa-lg fa-check"></i> ' + locale.say('OK')
				});

				return;
			}

			confirmer.confirm({
				message:
					locale.say('Are you sure?'),
				buttonLabel:
					'<i class="fa fa-lg fa-trash-o"></i> ' + locale.say('Remove'),
				buttonClass:
					'danger',
				responseEvent: "removeFormat",
				targetStoryId: this.format.id,
			});
		},

		removeFormatPost(targetFormatId){
			if (targetFormatId === this.format.id){
				formatActions.deleteFormat(this.$store, this.format.id);
			}
		},

		setDefaultFormat() {
			if (this.format.properties.proofing) {
				prefActions.setPref(
					this.$store,
					'proofingFormat',
					{ name: this.format.name, version: this.format.version }
				);
			}
			else {
				prefActions.setPref(
					this.$store,
					'defaultFormat',
					{ name: this.format.name, version: this.format.version }
				);
			}
		},
	},

});
