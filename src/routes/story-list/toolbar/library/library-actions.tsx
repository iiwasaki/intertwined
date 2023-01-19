import * as React from 'react';
import {ButtonBar} from '../../../../components/container/button-bar';
import {ArchiveButton} from './archive-button';
import {ImportStoryButton} from './import-story-button';
import {StoryTagsButton} from './story-tags-button';

/* For firebase */
import {GroupButton} from "./group-button"
import { AddGroupButton } from './add-group-button';
import { RefreshLibraryButton } from './refresh-library-button';

export const LibraryActions: React.FC = () => (
	<ButtonBar>
		<StoryTagsButton />
		<ImportStoryButton />
		<ArchiveButton />
		<GroupButton />
		<AddGroupButton />
		<RefreshLibraryButton />
	</ButtonBar>
);
