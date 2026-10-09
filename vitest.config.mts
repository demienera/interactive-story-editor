import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		tsconfigPaths: true,
	},
	test: {
		projects: [
			{
				extends: true,
				test: {
					name: 'unit',
					include: ['src/**/*.test.ts'],
					environment: 'node',
				},
			},
			{
				extends: true,
				plugins: [react()],
				test: {
					name: 'ui',
					include: ['src/**/*.test.tsx'],
					environment: 'jsdom',
					setupFiles: ['./vitest.setup.ts'],
				},
			},
		],
	},
});
