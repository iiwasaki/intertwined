/* Shows a modal dialog asking for a text response from the user. */

import Vue from 'vue';
import locale from '../../locale';
import {thenable} from '../../vue/mixins/thenable';
import modaldialog from '../../ui/modal-dialog';
import eventHub from '../../vue/eventhub';
import store from '../../data/store/index.js';

require('./index.less');

const twoprompter = {
	component: Vue.extend({
		template: require('./index.html'),

		data: () => ({
			message: '',
			messagetwo:'',
			response: '',
			responsetwo:'',
			cancelLabel: ('<i class="fa fa-times"></i> ' + locale.say('Cancel')),
			buttonLabel: '',
			buttonClass: 'primary',
			modalClass: '',
			isValid: true,
			validationError: '',
			responseEvent:'',
			targetStoryId: '',
			validator:  async function() {},

			origin: null
		}),

		mounted() {
			this.$refs.response.focus();
			this.$refs.response.select();
		},

		methods: {
			async accept() {
				const validResponse = await this.validator(this.response, this.responsetwo);

				if (typeof validResponse === 'string') {
					this.isValid = false;
					this.validationError = validResponse;
				}
				else {
					this.isValid = true;
					switch(this.responseEvent){
						case "newGroup":
							eventHub.$emit('newGroup', this.response, this.responsetwo);
							break;
						case "loadGroup":
							eventHub.$emit('loadGroup', this.response, this.responsetwo);
							break;
						default:
							break;
					}
					/*eventHub.$emit('close', this.response);*/
				}
			},

			cancel() {
				eventHub.$emit('close', false);
			}
		},

		components: {
			'modal-dialog': modaldialog,
		},

		mixins: [thenable]
	}),

	/**
	 Creates a prompt modal dialog using the given data, and returns its
	 promise, which rejects if the 'cancel' button was selected.
	*/

	prompt(data) {
		return new twoprompter.component({ data }).$mountTo(document.body).then(
			result => {
				/*
				False results are produced by the close button and the cancel
				button. If the result is false, convert it into a rejection.

				Note: this may change in the future, as using rejections for
				negative results is somewhat unidiomatic.
				*/

				if (!result) {
					throw result;
				}

				return result;
			}
		);
	}
};

export default twoprompter;