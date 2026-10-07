import type { Story } from '../model/types';
import { lanternFerry } from './examples/lantern-ferry';
import { nightMarket } from './examples/night-market';
import { whisperingForest } from './examples/whispering-forest';

export const exampleStories: Story[] = [whisperingForest, lanternFerry, nightMarket];

export function getExampleStory(id: string): Story | undefined {
	return exampleStories.find((story) => story.id === id);
}
