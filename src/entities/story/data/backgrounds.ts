export type Background = {
	id: string;
	label: string;
	src: string;
};

export const backgrounds: Background[] = [
	{ id: 'misty-night', label: 'Misty night', src: '/backgrounds/misty-night.jpg' },

	{ id: 'forest-clearing', label: 'Forest clearing', src: '/backgrounds/whispering-forest/forest-clearing.webp' },
	{ id: 'forest-shrine', label: 'Forest shrine', src: '/backgrounds/whispering-forest/forest-shrine.webp' },
	{ id: 'forest-cabin', label: 'Forest cabin', src: '/backgrounds/whispering-forest/forest-cabin.webp' },
	{ id: 'cabin-interior', label: 'Cabin interior', src: '/backgrounds/whispering-forest/cabin-interior.webp' },

	{ id: 'crossroads', label: 'Crossroads', src: '/backgrounds/lantern-ferry/crossroads.webp' },
	{ id: 'river-reeds', label: 'River reeds', src: '/backgrounds/lantern-ferry/river-reeds.webp' },
	{ id: 'stone-stairs', label: 'Stone stairs', src: '/backgrounds/lantern-ferry/stone-stairs.webp' },
	{ id: 'ferry-pier', label: 'Ferry pier', src: '/backgrounds/lantern-ferry/ferry-pier.webp' },
	{ id: 'river-crossing', label: 'River crossing', src: '/backgrounds/lantern-ferry/river-crossing.webp' },
	{ id: 'far-shore', label: 'Far shore', src: '/backgrounds/lantern-ferry/far-shore.webp' },

	{ id: 'lantern-gate', label: 'Lantern gate', src: '/backgrounds/night-market/lantern-gate.webp' },
	{ id: 'market-square', label: 'Market square', src: '/backgrounds/night-market/market-square.webp' },
	{ id: 'mask-shop', label: 'Mask shop', src: '/backgrounds/night-market/mask-shop.webp' },
	{ id: 'moonlit-forest-run', label: 'Moonlit forest run', src: '/backgrounds/night-market/moonlit-forest-run.webp' },
	{ id: 'tea-stall', label: 'Tea stall', src: '/backgrounds/night-market/tea-stall.webp' },
	{ id: 'silver-alley', label: 'Silver alley', src: '/backgrounds/night-market/silver-alley.webp' },
	{ id: 'key-room', label: 'Key room', src: '/backgrounds/night-market/key-room.webp' },
	{ id: 'dawn-clearing', label: 'Dawn clearing', src: '/backgrounds/night-market/dawn-clearing.webp' },
	{ id: 'fortune-teller', label: 'Fortune teller', src: '/backgrounds/night-market/fortune-teller.webp' },
	{ id: 'night-sky', label: 'Night sky', src: '/backgrounds/night-market/night-sky.webp' },
];

export const backgroundIds: ReadonlySet<string> = new Set(backgrounds.map((background) => background.id));

export function getBackground(id: string): Background | undefined {
	return backgrounds.find((background) => background.id === id);
}
