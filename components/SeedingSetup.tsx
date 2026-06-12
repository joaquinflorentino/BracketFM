'use client'
import { useState } from "react"
import { useRouter } from "next/navigation"

type Artist = {
    id: string
    name: string
    images: { url: string }[]
}

type Props = {
    topArtists: Artist[]
}

export default function SeedingSetup({ topArtists }: Props) {
    const router = useRouter()
    const [selectedArtists, setSelectedArtists] = useState<Artist[]>([])
    const [playlistUrl, setPlaylistUrl] = useState('')
    const [mode, setMode] = useState<'artist' | 'playlist'>('artist')
	const [bracketSize, setBracketSize] = useState(16)

    function startBracket() {
        if (mode == 'artist' && selectedArtists.length > 0) {
            router.push(`/bracket?artist=${encodeURIComponent(selectedArtists.map(a => a.name).join(','))}&size=${bracketSize}`)
        }
        else if (mode == 'playlist' && playlistUrl) {
            router.push(`/bracket?playlist=${encodeURIComponent(playlistUrl)}&size=${bracketSize}`)
        }
    }

	const canStart = mode === 'artist' ? selectedArtists.length > 0 : playlistUrl.trim().length > 0

    return (
		<div className='min-h-screen flex flex-col px-6 py-8 pt-15 pb-15 max-w-2xl mx-auto w-full'>
			{/* Header */}
			<div className='flex items-center gap-4 mb-10'>
				<button
					onClick={() => router.push('/')}
					className='flex items-center justify-center w-10 h-10 rounded-full border transition-colors hover:bg-white/5'
					style={{ borderColor: '#333333', color: '#888888' }}
				>
					‹
				</button>
				<h1 style={{
					fontFamily: 'var(--font-display)',
					fontSize: '2rem',
					fontWeight: 800,
					letterSpacing: '0.02em',
					color: '#f0f0f0',
				}}>
					SEED YOUR BRACKET
				</h1>
			</div>

			{/* Tabs */}
			<div className='flex gap-1 p-1 rounded-xl mb-8' style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #222222' }}>
				{(['artist', 'playlist'] as const).map((tab) => (
					<button
						key={tab}
						onClick={() => setMode(tab)}
						className='flex-1 py-2.5 rounded-lg transition-all'
						style={{
							fontFamily: 'var(--font-inter)',
							fontWeight: 600,
							fontSize: '0.875rem',
							letterSpacing: '0.06em',
							textTransform: 'uppercase',
							background: mode === tab ? '#1db954' : 'transparent',
							color: mode === tab ? '#080808' : '#888888',
						}}
					>
						{tab === 'artist' ? 'Artist Mode' : 'Playlist Mode'}
					</button>
				))}
			</div>

			{/* Artist mode */}
			{mode === 'artist' && (
				<div className='flex-1'>
					<p className='mb-5' style={{ fontFamily: 'var(--font-inter)', fontSize: '0.875rem', color: '#888888' }}>
						Select up to 5 artists from your listening history. Songs from these artists will seed the bracket.
					</p>
					<div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
						{topArtists.map((artist) => {
							const selected = selectedArtists.some(a => a.id === artist.id)
							return (
								<button
									key={artist.id}
									onClick={() => {
										if (selected) {
											setSelectedArtists(selectedArtists.filter(a => a.id !== artist.id))
										} else if (selectedArtists.length < 5) {
											setSelectedArtists([...selectedArtists, artist])
										}
									}}
									className='relative flex flex-col items-center gap-3 p-4 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98]'
									style={{
										background: selected ? 'rgba(29,185,84,0.12)' : '#111111',
										borderColor: selected ? '#1db954' : '#222222',
									}}
								>
									{selected && (
										<div className='absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center' style={{ backgroundColor: '#1db954' }}>
											<span style={{ color: '#080808', fontSize: '0.65rem', fontWeight: 700 }}>✓</span>
										</div>
									)}
									{artist.images[0] && (
										<img
											src={artist.images[0].url}
											alt={artist.name}
											className='w-16 h-16 rounded-full object-cover'
											style={{ border: selected ? '2px solid #1db954' : '2px solid transparent' }}
										/>
									)}
									<div className='text-center'>
										<p style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '0.8rem', color: '#f0f0f0' }}>
											{artist.name}
										</p>
									</div>
								</button>
							)
						})}
					</div>
					<p className='mt-4' style={{ fontFamily: 'var(--font-inter)', fontSize: '0.75rem', color: '#888888' }}>
						{selectedArtists.length}/5 selected
					</p>
				</div>
			)}

			{/* Playlist mode */}
			{mode === 'playlist' && (
				<div className='flex-1'>
					<p className='mb-5' style={{ fontFamily: 'var(--font-inter)', fontSize: '0.875rem', color: '#888888' }}>
						Paste a Spotify playlist URL. Songs from the playlist will be randomly drawn for the bracket.
					</p>
					<div className='relative'>
						<span className='absolute left-4 top-1/2 -translate-y-1/2' style={{ color: '#888888' }}>🔗</span>
						<input
							type='text'
							value={playlistUrl}
							onChange={(e) => setPlaylistUrl(e.target.value)}
							placeholder='https://open.spotify.com/playlist/...'
							className='w-full pl-10 pr-4 py-3.5 rounded-xl border outline-none transition-colors focus:border-green-500'
							style={{
								fontFamily: 'var(--font-inter)',
								fontSize: '0.875rem',
								background: '#111111',
								borderColor: '#222222',
								color: '#f0f0f0',
							}}
						/>
					</div>
				</div>
			)}

			{/* Bracket size */}
			<div className='mt-10'>
				<p className='mb-3' style={{ fontFamily: 'var(--font-inter)', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888888' }}>
					Bracket Size
				</p>
				<div className='flex gap-3'>
					{[8, 16, 32].map((s) => (
						<button
							key={s}
							onClick={() => setBracketSize(s)}
							className='flex-1 py-3 rounded-xl border transition-all hover:scale-[1.02]'
							style={{
								fontFamily: 'var(--font-display)',
								fontWeight: 800,
								fontSize: '1.5rem',
								background: bracketSize === s ? '#1db954' : '#111111',
								borderColor: bracketSize === s ? '#1db954' : '#222222',
								color: bracketSize === s ? '#080808' : '#888888',
							}}
						>
							{s}
						</button>
					))}
				</div>
				<p className='mt-2' style={{ fontFamily: 'var(--font-inter)', fontSize: '0.75rem', color: '#888888' }}>
					{bracketSize} songs · {Math.log2(bracketSize)} rounds · {bracketSize - 1} matchups
				</p>
			</div>

			{/* Start button */}
			<button
				onClick={startBracket}
				disabled={!canStart}
				className='mt-8 w-full py-4 rounded-full transition-all'
				style={{
					fontFamily: 'var(--font-inter)',
					fontWeight: 600,
					fontSize: '1rem',
					background: canStart ? '#1db954' : '#1a1a1a',
					color: canStart ? '#080808' : '#444444',
					cursor: canStart ? 'pointer' : 'not-allowed',
				}}
			>
				Start Bracket →
			</button>
		</div>
	)
}