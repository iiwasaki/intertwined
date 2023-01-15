/* Handles which groups the user has access to for Intertwined */

import * as React from 'react';
import {IconFolder} from '@tabler/icons';
import { setPref, usePrefsContext } from '../../../../store/prefs';
import { DualPromptButton } from '../../../../components/control/dual-prompt-button';
import { db } from '../../../../firebase-config';

export const GroupButton: React.FC = () => {
    const {dispatch, prefs} = usePrefsContext();
    const [newGroup, setNewGroup] = React.useState(
        prefs.groupName
    )
    const [newCode, setNewCode] = React.useState (
        prefs.groupCode
    )

    function validateGroupName(value: string) {
		if (value.trim() === '') {
			return {
				valid: false,
				message: "Group Name cannot be empty!"
			};
		}

		return db.collection("groups").doc(value).get().then((doc) => {
            if (doc.exists){
                console.log("Doc does exist, ", value)
                return {
                    valid: false,
                    message: "A group with that name already exists!"
                }
            }
            else {
                console.log("Doc doesn't exist, ", value)
                return {valid: true};
            }
        }).catch ((error) => {
            console.log("Error getting document, ", error)
            return {
                valid: false,
                message: "Error connecting to Firebase database; please try again."
            }
        })
	}

    function validateGroupCode(value: string){
        if (value.trim() === ''){
            return {
                valid: false,
                message: "Group Passcode cannot be empty!"
            }
        }
        else {
            return {valid: true}
        }
    }

    function handleSubmit() {
        dispatch(setPref('groupName', newGroup))
        dispatch(setPref('groupCode', newCode))
    }

	return (
		<DualPromptButton
            icon={<IconFolder />}
            label={"Change Group"}
            submitLabel={"Change Group"}
            firstOnChange={e => setNewGroup(e.target.value)}
            secondOnChange={e => setNewCode(e.target.value)}
            onSubmit={handleSubmit}
            firstPrompt="Group Name"
            secondPrompt='Group Code'
            firstValue={newGroup}
            secondValue={newCode}
            firstValidate={validateGroupName}
            secondValidate={validateGroupCode}
        />
	);
};
