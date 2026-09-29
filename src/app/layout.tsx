import type { Metadata } from 'next';
import { Geist, Geist_Mono, Spectral } from 'next/font/google';
import clsx from 'clsx';
import './globals.scss';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

const spectral = Spectral({
	variable: '--font-spectral',
	subsets: ['latin'],
	weight: ['400', '600'],
	style: ['normal', 'italic'],
});

export const metadata: Metadata = {
	title: 'Interactive Story Editor',
	description: 'Create and explore branching stories.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
	return (
		<html
			lang='en'
			className={clsx(geistSans.variable, geistMono.variable, spectral.variable)}
		>
			<body>{children}</body>
		</html>
	);
}
