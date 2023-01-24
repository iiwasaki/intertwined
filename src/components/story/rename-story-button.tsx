import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconWriting} from '@tabler/icons';
import {PromptButton} from '../control/prompt-button';
//import {storyFileName} from '../../electron/shared';
import {Story} from '../../store/stories';
import {IconButton} from '../control/icon-button';
import { db } from '../../firebase-config';

// This is here because it's used in two places--the story list and the story
// info dialog.

const DisabledRenameStoryButton: React.FC = () => {
	const {t} = useTranslation();

	return (
		<IconButton disabled icon={<IconWriting />} label={t('common.rename')} />
	);
};

interface EnabledRenameStoryButtonProps {
	existingStories: Story[];
	onRename: (value: string) => void;
	story: Story;
	groupName: string;
	groupCode: string;
}

const EnabledRenameStoryButton: React.FC<EnabledRenameStoryButtonProps> = props => {
	const { onRename, story, groupName, groupCode} = props;
	const [newName, setNewName] = React.useState(story.name);
	const {t} = useTranslation();

	React.useEffect(() => setNewName(story.name), [story]);

	function validate(name: string) {
		return db.runTransaction((transaction) => {
			let nameDocRef = db.collection("groups").doc(groupName).collection("about").doc(groupCode).collection("stories").doc(name);
			return transaction.get(nameDocRef).then((nameDoc => {
				if (nameDoc.exists){
					return {
						valid: false,
						message: t('components.renameStoryButton.nameAlreadyUsed'),
					}
				}
				else {
					return {
						valid: true,
					}
				}
			})).catch(() => {
				return {
					valid: false,
					message: t('components.renameStoryButton.emptyName'),
				}
			})
		}).then((result) => {
			return result;
		}).catch(() => {
			return {
				valid: false,
				message: t('components.renameStoryButton.emptyName'),
			}
		})

		// if (
		// 	existingStories.some(
		// 		s =>
		// 			s.id !== story.id &&
		// 			storyFileName(s) === storyFileName({...story, name})
		// 	)
		// ) {
		// 	return {
		// 		message: t('components.renameStoryButton.nameAlreadyUsed'),
		// 		valid: false
		// 	};
		// }

		// return {valid: true};
	}

	return (
		<PromptButton
			icon={<IconWriting />}
			label={t('common.rename')}
			onChange={event => setNewName(event.target.value)}
			onSubmit={onRename}
			prompt={t('common.renamePrompt', {name: story.name})}
			validate={validate}
			value={newName}
		/>
	);
};

export interface RenameStoryButtonProps
	extends Omit<EnabledRenameStoryButtonProps, 'story'> {
	story?: Story;
}

export const RenameStoryButton: React.FC<RenameStoryButtonProps> = props => {
	if (props.story) {
		return (
			<EnabledRenameStoryButton {...(props as EnabledRenameStoryButtonProps)} />
		);
	}

	return <DisabledRenameStoryButton />;
};