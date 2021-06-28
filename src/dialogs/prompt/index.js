/* Shows a modal dialog asking for a text response from the user. */

import Vue from 'vue';
import locale from '../../locale';
import {thenable} from '../../vue/mixins/thenable';
import modaldialog from '../../ui/modal-dialog';
import eventHub from '../../vue/eventhub';

require('./index.less');

const prompter = {
	component: Vue.extend({
		template: require('./index.html'),

		data: () => ({
			message: '',
			response: '',
			cancelLabel: ('<i class="fa fa-times"></i> ' + locale.say('Cancel')),
			buttonLabel: '',
			buttonClass: 'primary',
			modalClass: '',
			isValid: true,
			validationError: '',
			responseEvent:'',
			targetStoryId: '',
			validator: function() {},

			origin: null
		}),

		mounted() {
			this.$refs.response.focus();
			this.$refs.response.select();
		},

		methods: {
			accept() {
				const validResponse = this.validator(this.response);

				if (typeof validResponse === 'string') {
					this.isValid = false;
					this.validationError = validResponse;
				}
				else {
					this.isValid = true;
					switch(this.responseEvent){
						case "newStory":
							eventHub.$emit('newStory', this.response);
							break;
						case "renameStory":
							eventHub.$emit('renameStory', this.targetStoryId, this.response);
							break;
						case "duplicateStory":
							eventHub.$emit('duplicateStory', this.targetStoryId, this.response);
							break;
						default:
							break;
					}
					eventHub.$emit('close', this.response);
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
		return new prompter.component({ data }).$mountTo(document.body).then(
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

export default prompter;