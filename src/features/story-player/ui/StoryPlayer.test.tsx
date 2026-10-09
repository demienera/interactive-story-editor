import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { whisperingForest } from '@/entities/story/data/examples/whispering-forest';
import { StoryPlayer } from './StoryPlayer';

vi.mock('next/image', async (importOriginal) => ({
	...(await importOriginal<typeof import('next/image')>()),
	default: () => null,
}));

function renderPlayer() {
	const user = userEvent.setup();
	render(<StoryPlayer story={whisperingForest} />);

	return user;
}

describe('StoryPlayer', () => {
	it('does not move focus on the first render', () => {
		renderPlayer();

		expect(screen.getByRole('heading', { level: 1, name: 'Start' })).not.toHaveFocus();
	});

	it('plays a story to an ending with the keyboard', async () => {
		const user = renderPlayer();

		screen.getByRole('button', { name: 'Begin story' }).focus();
		await user.keyboard('{Enter}');

		expect(screen.getByRole('heading', { level: 1, name: 'The Forest' })).toHaveFocus();

		await user.tab();
		expect(screen.getByRole('button', { name: 'Follow the whisper' })).toHaveFocus();
		await user.keyboard('{Enter}');

		expect(screen.getByRole('heading', { level: 1, name: 'The Whisper' })).toHaveFocus();

		await user.tab();
		expect(screen.getByRole('button', { name: 'Continue' })).toHaveFocus();
		await user.keyboard('{Enter}');

		expect(screen.getByRole('heading', { level: 1, name: 'The Hidden Shrine' })).toHaveFocus();
		expect(screen.getByText('The End')).toBeInTheDocument();
	});

	it('starts again from the ending with "Play again"', async () => {
		const user = renderPlayer();

		await user.click(screen.getByRole('button', { name: 'Begin story' }));
		await user.click(screen.getByRole('button', { name: 'Look for shelter' }));
		await user.click(screen.getByRole('button', { name: 'Continue' }));
		await user.click(screen.getByRole('button', { name: 'Play again' }));

		expect(screen.getByRole('heading', { level: 1, name: 'Start' })).toHaveFocus();
		expect(screen.getByRole('button', { name: 'Begin story' })).toBeInTheDocument();
	});

	describe('typing effect', () => {
		const forest = whisperingForest.nodes.find((node) => node.id === 'forest');
		const forestText = forest?.type === 'scene' ? forest.text : '';

		afterEach(() => {
			vi.unstubAllGlobals();
		});

		function stubReducedMotion(reduce: boolean) {
			vi.stubGlobal('matchMedia', (query: string) => ({ matches: reduce, media: query }));
		}

		it('keeps the whole text in the page while it is typed and finishes on any key', async () => {
			stubReducedMotion(false);
			const user = renderPlayer();

			await user.click(screen.getByRole('button', { name: 'Begin story' }));

			const scene = screen.getByRole('region', { name: 'The Forest' });
			expect(scene).toHaveAttribute('data-typing');
			expect(screen.getByText((_content, element) => element?.tagName === 'P' && element.textContent === forestText)).toBeInTheDocument();

			await user.keyboard('{Shift}');

			expect(scene).not.toHaveAttribute('data-typing');
		});

		it('shows the text at once with reduced motion', async () => {
			stubReducedMotion(true);
			const user = renderPlayer();

			await user.click(screen.getByRole('button', { name: 'Begin story' }));

			await waitFor(() => expect(screen.getByRole('region', { name: 'The Forest' })).not.toHaveAttribute('data-typing'));
		});
	});
});
