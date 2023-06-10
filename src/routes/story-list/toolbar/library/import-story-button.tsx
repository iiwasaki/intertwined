import {IconFileImport} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import {StoryImportDialog, useDialogsContext} from '../../../../dialogs';
import { usePrefsContext } from '../../../../store/prefs';
import { db } from '../../../../firebase-config';

export const ImportStoryButton: React.FC = () => {
	const {prefs} = usePrefsContext();
	const {dispatch} = useDialogsContext();
	const {t} = useTranslation();
	const [buttonDisabled, setDisabled] = React.useState(true);

	React.useEffect(() => {
		if (!prefs.groupCode || !prefs.groupName) {
			setDisabled(true);
			return;
		}
		db.collection("groups").doc(prefs.groupName).collection("about").doc(prefs.groupCode).get().then((doc) => {
			if (doc.exists){
				setDisabled(false);
			}
			else {
				setDisabled(true);
			}
		}).catch((error) => {
			console.error("Error in getting group: ", error);
			setDisabled(true);
		})

	}, [prefs.groupCode, prefs.groupName]);

	return (
		<IconButton
			disabled = {buttonDisabled}
			icon={<IconFileImport />}
			label={t('common.import')}
			onClick={() =>
				dispatch({type: 'addDialog', component: StoryImportDialog})
			}
		/>
	);
};
