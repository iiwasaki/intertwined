import {IconRefresh} from '@tabler/icons';
import * as React from 'react';
//import {useTranslation} from 'react-i18next';
import {IconButton} from '../../../../components/control/icon-button';
import { usePrefsContext } from '../../../../store/prefs';
import { useStoriesContext } from '../../../../store/stories';
import { usePersistence } from '../../../../store/persistence/use-persistence';

export const RefreshLibraryButton: React.FC = () => {
    const {dispatch: storiesDispatch} = useStoriesContext();
    const {prefs} = usePrefsContext();
    const {stories} = usePersistence();

	return (
		<IconButton
			icon={<IconRefresh />}
			label={"Sync Group Library"}
			onClick={async () => {
                const newStories = await stories.load(prefs.groupName, prefs.groupCode)
                storiesDispatch({type: 'init', state: newStories})
			}}
		/>
	);
};
