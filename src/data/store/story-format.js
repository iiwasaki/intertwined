// A Vuex module for working with story formats.

import uuid from 'tiny-uuid';
import locale from '../../locale';

const formatDefaults = {
	name: locale.say('Untitled Story Format'),
	version: '',
	url: '',
	userAdded: true,
	properties: {}
};

export default {
	state: {
		formats: []
	},

	getters: {
		allFormats: state => {
			return state.formats;
		}
	},

	mutations: {
		CREATE_FORMAT(state, props) {
			let newFormat = Object.assign({}, formatDefaults, props);

			newFormat.id = uuid();
			newFormat.loaded = false;
			state.formats.push(newFormat);
		},

		UPDATE_FORMAT(state, id, props) {
			let format = state.formats.find(format => format.id === id);

			Object.assign(format, props);
		},

		DELETE_FORMAT(state, id) {
			state.formats = state.formats.filter(format => format.id !== id);
		},

		LOAD_FORMAT(state, payload) {
			let id = payload.id;
			let props = payload.props;
			let format = state.formats.find(format => format.id === id);

			console.log(format);

			format.properties = props;
			format.loaded = true;

			if (format.properties.setup) {
				format.properties.setup.call(format);
			}
		}
	}
};
