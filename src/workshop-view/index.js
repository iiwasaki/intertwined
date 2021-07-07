/*
 * View for showing some details relevant to the CLS 2021 Workshop
 */

'use strict'
import Vue from 'vue';
import workshoptoolbar from './workshop-toolbar';

require('./index.less');

export default Vue.extend({
    template: require('./index.html'),

    components: {
        'workshop-toolbar': workshoptoolbar,
    },

    methods: {
        scrollClick(element){
            const el = this.$refs[element];
            if (el) {
                el.scrollIntoView({behavior: 'smooth'});
            }
        },

        getImgUrl(pic){
            return require('./tutorial_images/01_started.png');
        },
    }
});