import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { backgrounds, getBackground } from './backgrounds';

describe('backgrounds', () => {
	test('every background has a unique id', () => {
		const ids = backgrounds.map((background) => background.id);

		expect(new Set(ids).size).toBe(ids.length);
	});

	test.each(backgrounds.map((background) => [background.id, background] as const))(
		'"%s" has a file in public',
		(_id, background) => {
			expect(existsSync(join(process.cwd(), 'public', background.src))).toBe(true);
		},
	);
});

describe('getBackground', () => {
	test('finds a background by id', () => {
		expect(getBackground('forest-shrine')?.label).toBe('Forest shrine');
	});

	test('returns undefined for an unknown id', () => {
		expect(getBackground('unknown')).toBeUndefined();
	});
});
