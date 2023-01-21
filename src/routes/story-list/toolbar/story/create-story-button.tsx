import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {IconPlus} from '@tabler/icons';
import {usePrefsContext} from '../../../../store/prefs';
import {
	createStoryFirebase,
	createPassageFirebase,
	useStoriesContext
} from '../../../../store/stories';
import {PromptButton} from '../../../../components/control/prompt-button';
import {unusedName} from '../../../../util/unused-name';
import { db } from '../../../../firebase-config';
import { usePersistence } from '../../../../store/persistence/use-persistence';
import { useStoryFormatsContext } from '../../../../store/story-formats';

export const CreateStoryButton: React.FC = () => {
	const {dispatch, stories} = useStoriesContext();
	const {formats} = useStoryFormatsContext();
	const [newName, setNewName] = React.useState("");
	const history = useHistory();
	const {prefs} = usePrefsContext();
	const {t} = useTranslation();
	const {stories: storyPersistence} = usePersistence();

	function validateName(value: string) {
		if (prefs.groupCode === "" || prefs.groupName === ""){
			return {
				valid: false,
				message: "No group assigned!"
			}
		}

		return db.collection("groups").doc(prefs.groupName).collection("about").doc(prefs.groupCode).get().then((doc) => {
			if (doc.exists){
				return db.collection("groups").doc(prefs.groupName).collection("about").doc(prefs.groupCode).collection("stories").doc(value).get().then((doc)=> {
					if (doc.exists){
						return {
							valid: false,
							message: `Story with name ${value} already exists. (You may need to refresh the library!)`
						}
					}
					else {
						if (value.trim() === '') {
							return {
								valid: false,
								message: t('routes.storyList.toolbar.createStoryButton.emptyName')
							};
						}
						else {
							return {
								valid: true
							}
						}
					}
				})
			}
			else {
				return {
					valid: false,
					message: `Invalid group name or passcode.`
				}
			}
		}).catch((error) => {
			return {
				valid: false,
				message: t('routes.storyList.toolbar.createStoryButton.emptyName')
			}
		})

		// if (
		// 	stories.some(story => story.name.toLowerCase() === value.toLowerCase())
		// ) {
		// 	return {
		// 		valid: false,
		// 		message: t('routes.storyList.toolbar.createStoryButton.nameConflict')
		// 	};
		// }

		// return {valid: true};
	}

	function handleSubmit() {
		if (newName.trim() === '') {
			alert(t('routes.storyList.toolbar.createStoryButton.emptyName'))
			return;
		}
		db.collection("groups").doc(prefs.groupName).collection("about").doc(prefs.groupCode).collection("stories").doc(newName).get().then(async (doc) => {
			if (!doc.exists){
				createStoryFirebase(stories, prefs, {name: newName, storyFormat: prefs.storyFormat.name, storyFormatVersion: prefs.storyFormat.version}).then((id) => {
					console.log("Made story with id: ", id)
					createPassageFirebase(prefs, id).then(async () => {
						const newStories = await storyPersistence.load(prefs.groupName, prefs.groupCode)
						dispatch({type: 'init', state: newStories})
					})
				})
			}
			else {
				const newStories = await storyPersistence.load(prefs.groupName, prefs.groupCode)
                dispatch({type: 'init', state: newStories})
			}
		})
		
		//history.push(`/stories/${id}`);
	}

	return (
		<PromptButton
			icon={<IconPlus />}
			label={t('common.new')}
			submitLabel={t('common.create')}
			submitVariant="create"
			onChange={e => setNewName(e.target.value)}
			onSubmit={handleSubmit}
			prompt={t('routes.storyList.toolbar.createStoryButton.prompt')}
			validate={validateName}
			value={newName}
		/>
	);
};
