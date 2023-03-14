import uuid from 'tiny-uuid';
import {
    Passage,
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
        alert('Error in passage update. This passage may have been recently deleted. Please refresh the page and try again.');
        return;
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

    let leftPositions: Number[] = []
    for (let i = 0; i < toCreate.length; i++) {
        left += passageDefs.width + passageGap
        leftPositions[i] = left
    }
    for (let i = 0; i < toCreate.length; i++) {
        let name = toCreate[i]
        db.runTransaction((transaction) => {
            return transaction.get(passagesCollection.doc(name)).then((doc) => {
                if (!doc.exists) {
                    let newId = uuid();
                    transaction.set(passagesCollection.doc(name), {
                        id: newId,
                        left: leftPositions[i],
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
    }
}
