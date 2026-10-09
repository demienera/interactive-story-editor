import { useEffect, useState } from 'react';

export const MS_PER_CHAR = 30;

export function getTypedLength(textLength: number, elapsedMs: number, msPerChar = MS_PER_CHAR): number {
	return Math.min(textLength, Math.max(0, Math.floor(elapsedMs / msPerChar)));
}

function prefersInstantText(): boolean {
	return typeof window.matchMedia !== 'function' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

type Typing = {
	text: string;
	length: number;
};

export function useTypewriter(text: string) {
	const [typing, setTyping] = useState<Typing>({ text, length: 0 });

	if (typing.text !== text) {
		setTyping({ text, length: 0 });
	}

	const length = typing.text === text ? typing.length : 0;
	const isTyping = length < text.length;

	useEffect(() => {
		let frame = 0;
		const start = performance.now();
		const instant = prefersInstantText();

		const tick = (now: number) => {
			const next = instant ? text.length : getTypedLength(text.length, now - start);

			setTyping((current) => (current.text === text && current.length >= next ? current : { text, length: next }));

			if (next < text.length) {
				frame = requestAnimationFrame(tick);
			}
		};

		frame = requestAnimationFrame(tick);

		return () => cancelAnimationFrame(frame);
	}, [text]);

	const complete = () => setTyping({ text, length: text.length });

	return { typed: text.slice(0, length), rest: text.slice(length), isTyping, complete };
}
