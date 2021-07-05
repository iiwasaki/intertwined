/*
A component showing a single search result.
*/

import Vue from 'vue';
import passageActions from '../../data/actions/passage';
import locale from '../../locale';
import eventHub from '../../vue/eventhub';
import { firepadRef } from '../../data/firebase-handler';

require('./result.less');

export default Vue.extend({
	template: require('./result.html'),
	
	props: {
		story: {
			type: Object,
			required: true
		},

		match: {
			type: Object,
			required: true
		},
		
		searchRegexp: {
			type: RegExp,
			required: true
		},

		replaceWith: {
			type: String,
			required: true
		},

		searchNames: {
			type: Boolean,
			require: true
		}
	},

	data: () => ({
		expanded: false
	}),

	created(){
		eventHub.$on("expand", this.expand);
		eventHub.$on("collapse", this.collapse);
		eventHub.$on("replace", this.replace);
	},

	beforeDestroy(){
		eventHub.$on("expand", this.expand);
		eventHub.$on("collapse", this.collapse);
		eventHub.$on("replace", this.replace);
	},

	filters: {
		say: (message) => {
			return locale.say(message);
		},
		sayPlural: (sourceSingular, sourcePlural, count) => {
			return locale.sayPlural(sourceSingular, sourcePlural, count);
		}
	},

	methods: {
		toggleExpanded() {
			this.expanded = !this.expanded;
		},

		// Replace function is currently disabled.
		replace() {
			console.log("replace");
			const name = this.searchNames ?
				this.match.passage.name.replace(
					this.searchRegexp,
					this.replaceWith
				)
				: undefined;
			const text = this.match.passage.text.replace(
				this.searchRegexp,
				this.replaceWith
			);

			const Firepad = require('firepad');
			const storyRef = firepadRef.child(this.story.id).child("passagetext").child(this.match.passage.id);
			var headless = new Firepad.Headless(storyRef);
			console.log(name);
			console.log(text);
			this.$store.dispatch(
				'updatePassageInStory',
				{
					story: this.story,
					passageId: this.match.passage.id,
					props: {
						name,
						text,
					}
				}
			)
		},

		/*
		The parent sends these events when the user chooses to expand or
		collapse all results.
		*/

		expand() {
			this.expanded = true;
		},

		collapse() {
			this.expanded = false;
		},

		/* The parent sends this event when the user clicks "Replace All". */

		replaceEvent() {
			this.replace();
		}
	},

});
