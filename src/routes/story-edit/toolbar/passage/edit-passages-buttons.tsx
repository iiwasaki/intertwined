import {IconEdit} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {PassageEditDialog, useDialogsContext} from '../../../../dialogs';
import {Passage, Story} from '../../../../store/stories';

export interface EditPassagesButtonProps {
	passages: Passage[];
	story: Story;
}

export const EditPassagesButton: React.FC<EditPassagesButtonProps> = props => {
	const {passages, story} = props;
	const {dispatch: dialogsDispatch, dialogs: allDialogs} = useDialogsContext();
	const {t} = useTranslation();

	function handleClick() {
		// Only one edit window open for now - Firepad and CodeMirror desyncs when multiple are opened.
		if (allDialogs.length > 0) {
			dialogsDispatch({
				type: 'removeAllDialogs'
			})
			setTimeout(() => {
				dialogsDispatch({
					type: 'addDialog',
					component: PassageEditDialog,
					props: { passageId: passages[0].id, storyId: story.id }
				})
			}, 700)
		}
		else {
			dialogsDispatch({
				type: 'addDialog',
				component: PassageEditDialog,
				props: { passageId: passages[0].id, storyId: story.id }
			})
		}
	}

	return (
		<IconButton
			disabled={passages.length === 0}
			icon={<IconEdit />}
			label={t('common.edit')
			}
			onClick={handleClick}
		/>
	);
};
