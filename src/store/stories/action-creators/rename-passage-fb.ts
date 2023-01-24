import { Passage, Story } from "../stories.types";
import { db } from "../../../firebase-config";

export function renamePassageFB(story: Story, passage: Passage | undefined, groupName: string, groupCode: string, newName: string){
    const oldName = passage?.name;
    const passageCollectionRef = db.collection("passages").doc(groupName).collection("pass").doc(groupCode).collection(story.id)
    const oldPassageRef = passageCollectionRef.doc(oldName)
    let savePassage: {} | undefined;
    oldPassageRef.get().then((doc) => {
        if (!doc.exists){
            throw new Error("Passage no longer exists!")
        }
        savePassage = doc.data()
        console.log("Deleting old data for renaming")
        return oldPassageRef.delete()
    }).then(() => {
        console.log("Inputting new data for renaming")
        passageCollectionRef.doc(newName).set({
            ...savePassage,
            name: newName
        })
    })
}