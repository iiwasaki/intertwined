/* Handles adding a new group for a user for Intertwined */

import * as React from 'react';
import { IconFolderPlus } from '@tabler/icons';
import { setPref, usePrefsContext } from '../../../../store/prefs';
import { useStoriesContext } from '../../../../store/stories';
import { usePersistence } from '../../../../store/persistence/use-persistence';
import { DualPromptButton } from '../../../../components/control/dual-prompt-button';
import { db } from '../../../../firebase-config';

export const AddGroupButton: React.FC = () => {
    const { dispatch, prefs } = usePrefsContext();
    const { dispatch: storiesDispatch} = useStoriesContext();
    const [newGroup, setNewGroup] = React.useState(
        prefs.groupName
    )
    const [newCode, setNewCode] = React.useState(
        prefs.groupCode
    )
    const {stories} = usePersistence();

    function alnumCheck(value: string) {
        let regEx = /^[0-9a-zA-Z]+$/;
        if (value.match(regEx)) {
            return true;
        }
        else {
            return false;
        }
    }

    function validateGroupName(value: string) {
        if (value.trim() === '') {
            return {
                valid: false,
                message: "Group Name cannot be empty!"
            };
        }

        return db.collection("grouplist").doc(value).get().then((doc) => {
            if (doc.exists) {
                return {
                    valid: false,
                    message: "A Group with that name already exists."
                };
            }
            else {
                return {
                    valid: true,
                };
            }
        }).catch((error) => {
            console.error("Error getting document, ", error)
            return {
                valid: false,
                message: "Error connecting to Firebase database; please try again."
            }
        })
    }

    function validateGroupCode(value: string) {
        if (value.trim() === '') {
            return {
                valid: false,
                message: "Group Passcode cannot be empty!"
            }
        }
        if (alnumCheck(value)) {
            return {
                valid: true
            }
        }
        else {
            return {
                valid: false,
                message: "Passcode must be alphanumeric only."
            }
        }
    }

    function handleSubmit() {
        db.collection("groups").doc(newGroup).collection("about").doc(newCode).set({
            name: newGroup,
        }).then(() => {
            db.collection("grouplist").doc(newGroup).set({
                active: true,
            }).then(async () => {
                const newStories = await stories.load(newGroup, newCode)
                if (newStories) {
                    storiesDispatch({type: 'init', state: newStories})
                    dispatch(setPref('groupName', newGroup))
                    dispatch(setPref('groupCode', newCode))
                }
            }).catch((error) => {
                console.error("Error setting new group in all groups list: ", error)
            })
        }).catch ((error) => {
            console.error("Error creating new group in collection: ", error)
        })

    }



    return (
        <DualPromptButton
            icon={<IconFolderPlus />}
            label={"Add Group"}
            submitLabel={"Add New Group"}
            firstOnChange={e => setNewGroup(e.target.value)}
            secondOnChange={e => setNewCode(e.target.value)}
            onSubmit={handleSubmit}
            firstPrompt="New Group Name"
            secondPrompt='New Group Code'
            firstValue={newGroup}
            secondValue={newCode}
            firstValidate={validateGroupName}
            secondValidate={validateGroupCode}
        />
    );
};
