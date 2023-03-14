import uuid from 'tiny-uuid';
import { PrefsState } from '../../prefs';
import { Story } from '../stories.types';
import { storyDefaults } from '../defaults';
import { db } from '../../../firebase-config';

/**
 * Creates a new story with the default story format.
 */
export async function createStoryFirebase(
    stories: Story[],
    prefs: PrefsState,
    props: Partial<Omit<Story, 'id'>> & Pick<Story, 'name'>
): Promise<string> {

    if (props.name.trim() === '') {
        throw new Error('Story name cannot be empty');
    }

    if (
        stories.some(story => story.name.toLowerCase() === props.name.toLowerCase())
    ) {
        throw new Error(`There is already a story named "${props.name}"`);
    }

    let story: Story = {
        id: uuid(),
        ...storyDefaults(),
        ifid: uuid().toUpperCase(),
        lastUpdate: new Date(),
        passages: [],
        tags: [],
        tagColors: {},
        ...props
    };

    let updateDate = `${story.lastUpdate.getMonth() + 1} ${story.lastUpdate.getDate()}, ${story.lastUpdate.getFullYear()}`

    const storyDoc = db.collection("groups").doc(prefs.groupName).collection("about").doc(prefs.groupCode).collection("stories").doc(props.name);


    return storyDoc.get().then(async (doc) => {
        if (doc.exists) {
            throw new Error("Story with this name already exists; please refresh the page and try again.")
        }
        else {
            try {
                await storyDoc.set({
                    ifid: story.ifid,
                    id: story.id,
                    lastUpdate: updateDate,
                    name: story.name,
                    script: story.script,
                    selected: false,
                    snapToGrid: false,
                    startPassage: "",
                    storyFormat: story.storyFormat,
                    storyFormatVersion: story.storyFormatVersion,
                    stylesheet: story.stylesheet,
                    tags: story.tags,
                    tagColors: story.tagColors,
                })
                return story.id;
            }
            catch (error) {
                alert(error)
                return ""
            }
            
        }
    }).catch((error) => {
        throw new Error(error)
    })
}
