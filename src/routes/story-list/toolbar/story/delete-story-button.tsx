import {IconTrash} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {ConfirmButton} from '../../../../components/control/confirm-button';
import { db } from '../../../../firebase-config';
import {Story, useStoriesContext} from '../../../../store/stories';
import {isElectronRenderer} from '../../../../util/is-electron';
import { usePersistence } from '../../../../store/persistence/use-persistence';
import { usePrefsContext } from '../../../../store/prefs';

export interface DeleteStoryButtonProps {
	story?: Story;
}

function deleteStoryFB(groupName: string, groupCode: string, storyName: string | undefined) : Promise<boolean> {
	let storyRef = db.collection("groups").doc(groupName).collection("about").doc(groupCode).collection("stories").doc(storyName)
	return db.runTransaction((transaction) => {
		return transaction.get(storyRef).then((doc) => {
			if (!doc.exists){
				// Story has already been deleted? Or otherwise does not exist anymore.
				return true;
			}
			else {
				transaction.delete(storyRef)
				return true;
			}
		})
	}).catch((err) => {
		console.error("Error in deleting story: ", err);
		return false;
	})
}

function deleteAllPassagesFB(groupName: string, groupCode: string, storyId: string) : Promise<boolean>{
	let passagesCollectionRef = db.collection("passages").doc(groupName).collection("pass").doc(groupCode).collection(storyId)
	let passageNames :string[] = []
	return passagesCollectionRef.get().then((snapshot) => {
		snapshot.forEach((doc) => {
			passageNames.push(doc.data().name)
		})
	}).then(()=> {
		for (let name of passageNames){
			passagesCollectionRef.doc(name).delete();
		}
	}).then(() => {
		return true;
	}).catch(() => {
		return false;
	})
}

export const DeleteStoryButton: React.FC<DeleteStoryButtonProps> = ({
	story
}) => {
	// We need to store a local copy of the story name so that after it's deleted,
	// the prompt doesn't change as it transitions out.
	const [storyName, setStoryName] = React.useState(story?.name);
	const {dispatch} = useStoriesContext();
	const {t} = useTranslation();
	const {prefs} = usePrefsContext();
	const {stories: storiesDispatch} = usePersistence();


	React.useEffect(() => {
		if (story?.name) {
			setStoryName(story.name);
		}
	}, [story?.name]);

	return (
		<ConfirmButton
			confirmIcon={<IconTrash />}
			confirmLabel={t('common.delete')}
			confirmVariant="danger"
			disabled={!story}
			icon={<IconTrash />}
			label={t('common.delete')}
			onConfirm={() => {
				let name = story?.name;
				let id = story?.id;
				deleteStoryFB(prefs.groupName, prefs.groupCode, name).then( async (res) => {
					if (res) {
						console.log("Successfully deleted story, now deleting passages")
						if (id !== undefined){
							deleteAllPassagesFB(prefs.groupName, prefs.groupCode, id)
							const newStories = await storiesDispatch.load(prefs.groupName, prefs.groupCode)
							dispatch({type: 'init', state: newStories})
						}
					}
				})
			}}
			prompt={t(
				`routes.storyList.toolbar.deleteStoryButton.warning.${
					isElectronRenderer() ? 'electron' : 'web'
				}`,
				{storyName}
			)}
		/>
	);
};
