import sortBy from 'lodash/sortBy';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {MainContent} from '../../components/container/main-content';
import {SafariWarningCard} from '../../components/error';
import {
	AppDonationDialog,
	DialogsContextProvider,
	useDialogsContext
} from '../../dialogs';
import {usePrefsContext} from '../../store/prefs';
import {useDonationCheck} from '../../store/prefs/use-donation-check';
import {
	deselectAllStories,
	deselectStory,
	selectStory,
	useStoriesContext
} from '../../store/stories';
import {UndoableStoriesContextProvider} from '../../store/undoable-stories';
import {StoryListToolbar} from './toolbar/story-list-toolbar';
import {StoryCards} from './story-cards';
import {ClickAwayListener} from '../../components/click-away-listener';
import { db } from '../../firebase-config';

export const InnerStoryListRoute: React.FC = () => {
	const {dispatch: dialogsDispatch} = useDialogsContext();
	const {dispatch: storiesDispatch, stories} = useStoriesContext();
	const {prefs} = usePrefsContext();
	const {shouldShowDonationPrompt} = useDonationCheck();
	const {t} = useTranslation();
	
	let [activeGroupName, setActiveGroupName] = React.useState("No Group selected");

	const selectedStories = React.useMemo(
		() => stories.filter(story => story.selected),
		[stories]
	);

	const visibleStories = React.useMemo(() => {
		const filteredStories =
			prefs.storyListTagFilter.length > 0
				? stories.filter(story =>
						story.tags.some(tag => prefs.storyListTagFilter.includes(tag))
				  )
				: stories;

		switch (prefs.storyListSort) {
			case 'date':
				return sortBy(filteredStories, 'lastUpdated');
			case 'name':
				return sortBy(filteredStories, 'name');
		}
	}, [prefs.storyListSort, prefs.storyListTagFilter, stories]);

	// Any stories no longer visible should be deselected.

	React.useEffect(() => {
		for (const story of selectedStories) {
			if (story.selected && !visibleStories.includes(story)) {
				storiesDispatch(deselectStory(story, prefs.groupName, prefs.groupCode));
			}
		}
	}, [selectedStories, stories, storiesDispatch, visibleStories, prefs.groupName, prefs.groupCode]);

	React.useEffect(() => {
		if (shouldShowDonationPrompt()) {
			dialogsDispatch({type: 'addDialog', component: AppDonationDialog});
		}
	}, [dialogsDispatch, shouldShowDonationPrompt]);

	React.useEffect(() => {
		if (prefs.groupName === "" || prefs.groupCode === "") {
			setActiveGroupName("No group or incorrect group code")
			return
		}
		db.collection("groups").doc(prefs.groupName).collection("about").doc(prefs.groupCode).get().then((doc) => {
			if (doc.exists){
				setActiveGroupName(prefs.groupName)
			}
			else {
				setActiveGroupName("No group or incorrect group code")
			}
		}).catch((error) => {
			console.log("Error in getting group: ", error)
			setActiveGroupName("Incorrect group passcode")
		})
	}, [prefs.groupCode, prefs.groupName])

	return (
		<div className="story-list-route">
			<StoryListToolbar selectedStories={selectedStories} />
			<ClickAwayListener
				ignoreSelector=".story-card"
				onClickAway={() => storiesDispatch(deselectAllStories(prefs.groupName, prefs.groupCode))}
			>
				<MainContent
					title={
						`${activeGroupName} | ` +
						t(
						prefs.storyListTagFilter.length > 0
							? 'routes.storyList.taggedTitleCount'
							: 'routes.storyList.titleCount',
						{count: visibleStories.length}
					) }
				>
					<SafariWarningCard />
					<div className="stories">
						{stories.length === 0 ? (
							<p>{t('routes.storyList.noStories')}</p>
						) : (
							<StoryCards
								onSelectStory={story =>
									storiesDispatch(selectStory(story, true, prefs.groupName, prefs.groupCode))
								}
								stories={visibleStories}
							/>
						)}
					</div>
				</MainContent>
			</ClickAwayListener>
		</div>
	);
};

export const StoryListRoute: React.FC = () => (
	<UndoableStoriesContextProvider>
		<DialogsContextProvider>
			<InnerStoryListRoute />
		</DialogsContextProvider>
	</UndoableStoriesContextProvider>
);
