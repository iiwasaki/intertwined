/*
A single passage in the story map.
*/

import escape from'lodash.escape';
import Vue from 'vue';
import { mapGetters } from 'vuex';
import PassageEditor from '../../editors/passage';
import confirmation from '../../dialogs/confirm';
import domEvents from '../../vue/mixins/dom-events';
import locale from '../../locale';
import ui from '../../ui';
import passageActions from '../../data/actions/passage';
import passagemenu from './passage-menu';
import eventHub from '../../vue/eventhub';

require('./index.less');

export default Vue.extend({
	template: require('./index.html'),

	props: {
		passage: {
			type: Object,
			required: true
		},

		/* The regular expression we use to highlight ourselves or not. */

		highlightRegexp: {
			type: RegExp,
			required: false
		},

		/* How dragged passages should be offset, in screen coordinates. */

		screenDragOffsetX: {
			type: Number,
			required: true
		},

		screenDragOffsetY: {
			type: Number,
			required: true
		},

		/* The story's grid size, in pixels. */

		gridSize: {
			type: Number,
			required: true
		}
	},

	data: () => ({
		/*
		To speed initial load, we don't create a contextual menu until the user
		actually points to us. This records whether a menu component should be
		added.
		*/

		needsMenu: false,

		/*
		Where a drag on us began, in screen coordinates. Only the passage that
		is dragged by the user tracks this.
		*/

		screenDragStartX: 0,
		screenDragStartY: 0
	}),

	// New way of doing events in Vue 2
	created() {
		eventHub.$on('passage-drag-complete-child', this.passageDragCompleteChild);
		eventHub.$on('passage-edit', this.editFromDropdown);
		eventHub.$on('passage-delete', this.passageDelete);
		eventHub.$on('new-links', this.afterEdit);
	},

	beforeDestroy() {
		eventHub.$off('passage-drag-complete-child', this.passageDragCompleteChild);
		eventHub.$off('passage-edit', this.editFromDropdown);
		eventHub.$off('passage-delete', this.passageDelete);
		eventHub.$off('new-links', this.afterEdit);
	},

	computed: {
		...mapGetters({parentStory: "story"}),
		/*
		The position to use when drawing link arrows to this passage. This does
		*not* factor in the story's zoom level, as the link arrow component
		will be doing that itself.
		*/

		linkPosition() {
			let result = {
				top: this.passage.top,
				left: this.passage.left,
				width: this.passage.width,
				height: this.passage.height
			};

			if (this.passage.selected) {
				result.left += this.screenDragOffsetX / this.parentStory.zoom;
				result.top += this.screenDragOffsetY / this.parentStory.zoom;
			}

			return result;
		},

		isStart() {
			return this.parentStory.startPassage === this.passage.id;
		},

		cssPosition() {
			const { zoom } = this.parentStory;
			const { left, top, width, height } = this.passage;

			return {
				left: left * zoom + 'px',
				top: top * zoom + 'px',
				width: width * zoom + 'px',
				height: height * zoom + 'px',
				transform: this.passage.selected ?
					'translate(' + this.screenDragOffsetX + 'px, ' +
					this.screenDragOffsetY + 'px)'
					: null
			};
		},
		
		cssClasses() {
			let result = [];

			if (this.passage.selected) {
				result.push('selected');
			}

			if (this.highlightRegexp && (
				this.highlightRegexp.test(this.passage.name) ||
				this.highlightRegexp.test(this.passage.text))) {
				result.push('highlighted');
			}

			return result;
		},

		tagColors() {
			let result = [];

			this.passage.tags.forEach(t => {
				if (this.parentStory.tagColors[t]) {
					result.push(this.parentStory.tagColors[t]);
				}
			});

			return result;
		},

	},

	methods: {
		/* Allow the editing to occur only if the dropdown for the appropriate passage was clicked */
		editFromDropdown: function(clickedId){
			if (clickedId === this.passage.id){
				this.edit();
			}
		},
		passageDelete: function (skipConfirmation) {
			if (skipConfirmation) {
				this.delete();
			}
			else {
				let message = locale.say(
					'Are you sure you want to delete &ldquo;%s&rdquo;? ' +
					'This cannot be undone.',
					escape(this.passage.name)
				);

				if (!hasPrimaryTouchUI()) {
					message += '<br><br>' + locale.say(
						'(Hold the Shift key when deleting to skip this message.)'
					);
				}

				confirmation.confirm({
					message,
					buttonLabel:
						'<i class="fa fa-trash-o"></i> ' + locale.say('Delete'),
					buttonClass:
						'danger',
				})
				.then(() => this.delete());
			}
		},

		passageDragCompleteChild: function(xOffset, yOffset, emitter) {
			/*
			We have to check whether we originally emitted this event, as
			$dispatch triggers first on ourselves, then our parent.
			*/

			if (this.passage.selected && emitter !== this) {
				/*
				Because the x and y offsets are in screen coordinates, we need
				to convert back to logical space.
				*/

				const top = this.passage.top + yOffset
				/ this.parentStory.zoom;
				const left = this.passage.left + xOffset
				/ this.parentStory.zoom;

				if (this.passage.top !== top || this.passage.left !== left) {
					passageActions.updatePassage(
						this.$store,
						this.parentStory.id,
						this.passage.id,
						{ top, left }
					);
				}

				/*
				Ask our parent to position us so we overlap no unselected
				passages. We need to stipulate that passages are not selected so
				that we don't inadvertantly collide with other passages being
				dragged.
				*/

				eventHub.$emit(
					'passage-position',
					this.passage,
					{ ignoreSelected: true }
				);
			}

			/*
			Tell our menu that our position has changed, so that it in turn can
			change its position.
			*/

			eventHub.$emit('drop-down-reposition');
		},

		excerpt() {
			if (this.passage.text.length < 100) {
				return escape(this.passage.text);
			}

			return escape(this.passage.text.substr(0, 99)) + '&hellip;';
		},
		delete() {
			passageActions.deletePassage(this.parentStory.id, this.passage.id);
		},

		afterEdit(targetPassageId, oldText){
			console.log("After edit");
			if (targetPassageId === this.passage.id){
				passageActions.createNewlyLinkedPassages(
					this.$store,
					this.parentStory.id,
					this.passage.id,
					oldText,
					this.gridSize
				);
			}
		},

		edit() {
			/*
			Close any existing passage menu -- it may still be visible if the
			user double-clicked.
			*/

			eventHub.$emit('drop-down-close');

			const oldText = this.passage.text;
			/*
			The promise below is rejected if the user clicks outside the editor,
			so we need to handle both resolution and rejection of the promise.
			*/

			new PassageEditor({
				data: {
					passageId: this.passage.id,
					storyId: this.parentStory.id,
					origin: this.$el,
					oldText: oldText,
				},
				store: this.$store,
				storyFormat: {
					name: this.parentStory.storyFormat,
					version: this.parentStory.storyFormatVersion
				}
			})
			.$mountTo(document.body)
		},

		startDrag(e) {
			/* Only listen to the left mouse button. */

			if (e.type === 'mousedown' && e.which !== 1) {
				return;
			}
			
			if (e.shiftKey || e.ctrlKey) {
				/*
				Shift- or control-clicking toggles our selected status, but
				doesn't affect any other passage's selected status. If the shift
				or control key was not held down, select only ourselves.
				*/

				passageActions.selectPassages(this.$store, this.parentStory, p => {
					if (p === this.passage) {
						return !p.selected;
					}

					return p.selected;
				});
			}
			else if (!this.passage.selected) {
				/*
				If we are newly-selected and the shift or control keys are not
				held, deselect everything else. The check for newly-selected
				status is needed so that if the user is beginning a drag, we
				don't deselect everything right away. The check for that occurs
				in the mouse up handler, above.
				*/

				passageActions.selectPassages(this.$store,
					this.parentStory,
					p => p === this.passage
				);
			}

			/* Begin tracking a potential drag. */

			const srcPoint = (e.type === 'mousedown') ? e : e.touches[0];

			this.screenDragStartX = srcPoint.clientX + window.pageXOffset;
			this.screenDragStartY = srcPoint.clientY + window.pageYOffset;

			if (ui.hasPrimaryTouchUI()) {
				this.on(window, 'touchmove', this.followDrag, { passive: false });
				this.on(window, 'touchend', this.stopDrag);
			}
			else {
				this.on(window, 'mousemove', this.followDrag, { passive: false });
				this.on(window, 'mouseup', this.stopDrag);
			}

			document.querySelector('body').classList.add('draggingPassages');
		},

		followDrag(e) {
			const srcPoint = (e.type === 'mousemove') ? e : e.touches[0];

			eventHub.$emit(
				'passage-drag',
				srcPoint.clientX + window.pageXOffset - this.screenDragStartX,
				srcPoint.clientY + window.pageYOffset - this.screenDragStartY
			);

			/*
			Block scrolling if we're following touch events -- otherwise, the
			browser will treat it as though the user is dragging to scroll
			around the screen.
			*/

			if (e.type === 'touchmove') {
				e.preventDefault();
			}
		},

		stopDrag(e) {
			/* Only listen to the left mouse button. */

			if (e.type === 'mouseup' && e.which !== 1) {
				return;
			}

			/* Remove event listeners set up at the start of the drag. */

			if (ui.hasPrimaryTouchUI()) {
				this.off(window, 'touchmove');
				this.off(window, 'touchend');
			}
			else {
				this.off(window, 'mousemove');
				this.off(window, 'mouseup');
			}

			document.querySelector('body').classList.remove('draggingPassages');

			/*
			If we haven't actually been moved and the shift or control key were
			not held down, select just this passage only. This handles the
			scenario where the user clicks a single passage when several were
			selected. We don't want to immediately deselect them all, as the
			user may be starting a drag; but now that we know for sure that the
			user didn't intend this, we select just this one.
			*/
			
			if (this.dragXOffset === 0 && this.dragYOffset === 0) {
				if (!(e.ctrlKey || e.shiftKey)) {
					passageActions.selectPassages(this.parentStory.id, p => p !== this);
				}
			}
			else {
				/*
				touchend events do not include client coordinates, but mouseup
				events do.
				*/

				if (e.type === 'mouseup') {
					eventHub.$emit(
						'passage-drag-complete',
						e.clientX + window.pageXOffset - this.screenDragStartX,
						e.clientY + window.pageYOffset - this.screenDragStartY,
						this
					);
				}
				else {
					eventHub.$emit(
						'passage-drag-complete',
						this.screenDragOffsetX,
						this.screenDragOffsetY,
						this
					);
				}
			}
		}
	},

	components: {
		'passage-menu': passagemenu,
	},

	mixins: [domEvents]
});
