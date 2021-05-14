/**
 Manages showing the user a quick set of intro information, and then
 records that it's been shown.

 @class WelcomeView
 @extends Backbone.Marionette.ItemView
**/

'use strict';
import Vue from 'vue';
import scroll from 'scroll';
const isElectron = require('../electron/is-electron');
import setPref from '../data/actions/pref';
import locale from '../locale';
import { unescapeHTML } from 'core-js/core/string';

require('./index.less');

export default Vue.extend({
	template: require('./index.html'),

	data: () => ({
		/* How many sections are currently visible. */
		shown: 1,
		isElectron: isElectron()
	}),

	methods: {
		next() {
			this.shown++;

			Vue.nextTick(() => {
				scroll.top(
					document.documentElement || document.body,
					document.querySelector('#welcomeView > div:last-of-type')
						.offsetTop,
					{duration: 400}
				);
			});
		},

		finish() {
			this.$store.commit("UPDATE_PREF", {name: 'welcomeSeen', value: true});
			this.$router.push('/stories');
		},

		parseIntoHtml(text) {
			return `${text}`;
		},
		nTwine(){
			const parser = new DOMParser();
			let text = locale.say("&lt;strong&gt;If you've never used Twine before,&lt;/strong&gt; then welcome! The &lt;a href=\"http://twinery.org/2guide\" target=\"_blank\"&gt;Twine 2 Guide&lt;/a&gt; and the official wiki in general, are a great place to learn. Keep in mind that some articles on the wiki were written for Twine 1, which is a little bit different than this version. But most of the concepts are the same.");
			const ret = parser.parseFromString(text, "text/html");
			console.log();
			return ret.body.firstChild.textContent;
		}
	},

	computed: {
		hiSay(){
			return locale.say('Hi!');
		},
		twineDescriptionSay(){
			return locale.say('Twine is an open-source tool for telling interactive, nonlinear stories. There are a few things you should know before you get started.')
		},
		tellMeMoreSay(){
			return locale.say('Tell Me More');
		},
		skipSay(){
			return locale.say('Skip');
		},
		newSay(){
			return locale.say('New here?');
		},
		neverUsedTwineBeforeSay(){
			let text = locale.say("&lt;strong&gt;If you've never used Twine before,&lt;/strong&gt; then welcome! The &lt;a href=\\\"http://twinery.org/2guide\\\" target=\\\"_blank\\\"&gt;Twine 2 Guide&lt;/a&gt; and the official wiki in general, are a great place to learn. Keep in mind that some articles on the wiki at large were written for Twine 1, which is a little bit different than this version. But most of the concepts are the same.");
			return this.parseIntoHtml(text);
		}
	},

	vuex: {
		actions: {
			setPref
		}
	}

});
