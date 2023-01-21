import {
	Passage,
	Story,
} from '../stories.types';

import { db } from '../../../firebase-config';

/**
 * Deletes a passage.
 */
export function deletePassageFB(
	story: Story,
	passage: Passage,
	groupName: string,
	groupCode: string,
)  {
	const passageRef = db.collection("passages").doc(groupName).collection("pass").doc(groupCode).collection(story.id).doc(passage.name)
    passageRef.delete()
}

/**
 * Deletes multiple passages.
 */
export function deletePassagesFB(
	story: Story,
	passages: Passage[],
	groupName: string,
	groupCode: string,
) {
    console.log("In deletepassages-fb, deleting...")
	for (let passage of passages){
        deletePassageFB(story, passage, groupName, groupCode)
    }
}
