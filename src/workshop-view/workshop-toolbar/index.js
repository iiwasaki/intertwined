import Vue from 'vue';

export default Vue.extend({
    template: require('./index.html'),
    methods: {
        emitScroll(element){
            this.$emit('scrollClick', element);
        }
    }
});