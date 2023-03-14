import uuid from 'tiny-uuid';
import { PrefsState } from '../../prefs';
import { Passage } from '../stories.types';
import { passageDefaults } from '../defaults';
import { db } from '../../../firebase-config';

/**
 * Creates a new story with the default story format.
 */
export async function createPassageFirebase(
    prefs: PrefsState,
    storyId: string,
): Promise<void> {

    const newPassage: Passage = {
        ...passageDefaults(),
        id: uuid(),
        story: storyId
    };

    const passageDoc = db.collection("passages").doc(prefs.groupName).collection("pass").doc(prefs.groupCode).collection(storyId).doc(newPassage.name);

    return passageDoc.set({
        id: newPassage.id,
        left: newPassage.left,
        name: newPassage.name,
        story: newPassage.story,
        tags: newPassage.tags,
        text: newPassage.text,
        top: newPassage.top,
    })
}
