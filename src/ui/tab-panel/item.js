import Vue from 'vue';

export default Vue.extend({
	template:
		`<div :class="{hide:hidden}">
		<slot></slot>
		</div>`,

	props: {
		name: String,
		id: String,
	},

	data: () => ({}),

	computed: {
		index() {
			return this.$parent.$children.indexOf(this);
		},

		hidden() {
			return (this.$parent.active !== this.id);
		},
	},
});
