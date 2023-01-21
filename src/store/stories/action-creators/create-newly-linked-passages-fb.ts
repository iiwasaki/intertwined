import uuid from 'tiny-uuid';
import {
    CreatePassagesAction,
    Passage,
    StoriesState,
    Story
} from '../stories.types';
import { passageDefaults } from '../defaults';
import { rectsIntersect } from '../../../util/geometry';
import { parseLinks } from '../../../util/parse-links';
import { db } from '../../../firebase-config';


/**
 * Creates newly linked passages from a passage. You shouldn't need to call this
 * directly--it will be invoked automatically by updatePassage() if you change
 * the passage text.
 */
export async function createNewlyLinkedPassagesFirebase(
    story: Story,
    passage: Passage,
    newText: string,
    oldText: string,
    groupName: string,
    groupCode: string
) {
    if (!story.passages.some(p => p.id === passage.id)) {
        throw new Error('This passage does not belong to this story.');
    }

    const oldLinks = parseLinks(oldText);
    const toCreate = parseLinks(newText).filter(
        l => !oldLinks.includes(l) && !story.passages.some(p => p.name === l)
    );

    if (toCreate.length === 0) {
        return;
    }

    const passageDefs = passageDefaults();
    const passageGap = 25;

    let top = passage.top + passage.height + passageGap;
    const newPassagesWidth =
        toCreate.length * passageDefs.width + (toCreate.length - 1) * passageGap;

    // Horizontally center the passages.

    let left = passage.left + (passage.width - newPassagesWidth) / 2;

    // Move them to avoid overlaps.

    const needsMoving = () =>
        story.passages.some(passage =>
            rectsIntersect(passage, {
                left,
                top,
                height: passageDefs.height,
                width: newPassagesWidth
            })
        );

    while (needsMoving()) {
        // Try rightward.

        left += passageDefs.width + passageGap;

        if (!needsMoving()) {
            break;
        }

        // Try leftward.

        left -= 2 * (passageDefs.width + passageGap);

        if (!needsMoving()) {
            break;
        }

        // Move downward and try again.

        left += passageDefs.width + passageGap;
        top += passageDefs.height + passageGap;
    }

    const passagesCollection = db.collection("passages").doc(groupName).collection("pass").doc(groupCode).collection(story.id);

    for (let name of toCreate) {
        db.runTransaction((transaction) => {
            return transaction.get(passagesCollection.doc(name)).then((doc) => {
                if (!doc.exists) {
                    console.log("Creating new passage")
                    let newId = uuid();
                    transaction.set(passagesCollection.doc(name), {
                        id: newId,
                        left: left += passageDefs.width + passageGap,
                        name: name,
                        story: story.id,
                        tags: [],
                        text: "",
                        top: top
                    });
                    return newId;
                }
                else {
                    console.log("Passage already exists with id ", doc?.data()?.id)
                    return doc?.data()?.id;
                }
            })
        }).then((newPassageId) => {
        console.log(`Created new passage with name: ${name} and id ${newPassageId}`)
    })
    // const doc = await storyCollection.doc(name).get()
    // if (!doc.exists) {
    //     console.log("Doc does not exist")
    //     storyCollection.doc(name).set({
    //         id: name,
    //         left: left += passageDefs.width + passageGap,
    //         name: name,
    //         story: story.id,
    //         tags: [],
    //         text: "",
    //         top: top
    //     })
    // }
    // else {
    //     console.log("Doc exists")

    // }
}

    // return dispatch => {

    //     // Actually create them.

    //     dispatch({
    //         type: 'createPassages',
    //         storyId: story.id,
    //         props: toCreate.map(name => {
    //             const result = { left, name, top };

    //             left += passageDefs.width + passageGap;
    //             return result;
    //         }),
    //         groupName: groupName,
    //         groupCode: groupCode
    //     });
    // };
}
