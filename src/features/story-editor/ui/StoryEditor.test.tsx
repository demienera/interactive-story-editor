import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Story } from '@/entities/story/model/types';
import { StoryEditor } from './StoryEditor';

const story: Story = {
	id: 'test-story',
	title: 'Test story',
	description: '',
	nodes: [
		{ id: 'start', type: 'start', title: 'Start' },
		{ id: 'forest', type: 'scene', title: 'The Forest', text: 'Trees everywhere.', choices: [] },
	],
	edges: [],
};

function renderEditor() {
	const user = userEvent.setup();
	const onChange = vi.fn<(story: Story) => void>();
	render(
		<StoryEditor
			initialStory={story}
			initialLayout={{}}
			onChange={onChange}
		/>,
	);

	const getSavedStory = () => onChange.mock.lastCall?.[0];

	return { user, onChange, getSavedStory };
}

function getNodePanel() {
	return screen.getByRole('complementary');
}

describe('StoryEditor', () => {
	it('adds a scene and saves its form', async () => {
		const { user, getSavedStory } = renderEditor();

		await user.click(screen.getByRole('button', { name: 'Add scene' }));

		const title = within(getNodePanel()).getByRole('textbox', { name: 'Title' });
		expect(title).toHaveFocus();
		expect(title).toHaveValue('New scene');

		await user.clear(title);
		await user.type(title, 'The River');
		await user.type(within(getNodePanel()).getByRole('textbox', { name: 'Text' }), 'Water runs fast.');
		await user.click(within(getNodePanel()).getByRole('button', { name: 'Save' }));

		expect(await screen.findByText('Changes saved')).toBeInTheDocument();
		expect(getSavedStory()?.nodes).toContainEqual(
			expect.objectContaining({ type: 'scene', title: 'The River', text: 'Water runs fast.' }),
		);
	});

	it('saves a background chosen for a scene', async () => {
		const { user, getSavedStory } = renderEditor();

		await user.click(screen.getByRole('button', { name: 'Add scene' }));

		const panel = getNodePanel();
		const background = within(panel).getByRole('combobox', { name: 'Background' });
		expect(background).toHaveAccessibleDescription('The background stays until a later scene changes it.');

		await user.type(within(panel).getByRole('textbox', { name: 'Text' }), 'A quiet shrine.');
		await user.selectOptions(background, 'Forest shrine');
		await user.click(within(panel).getByRole('button', { name: 'Save' }));

		expect(await screen.findByText('Changes saved')).toBeInTheDocument();
		expect(getSavedStory()?.nodes).toContainEqual(
			expect.objectContaining({ type: 'scene', title: 'New scene', background: 'forest-shrine' }),
		);
	});

	it('shows a validation error and keeps the story unchanged', async () => {
		const { user, onChange } = renderEditor();

		await user.click(screen.getByRole('button', { name: 'Add scene' }));
		const callsAfterAdd = onChange.mock.calls.length;

		const title = within(getNodePanel()).getByRole('textbox', { name: 'Title' });
		await user.clear(title);
		await user.click(within(getNodePanel()).getByRole('button', { name: 'Save' }));

		expect(await screen.findByText('Enter a title.')).toBeInTheDocument();
		expect(title).toHaveAttribute('aria-invalid', 'true');
		expect(title).toHaveAccessibleDescription('Enter a title.');
		expect(title).toHaveFocus();
		expect(onChange).toHaveBeenCalledTimes(callsAfterAdd);
	});

	it('selects a node from the story check and connects it with a select', async () => {
		const { user, getSavedStory } = renderEditor();
		const summary = screen.getByText(/error/);
		const summaryBefore = summary.textContent;

		await user.click(screen.getByText('Show problems'));
		await user.click(screen.getByRole('button', { name: /"Start" has no next node/ }));

		const panel = getNodePanel();
		expect(within(panel).getByRole('heading', { level: 2, name: 'Edit start' })).toBeInTheDocument();

		await user.selectOptions(within(panel).getByRole('combobox', { name: 'Continue to' }), 'Scene: The Forest');

		expect(await screen.findByText('Connected to "The Forest"')).toBeInTheDocument();
		expect(getSavedStory()?.edges).toEqual([
			expect.objectContaining({ type: 'continue', source: 'start', target: 'forest' }),
		]);
		expect(summary.textContent).not.toBe(summaryBefore);
	});

	it('undoes and redoes with the toolbar and the keyboard', async () => {
		const { user, getSavedStory } = renderEditor();

		await user.click(screen.getByRole('button', { name: 'Add scene' }));
		expect(getSavedStory()?.nodes).toHaveLength(3);

		await user.click(screen.getByRole('button', { name: 'Undo' }));

		expect(await screen.findByText('Undone: Scene added')).toBeInTheDocument();
		expect(getSavedStory()?.nodes).toHaveLength(2);
		expect(within(getNodePanel()).getByRole('heading', { name: 'Node details' })).toBeInTheDocument();

		await user.keyboard('{Control>}{Shift>}z{/Shift}{/Control}');

		expect(await screen.findByText('Redone: Scene added')).toBeInTheDocument();
		expect(getSavedStory()?.nodes).toHaveLength(3);

		await user.keyboard('{Control>}z{/Control}');

		expect(getSavedStory()?.nodes).toHaveLength(2);
	});

	it('deletes a node from the panel and restores it with undo', async () => {
		const { user, getSavedStory } = renderEditor();

		await user.click(screen.getByRole('button', { name: 'Add scene' }));
		await user.click(screen.getByRole('button', { name: 'Delete scene' }));

		expect(within(getNodePanel()).getByRole('heading', { name: 'Node details' })).toHaveFocus();
		expect(await screen.findByText('Scene "New scene" deleted. Press Undo to restore.')).toBeInTheDocument();
		expect(getSavedStory()?.nodes).toHaveLength(2);

		await user.click(screen.getByRole('button', { name: 'Undo' }));

		expect(getSavedStory()?.nodes).toContainEqual(expect.objectContaining({ title: 'New scene' }));
	});
});
