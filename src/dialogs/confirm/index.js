/**
 Manages modals with a single text input, a la window.prompt.

 @module ui/confirm
**/

'use strict';
import locale from '../../locale';
import Vue from 'vue';
import {thenable} from '../../vue/mixins/thenable';
import modaldialog from '../../ui/modal-dialog';
import eventHub from '../../vue/eventhub';

require('./index.less');

/**
 Shows a modal confirmation dialog, with one button (to continue the action)
 and a Cancel button.

 @param {Object} options Object with optional parameters:
						 message (HTML source of the message)
						 [modalClass] (CSS class to apply to the modal),
						 [buttonClass] (CSS class to apply to the action button)
						 buttonLabel (HTML label for the button)
**/

const confirmation = {
	component: Vue.extend({
		template: require('./index.html'),

		data: () => ({
			message: '',
			coda: '',
			cancelLabel: ('<i class="fa fa-times"></i> ' + locale.say('Cancel')),
			buttonLabel: '',
			modalClass: '',
			buttonClass: 'primary',
			responseEvent: '',
			targetStoryId: '',
		}),

		methods: {
			accept() {
				switch(this.responseEvent){
					case "deleteStory":
						eventHub.$emit('deleteStory', this.targetStoryId);
					default:
						break;
				}
				eventHub.$emit('close', true);
			},

			cancel() {
				eventHub.$emit('close', false);
			},
		},

		components: {
			'modal-dialog': modaldialog,
		},

		mixins: [thenable]
	}),

	/**
	 Creates a <confirm-modal> dialog using the given data, and returns
	 its promise, which rejects if the 'cancel' button was selected.

	 @return {Promise} the modal's promise.
	*/

	confirm(data) {
		return new confirmation.component(
			{ data }
		).$mountTo(document.body).then(
			result => {
				// False results are produced by the close button and the
				// cancel button. If the result is false, convert it into a
				// rejection.
				//
				// Note: this may change in the future, as using rejections for
				// negative results is somewhat unidiomatic.

				if (!result) {
					throw result;
				}

				return result;
			}
		);
	}
};
export default confirmation;