import * as React from 'react';
import { useParams } from 'react-router-dom';
import { MainContent } from '../../components/container/main-content';
import {
	DialogsContextProvider,
	PassageEditDialog,
	useDialogsContext
} from '../../dialogs';
import {
	createUntitledPassage,
	deselectPassage,
	movePassages,
	Passage,
	selectPassage,
	selectPassagesInRect,
	storyWithId
} from '../../store/stories';
import {
	UndoableStoriesContextProvider,
	useUndoableStoriesContext
} from '../../store/undoable-stories';
import { Point, Rect } from '../../util/geometry';
import { StoryEditToolbar } from './toolbar';
import './story-edit-route.css';
import { ZoomButtons } from './zoom-buttons';
import { DocumentTitle } from '../../components/document-title/document-title';
import { useZoomTransition } from './use-zoom-transition';
import { useZoomShortcuts } from './use-zoom-shortcuts';
import { MarqueeablePassageMap } from './marqueeable-passage-map';

/* Firebase */
import { db } from '../../firebase-config';
import {
	useStoriesContext
} from "../../store/stories"
import { usePrefsContext } from '../../store/prefs';
import { useHistory } from 'react-router-dom';

export const InnerStoryEditRoute: React.FC = () => {
	const [inited, setInited] = React.useState(false);
	const { dispatch: dialogsDispatch, dialogs: allDialogs } = useDialogsContext();
	const mainContent = React.useRef<HTMLDivElement>(null);
	const { storyId } = useParams<{ storyId: string }>();
	const { dispatch: undoableStoriesDispatch, stories } =
		useUndoableStoriesContext();
	const story = storyWithId(stories, storyId);
	const { dispatch: storiesDispatch } = useStoriesContext();
	const { prefs } = usePrefsContext();
	const history = useHistory();
	useZoomShortcuts(story);

	const selectedPassages = React.useMemo(
		() => story.passages.filter(passage => passage.selected),
		[story.passages]
	);

	const getCenter = React.useCallback(() => {
		if (!mainContent.current) {
			throw new Error(
				'Asked for the center of the main content, but it does not exist in the DOM yet'
			);
		}

		return {
			left:
				(mainContent.current.scrollLeft + mainContent.current.clientWidth / 2) /
				story.zoom,
			top:
				(mainContent.current.scrollTop + mainContent.current.clientHeight / 2) /
				story.zoom
		};
	}, [story.zoom]);

	const handleDeselectPassage = React.useCallback(
		(passage: Passage) =>
			undoableStoriesDispatch(deselectPassage(story, passage, prefs.groupName, prefs.groupCode)),
		[story, undoableStoriesDispatch, prefs.groupCode, prefs.groupName]
	);

	const handleDragPassages = React.useCallback(
		(change: Point) => {
			// Ignore tiny drags--they're probably caused by the user moving their
			// mouse slightly during double-clicking.

			if (Math.abs(change.left) < 1 && Math.abs(change.top) < 1) {
				return;
			}

			undoableStoriesDispatch(
				movePassages(
					story,
					story.passages.reduce<string[]>(
						(result, current) =>
							current.selected ? [...result, current.id] : result,
						[]
					),
					change.left / story.zoom,
					change.top / story.zoom,
					prefs.groupName,
					prefs.groupCode
				),
				selectedPassages.length > 1
					? 'undoChange.movePassages'
					: 'undoChange.movePassages'
			);
		},
		[selectedPassages.length, story, undoableStoriesDispatch, prefs.groupCode, prefs.groupName]
	);

	const handleEditPassage = React.useCallback(
		(passage: Passage) => {
			if (allDialogs.length > 0) {
				dialogsDispatch({
					type: 'removeAllDialogs'
				})
				setTimeout(() => {
					dialogsDispatch({
						type: 'addDialog',
						component: PassageEditDialog,
						props: { passageId: passage.id, storyId: story.id }
					})
				}, 700)
			}
			else {
				dialogsDispatch({
					type: 'addDialog',
					component: PassageEditDialog,
					props: { passageId: passage.id, storyId: story.id }
				})
			}
		},
		[dialogsDispatch, story.id, allDialogs]
	);

	const handleSelectPassage = React.useCallback(
		(passage: Passage, exclusive: boolean) =>
			undoableStoriesDispatch(selectPassage(story, passage, exclusive, prefs.groupName, prefs.groupCode)),
		[story, undoableStoriesDispatch, prefs.groupName, prefs.groupCode]
	);

	const handleSelectRect = React.useCallback(
		(rect: Rect, exclusive: boolean) => {
			// The rect we receive is in screen coordinates--we need to convert to
			// logical ones.
			const logicalRect: Rect = {
				height: rect.height / story.zoom,
				left: rect.left / story.zoom,
				top: rect.top / story.zoom,
				width: rect.width / story.zoom
			};
			// This should not be undoable.
			undoableStoriesDispatch(
				selectPassagesInRect(
					story,
					logicalRect,
					exclusive ? selectedPassages.map(passage => passage.id) : [],
					prefs.groupName,
					prefs.groupCode
				)
			);
		},
		[selectedPassages, story, undoableStoriesDispatch, prefs.groupName, prefs.groupCode]
	);

	// If we have just mounted and the story has no passages, create one for the
	// user (and skip undo history, since it was an automatic action).

	React.useEffect(() => {
		if (!inited) {
			setInited(true);

			if (story.passages.length === 0) {
				const center = getCenter();

				undoableStoriesDispatch(
					createUntitledPassage(story, center.left, center.top, prefs.groupName, prefs.groupCode)
				);
			}
		}
	}, [getCenter, inited, story, undoableStoriesDispatch, prefs.groupCode, prefs.groupName]);

	React.useEffect(() => {
		console.log("Making snapshot for story")
		let unsubscribe = db.collection("groups").doc(prefs.groupName).collection("about").doc(prefs.groupCode).collection("stories").doc(story.name).onSnapshot((snapshot) => {
			try {
				console.log("Snapshot triggered")
				if (snapshot?.data() === undefined) {
					alert("Story has been renamed or deleted; please go back to the main menu and refresh the library.")
					history.push("/stories/")
					return;
				}
				if (!snapshot.metadata.hasPendingWrites) {
					console.log("Dispatching from story editing snapshot update")
					storiesDispatch({
						type: "updateStory", storyId: snapshot?.data()?.id, props: {
							name: snapshot?.data()?.name,
							startPassage: snapshot?.data()?.startPassage,
							storyFormat: snapshot?.data()?.storyFormat,
							storyFormatVersion: snapshot?.data()?.storyFormatVersion,
							script: snapshot?.data()?.script,
							stylesheet: snapshot?.data()?.stylesheet,
							tagColors: snapshot?.data()?.tagColors,
							tags: snapshot?.data()?.tags,
						},
						groupName: prefs.groupName,
						groupCode: prefs.groupCode
					})
				}
			}
			catch (error) {
				throw new Error("Error in creating story snapshot!")
			}
		}, (err) => {
			throw new Error("Could not get story data from database - story does not exist, or incorrect group name or passcode.")
		})
		return () => {
			console.log("Unsubbing from story")
			unsubscribe()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [prefs.groupCode, prefs.groupName, story.name])

	React.useEffect(() => {
		console.log("Making snapshots for passages")
		storiesDispatch({type: 'clearState', storyId: storyId})
		let unsubscribe = db.collection("passages").doc(prefs.groupName).collection("pass").doc(prefs.groupCode).collection(storyId).onSnapshot((snapshot) => {
			console.log("Has pending writes?", snapshot.metadata.hasPendingWrites)
			console.log("Dispatching passage act from story passage editing snapshot update")
			snapshot.docChanges().forEach((change) => {
				if (change.type === "added") {
					console.log("New Passage: ", change.doc.data())
					storiesDispatch({
						type: "createPassage", storyId: change.doc.data().story, props: {
							id: change.doc.data().id,
							left: change.doc.data().left,
							name: change.doc.data().name,
							story: change.doc.data().story,
							tags: change.doc.data().tags,
							text: change.doc.data().text,
							top: change.doc.data().top,
						},
						groupName: prefs.groupName,
						groupCode: prefs.groupCode
					})
				}
				if (change.type === "modified") {
					storiesDispatch({
						type: "updatePassage", storyId: change.doc.data().story, passageId: change.doc.data().id, props: {
							id: change.doc.data().id,
							left: change.doc.data().left,
							name: change.doc.data().name,
							story: change.doc.data().story,
							tags: change.doc.data().tags,
							text: change.doc.data().text,
							top: change.doc.data().top,
						},
						groupName: prefs.groupName,
						groupCode: prefs.groupCode
					})
				}
				if (change.type === "removed") {
					console.log("Deleted Passage: ", change.doc.data())
					storiesDispatch({
						type: "deletePassage",
						passageId: change.doc.data().id,
						storyId: change.doc.data().story,
						groupName: prefs.groupName,
						groupCode: prefs.groupCode
					})
				}

			})
		})

		return () => {
			console.log("Unsubscribing from passages for story")
			unsubscribe()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [prefs.groupName, prefs.groupCode, storyId])

	const visibleZoom = useZoomTransition(story.zoom, mainContent.current);

	return (
		<div className="story-edit-route">
			<DocumentTitle title={story.name} />
			<StoryEditToolbar getCenter={getCenter} story={story} />
			<MainContent grabbable padded={false} ref={mainContent}>
				<MarqueeablePassageMap
					container={mainContent}
					formatName={story.storyFormat}
					formatVersion={story.storyFormatVersion}
					onDeselect={handleDeselectPassage}
					onDrag={handleDragPassages}
					onEdit={handleEditPassage}
					onSelect={handleSelectPassage}
					onSelectRect={handleSelectRect}
					passages={story.passages}
					startPassageId={story.startPassage}
					tagColors={story.tagColors}
					visibleZoom={visibleZoom}
					zoom={story.zoom}
				/>
				<ZoomButtons story={story} />
			</MainContent>
		</div>
	);
};;

// This is a separate component so that the inner one can use
// `useEditorsContext()` and `useUndoableStoriesContext()` inside it.

export const StoryEditRoute: React.FC = () => (
	<UndoableStoriesContextProvider>
		<DialogsContextProvider>
			<InnerStoryEditRoute />
		</DialogsContextProvider>
	</UndoableStoriesContextProvider>
);
