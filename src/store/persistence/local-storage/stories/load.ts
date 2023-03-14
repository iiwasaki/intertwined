import { passageDefaults, storyDefaults } from '../../../stories/defaults';
import { Passage, Story } from '../../../stories/stories.types';
import { db } from '../../../../firebase-config';

/* Firebase load */
export async function load(groupName?: string, groupCode?: string): Promise<Story[]> {
	const stories: Record<string, Story> = {};
	if (!groupName || !groupCode) {
		return []
	}
	const results = await db.collection("groups").doc(groupName).collection("about").doc(groupCode).collection("stories").get().catch((error) => {
		console.error("Insufficient permissions on Firebase, security rules are probably misconfigured: ", error)
		return null
	})
	if (results) {
		if (results.empty) {
			return [];
		}
		results.forEach((doc) => {
			const story: Story = JSON.parse(JSON.stringify(doc.data()))
			if (!story.id) {
				console.warn('Story in firestore storage had no ID, skipping', story);
				return;
			}
			stories[story.id] = {
				...storyDefaults(),
				...story,

				// Coerce lastUpdate to a date.
				lastUpdate: story.lastUpdate
					? new Date(Date.parse(story.lastUpdate as unknown as string))
					: new Date(),

				// Force the passages property to be an empty array -- we'll populate it
				// when we load passages below.
				passages: []
			}
		})
	}
	else {
		return [];
	}
	for (const key of Object.keys(stories)) {
		const passages = await db.collection("passages").doc(groupName).collection("pass").doc(groupCode).collection(key).get()
		if (passages) {
			passages.forEach((query) => {
				const passage: Passage = JSON.parse(JSON.stringify(query.data()))
				stories[passage.story].passages.push({
					...passageDefaults(),
					...passage,

					// Remove empty tags.
					tags: passage.tags ? passage.tags.filter(t => t.trim() !== '') : []
				});
			})
		}

	}
	return Object.values(stories);
}

/**
 * Parses initial state from local storage. This is from the old Twine without Firebase.
//  */
// export async function load(): Promise<Story[]> {
// 	const stories: Record<string, Story> = {};
// 	const serializedStories = window.localStorage.getItem('twine-stories');

// 	if (!serializedStories) {
// 		return [];
// 	}

// 	// First, deserialize stories. We index them by ID so that we can quickly add
// 	// passages to them as they are deserialized.

// 	serializedStories.split(',').forEach(id => {
// 		const serializedStory = window.localStorage.getItem(`twine-stories-${id}`);

// 		if (!serializedStory) {
// 			console.warn(
// 				`Story list contained ID ${id}, but twine-stories-${id} does not exist, skipping`
// 			);
// 			return;
// 		}

// 		try {
// 			const story: Story = JSON.parse(serializedStory);

// 			if (!story.id) {
// 				console.warn('Story in local storage had no ID, skipping', story);
// 				return;
// 			}

// 			stories[story.id] = {
// 				...storyDefaults(),
// 				...story,

// 				// Coerce lastUpdate to a date.
// 				lastUpdate: story.lastUpdate
// 					? new Date(Date.parse(story.lastUpdate as unknown as string))
// 					: new Date(),

// 				// Force the passages property to be an empty array -- we'll populate it
// 				// when we load passages below.
// 				passages: []
// 			};
// 		} catch (e) {
// 			console.warn(
// 				`Could not parse story as JSON, skipping: ${serializedStory}`
// 			);
// 		}
// 	});

// 	// Then create passages, adding them to their parent story.


// 	const serializedPassages = window.localStorage.getItem('twine-passages');
// 	if (serializedPassages) {
// 		serializedPassages.split(',').forEach(id => {
// 			const serializedPassage = window.localStorage.getItem(
// 				`twine-passages-${id}`
// 			);

// 			if (!serializedPassage) {
// 				console.warn(
// 					`Passage list contained ID ${id}, but twine-passages-${id} does not exist, skipping`
// 				);
// 				return;
// 			}

// 			try {
// 				const passage: Passage = JSON.parse(serializedPassage);

// 				if (!passage || !passage.story) {
// 					console.warn(
// 						`Passage ${id} did not have parent story ID, skipping`,
// 						passage
// 					);
// 					return;
// 				}

// 				if (!stories[passage.story]) {
// 					console.warn(
// 						`Passage ${id} is orphaned (looking for story ID ${passage.story}), skipping`
// 					);
// 					return;
// 				}

// 				stories[passage.story].passages.push({
// 					...passageDefaults,
// 					...passage,

// 					// Remove empty tags.
// 					tags: passage.tags ? passage.tags.filter(t => t.trim() !== '') : []
// 				});
// 			} catch (e) {
// 				console.warn(
// 					`Could not parse passage as JSON, skipping: ${serializedPassage}`
// 				);
// 			}
// 		});
// 	}

// 	// Flatten the stories object.
// 	return Object.values(stories);
// }
