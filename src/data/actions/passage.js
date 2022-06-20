import linkParser from '../link-parser';
import rect from '../../common/rect';

export default {
	createPassage(store, story, props) {
		store.dispatch(
			'createPassageInStory',
			{
				story: story,
				props: props
			}
		);
	},

	updatePassage(store, story, passageId, props) {
		store.dispatch(
			'updatePassageInStory',
			{
				story: story,
				passageId: passageId,
				props: props
			}
		);
	},

	deletePassage(store, story, passageId) {
		store.dispatch(
			'deletePassageInStory',
			{
				story: story,
				passageId: passageId,
			}
		);
	},

	selectPassages(store, story, filter) {
		if (!story) {
			throw new Error(`Passage action selectPassages: Target story for selection is undefined.`);
		}
		story.passages.forEach(p => {
			const current = p.selected;
			const wantSelect = filter(p);

			/* Only dispatch updates where there are changes. */

			if (wantSelect !== current) {
				store.dispatch(
					'updatePassageInStory',
					{
						story: story,
						passageId: p.id,
						props: {selected: wantSelect}
					}
				);
			}
		});
	},

	/*
	Moves a passage so it doesn't overlap any other in its story, and also
	snaps to a grid.
	*/

	positionPassage(store, story, passageId, gridSize, filter) {
		if (gridSize && typeof gridSize !== 'number') {
			throw new Error('Asked to snap to a non-numeric grid size: ' + gridSize);
		}

		if (!story) {
			throw new Error(`Position passage failed: Story is undefined.`);
		}

		const passage = story.passages.find(
			passage => passage.id == passageId
		);

		if (!passage) {
			throw new Error(
				`No passage exists in this story with id ${passageId}`
			);
		}

		const oldTop = passage.top;
		const oldLeft = passage.left;

		let passageRect = {
			top: passage.top,
			left: passage.left,
			width: passage.width,
			height: passage.height
		};

		/*
		Displacement in snapToGrid mode is set to 0 to prevent spaces
		being inserted between passages in a grid. Otherwise, overlapping
		passages are separated out with 10 pixels between them.
		*/

		const displacementDistance = (story.snapToGrid && gridSize) ?
			0
			: 10;

		/* Displace by other passages. */

		story.passages.forEach(other => {
			if (other === passage || (filter && !filter(other))) {
				return;
			}

			const otherRect = {
				top: other.top,
				left: other.left,
				width: other.width,
				height: other.height
			};

			if (rect.intersects(otherRect, passageRect)) {
				rect.displace(passageRect, otherRect, displacementDistance);
			}
		});

		/* Snap to the grid. */

		if (story.snapToGrid && gridSize && gridSize !== 0) {
			passageRect.left = Math.round(passageRect.left / gridSize) *
				gridSize;
			passageRect.top = Math.round(passageRect.top / gridSize) *
				gridSize;
		}

		/* Save the change if we actually changed anything. */

		if (passageRect.top !== oldTop || passageRect.left !== oldLeft) {
			this.updatePassage(
				store,
				story,
				passageId,
				{
					top: passageRect.top,
					left: passageRect.left
				}
			);
		}
	},

	/*
	Adds new passages to a story based on new links added in a passage's text.
	*/

	createNewlyLinkedPassages(store, story, passageId, oldText, gridSize) {
		if (!story){
			throw new Error ("Position passage failed; story not defined");
		}
		const passage = story.passages.find(
			passage => passage.id === passageId
		);

		/* Determine how many passages we'll need to create. */

		const oldLinks = linkParser(oldText, true);
		const newLinks = linkParser(passage.text, true).filter(
			link => (oldLinks.indexOf(link) === -1) &&
				!(story.passages.some(passage => passage.name === link))
		);

		/* We center the new passages underneath this one. */

		const newTop = passage.top + 100 * 1.5;

		/*
		We account for the total width of the new passages as both the width of
		the passages themselves plus the spacing in between.
		*/

		const totalWidth = newLinks.length * 100 +
			((newLinks.length - 1) * (100 / 2));
		let newLeft = passage.left + (100 - totalWidth) / 2;

		newLinks.forEach(link => {
			store.dispatch(
				'createPassageInStory',
				{
					story: story,
					props: {
						name: link,
						left: newLeft,
						top: newTop
					}
				}
			);

			const newPassage = story.passages.find(p => p.name === link);

			if (newPassage) {
				this.positionPassage(
					store,
					story,
					newPassage.id,
					gridSize
				);
			}
			else {
				console.warn('Could not locate newly-created passage in order to position it');
			}

			newLeft += 100 * 1.5;
		});
	},

	/* Updates links to a passage in a story to a new name. */

	changeLinksInStory(store, story, oldName, newName) {
		// TODO: add hook for story formats to be more sophisticated

		if (!story) {
			throw new Error(`No story exists with id ${storyId}`);
		}

		/*
		Escape regular expression characters.
		Taken from https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
		*/

		const oldNameEscaped = oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const newNameEscaped = newName.replace(/\$/g, '$$$$');

		const simpleLinkRe = new RegExp(
			'\\[\\[' + oldNameEscaped + '(\\]\\[.*?)?\\]\\]',
			'g'
		);
		const compoundLinkRe = new RegExp(
			'\\[\\[(.*?)(\\||->)' + oldNameEscaped + '(\\]\\[.*?)?\\]\\]',
			'g'
		);
		const reverseLinkRe = new RegExp(
			'\\[\\[' + oldNameEscaped + '(<-.*?)(\\]\\[.*?)?\\]\\]',
			'g'
		);

		story.passages.forEach(passage => {
			if (simpleLinkRe.test(passage.text) ||
				compoundLinkRe.test(passage.text) ||
				reverseLinkRe.test(passage.text)) {
				let newText = passage.text;

				newText = newText.replace(
					simpleLinkRe,
					'[[' + newNameEscaped + '$1]]'
				);
				newText = newText.replace(
					compoundLinkRe,
					'[[$1$2' + newNameEscaped + '$3]]'
				);
				newText = newText.replace(
					reverseLinkRe,
					'[[' + newNameEscaped + '$1$2]]'
				);

				store.commit(
					'updatePassageInStory',
					{
						story: story,
						passageId: passage.id,
						props: {
							text: newText
						}
					}
				);
			}
		});
	}
};