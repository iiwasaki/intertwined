import './index.less';

/*
The main entry point for the application.
*/
import Vue from 'vue';

/*
Load Vue extensions as early as possible so that they're available to
everything.
*/

import localeFilters from './vue/filters/locale';
import mountMixin from './vue/mixins/mount-to';
import mouseScrollingDirective from './vue/directives/mouse-scrolling';

Vue.mixin(mountMixin);
localeFilters.addTo(Vue);
mouseScrollingDirective.addTo(Vue);

import locale from './locale';
import notify from './ui/notify';
import store from './data/store';
import TwineApp from './common/app';
import TwineRouter from './common/router';

import 'core-js';

/* Start the application after loading the appropriate locale data. */

let userLocale;

/*
The user can specify a locale parameter in the URL to override the app
preference, in case things go severely wrong and they need to force it.
*/

const localeUrlMatch = /locale=([^&]+)&?/.exec(window.location.search);

if (localeUrlMatch) {
	userLocale = localeUrlMatch[1];
} else {
	userLocale = store.state.pref.locale;
}

if (typeof userLocale === 'string') {
	/* Load the locale, then start the application. */

	locale.loadViaAjax(userLocale.toLowerCase()).then(() => {
		//TwineRouter.start(TwineApp, '#main');
		// No need for starting router anymore with upgraded Vue
	});
} else {
	/*
	Something has gone pretty wrong; fall back to English as a last resort.
	*/

	locale.load('en').then(() => {
		//TwineRouter.start(TwineApp, '#main');

		Vue.nextTick(() => {
			/*
			The message below is not localized because if we've reached
			this step, localization is not working.
			*/

			notify(
				'Your locale preference has been reset to English due ' +
					'to a technical problem.<br>Please change it with the ' +
					'<b>Language</b> option in the story list.',
				'danger'
			);
		});
	});
}
