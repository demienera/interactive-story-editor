import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { saveStory } from '@/entities/story/library/story-library';
import type { Story } from '@/entities/story/model/types';
import { LibraryTabs } from './LibraryTabs';

vi.mock('next/navigation', () => ({
	useRouter: () => ({ push: vi.fn() }),
}));

const myStory: Story = {
	id: 'my-story',
	title: 'My Own Tale',
	description: '',
	nodes: [{ id: 'start', type: 'start', title: 'Start' }],
	edges: [],
};

function renderTabs() {
	const user = userEvent.setup();
	render(<LibraryTabs />);

	return user;
}

beforeEach(() => {
	localStorage.clear();
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe('LibraryTabs', () => {
	it('opens the examples when the user has no stories', async () => {
		renderTabs();

		expect(await screen.findByRole('tab', { name: 'Examples', selected: true })).toBeInTheDocument();
		expect(screen.getByRole('tabpanel', { name: 'Examples' })).toBeVisible();
		expect(screen.getByRole('link', { name: 'Play The Whispering Forest' })).toBeInTheDocument();
	});

	it('opens the user stories when there are some', async () => {
		saveStory(myStory, {});
		renderTabs();

		expect(await screen.findByRole('tab', { name: /My stories/, selected: true })).toHaveTextContent('My stories1');
		expect(screen.getByRole('heading', { level: 3, name: 'My Own Tale' })).toBeInTheDocument();
	});

	it('moves between tabs with the arrow keys', async () => {
		const user = renderTabs();
		const examples = await screen.findByRole('tab', { name: 'Examples', selected: true });

		examples.focus();
		await user.keyboard('{ArrowRight}');

		const mine = screen.getByRole('tab', { name: 'My stories' });
		expect(mine).toHaveAttribute('aria-selected', 'true');
		expect(mine).toHaveFocus();
		expect(examples).toHaveAttribute('tabindex', '-1');

		await user.keyboard('{Home}');
		expect(examples).toHaveFocus();
		expect(examples).toHaveAttribute('aria-selected', 'true');
	});

	it('asks for confirmation in a dialog and keeps the story on Cancel', async () => {
		saveStory(myStory, {});
		const user = renderTabs();
		const deleteButton = await screen.findByRole('button', { name: 'Delete My Own Tale' });

		await user.click(deleteButton);

		const dialog = screen.getByRole('dialog', { name: 'Delete story?' });
		expect(dialog).toHaveAccessibleDescription('"My Own Tale" will be deleted from this browser. This cannot be undone.');
		expect(within(dialog).getByRole('button', { name: 'Cancel' })).toHaveFocus();

		await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		expect(screen.getByRole('heading', { level: 3, name: 'My Own Tale' })).toBeInTheDocument();
	});

	it('deletes a story after confirmation and announces it only to screen readers', async () => {
		saveStory(myStory, {});
		const user = renderTabs();

		await user.click(await screen.findByRole('button', { name: 'Delete My Own Tale' }));
		await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

		const panel = screen.getByRole('tabpanel', { name: /My stories/ });
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		expect(screen.queryByRole('heading', { name: 'My Own Tale' })).not.toBeInTheDocument();
		expect(within(panel).getByRole('status')).toHaveTextContent('"My Own Tale" deleted');
		expect(panel).toHaveFocus();
		expect(screen.getByRole('tab', { name: 'My stories', selected: true })).toBeInTheDocument();
		expect(within(panel).getByText('No stories yet')).toBeInTheDocument();
	});
});
