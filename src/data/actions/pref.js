/*
Preference-related actions.
*/

export default {
	setPref(store, name, value) {
		store.commit('UPDATE_PREF',
		{
			name: name,
			value: value,
		});
	}
};