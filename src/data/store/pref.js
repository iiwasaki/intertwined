// A Vuex module for working with application preferences. This is a bit
// over-engieneered, as it is designed to be compatible with Twine 2.0 data
// structures, where each preference had to have its own ID.

export default {
	state: {
		appTheme: 'light',
		defaultFormat: 'Harlowe',
		donateShown: false,
		firstRunTime: new Date().getTime(),
		lastUpdateSeen: '',
		lastUpdateCheckTime: new Date().getTime(),
		locale:
			window.navigator.userLanguage ||
			window.navigator.language ||
			window.navigator.browserLanguage ||
			window.navigator.systemLanguage ||
			'en-us',
		proofingFormat: 'Paperthin',
		welcomeSeen: false,
	},

	getters: {
		themePref: state => {
			return state.appTheme;
		},
		defaultFormatName: state => {
			return state.defaultFormat;
		},
		defaultFormat: state => {
			return state.defaultFormat;
		},
		proofingFormatPref: state =>{
			return state.proofingFormat;
		},
		localePref: state => {
			return state.locale;
		}
	},

	mutations:{
		UPDATE_PREF(state, payload) {
			state[payload.name] = payload.value;
		}
	},

};
