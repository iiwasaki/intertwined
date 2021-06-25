/*
Preference-related actions.
*/

export default {
	setPref(store, name, value) {
		console.log("In setPref in actions/pref.js");
		store.commit('UPDATE_PREF',
		{
			name: name,
			value: value,
		});
	}
};