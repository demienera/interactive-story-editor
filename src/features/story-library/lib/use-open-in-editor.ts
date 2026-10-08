import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { saveStory } from '@/entities/story/library/story-library';
import type { Story } from '@/entities/story/model/types';

export function useOpenInEditor() {
	const router = useRouter();
	const [failed, setFailed] = useState(false);

	const open = (story: Story) => {
		if (!saveStory(story)) {
			setFailed(true);
			return;
		}

		router.push(`/editor/${story.id}`);
	};

	return { open, failed };
}
