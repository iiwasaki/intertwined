
import { Story } from '../stories.types';
import { db } from '../../../firebase-config';

/**
 * Creates a new story with the default story format.
 */
export async function renameStoryFirebase(
    story: Story | undefined,
    newName: string,
    groupName: string,
    groupCode: string,
): Promise<boolean> {
    if (newName.trim() === '') {
        return Promise.reject(false)
    }
    let storyCollectionRef = db.collection("groups").doc(groupName).collection("about").doc(groupCode).collection("stories")
    let storyDocRef = storyCollectionRef.doc(story?.name);
    return db.runTransaction((transaction) => {
        return transaction.get(storyDocRef).then((storyDoc) => {
            if (!storyDoc.exists) {
                throw new Error("Original story no longer exists! Try reloading the page.")
            }
            transaction.set(storyCollectionRef.doc(newName), {
                ...storyDoc.data(),
                name: newName,
            })
            transaction.delete(storyDocRef)
            return true;
        })
    }).then((result) => {
        return result;
    }).catch((error) => {
        alert(`Error! ${error}`)
        return false;
    });
}
