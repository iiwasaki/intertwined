/*
Preference-related actions.
*/

export default {
	setPref({ dispatch }, name, value) {
		console.log("In setPref in actions/pref.js");
		dispatch('UPDATE_PREF', name, value);
	}
};