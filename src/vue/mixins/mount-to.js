// A mixin that offers a convenience method for mounting a component to a given
// element.

export default {
	methods: {
		$mountTo(el) {
			const mountPoint = document.createElement('div');
			el.appendChild(this.$mount(mountPoint).$el);
			//this.$mount(mountPoint).append(el);
			//return this;
			return this;
		},
	}
};

