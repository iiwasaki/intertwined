/* Handles adding a new group for a user for Intertwined */

import * as React from 'react';
import {IconFolderPlus} from '@tabler/icons';
import { setPref, usePrefsContext } from '../../../../store/prefs';
import { DualPromptButton } from '../../../../components/control/dual-prompt-button';

export const AddGroupButton: React.FC = () => {
    const {dispatch, prefs} = usePrefsContext();
    const [newGroup, setNewGroup] = React.useState(
        prefs.groupName
    )
    const [newCode, setNewCode] = React.useState (
        prefs.groupCode
    )

    function handleSubmit() {
        console.log("adding new group!")
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
        />
	);
};
