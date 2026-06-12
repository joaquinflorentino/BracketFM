'use client'
import { useState } from "react"

type Track = {
	id: string
	name: string
	artists: { name: string }[]
	external_urls: { spotify: string }
	album: {
		images: { url: string }[]
	}
	uri: string
}

type Props = {
	songs: Track[]
	seed: string
}

export default function Bracket( { songs, seed }: Props) {
	const [currentMatchup, setCurrentMatchup] = useState(0)
	const [round, setRound] = useState<Track[]>(songs)
	const [winners, setWinners] = useState<Track[]>([])
	const [champion, setChampion] = useState<Track | null>(null)
	const [rankedSongs, setRankedSongs] = useState<Track[]>([])
	const [chosen, setChosen] = useState<'a' | 'b' | null>(null)

	const totalRounds = Math.log2(songs.length)
	const currentRound = Math.floor(Math.log2(songs.length / round.length)) + 1
	const totalMatchups = songs.length - 1
	const completedMatchups = rankedSongs.length
	const progress = (completedMatchups / totalMatchups) * 100

	const songA = round[currentMatchup * 2]
	const songB = round[currentMatchup * 2 + 1]

	function pickWinner(winner: Track) {
		const newWinners = [...winners, winner]
		const matchupsInRound = round.length / 2
		const isLastMatchup = currentMatchup + 1 === matchupsInRound

		const loser = (songA == winner) ? songB : songA
		if (isLastMatchup && newWinners.length === 1) {
			const finalRanked = [...rankedSongs, loser, newWinners[0]]
			setRankedSongs(finalRanked)
			setChampion(newWinners[0])
			saveBracket(newWinners[0], finalRanked, seed)
			return
		}
		setRankedSongs([...rankedSongs, loser])

		if (isLastMatchup) {
			setCurrentMatchup(0)
			setRound(newWinners)
			setWinners([])
		}
		else {
			setCurrentMatchup(currentMatchup + 1)
			setWinners(newWinners)
		}
	}

	function handleChoose(winner: Track, side: 'a' | 'b') {
		if (chosen) return
		setChosen(side)
		setTimeout(() => {
			pickWinner(winner)
			setChosen(null)
		}, 800)
	}

	async function exportPlaylist() {
		const response = await fetch('/api/playlist', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ 'tracks': rankedSongs.slice().reverse() })
		})
		const data = await response.json()
		window.open(data.playlistUrl, '_blank')
	}

	async function saveBracket(champion: Track, rankedSongs: Track[], seed: string) {
		await fetch('/api/brackets', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ champion, rankedSongs, seed })
		})
	}

	if (champion) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen gap-6">
				<p className="text-gray-500 uppercase tracking-widest text-sm">Champion</p>
				<img
					src={champion.album.images[0]?.url}
					alt={champion.name}
					className="w-48 h-48 rounded-xl"
				/>
				<div className="text-center">
					<p className="text-2xl font-bold">{champion.name}</p>
					<p className="text-gray-500">{champion.artists[0].name}</p>
				</div>
				<a
					href={champion.external_urls.spotify}
					target="_blank"
					rel="noopener noreferrer"
					className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full"
				>
					Open in Spotify
				</a>
				<button
					onClick={exportPlaylist}
					className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full"
				>
					Export as Spotify Playlist
				</button>
			</div>
		)
	}

	return (
		<>
			<div className='min-h-screen flex flex-col px-5 py-8 max-w-2xl mx-auto w-full'>
			{/* Progress bar */}
			<div className='mb-2'>
				<div className='h-1 w-full rounded-full' style={{ background: '#1a1a1a' }}>
					<div
						className='h-1 rounded-full transition-all duration-500'
						style={{ width: `${progress}%`, background: '#1db954' }}
					/>
				</div>
			</div>

			{/* Round + match labels */}
			<div className='flex items-center justify-between mb-8'>
				<div>
					<p style={{
						fontFamily: 'var(--font-display)',
						fontWeight: 900,
						fontSize: '2rem',
						letterSpacing: '0.02em',
						lineHeight: 1,
						color: '#f0f0f0',
					}}>
						ROUND {currentRound} <span style={{ fontWeight: 700, fontSize: '1.2rem', color: '#888888' }}>OF {totalRounds}</span>
					</p>
					<p style={{
						fontFamily: 'var(--font-inter)',
						fontSize: '0.8rem',
						color: '#888888',
						letterSpacing: '0.08em',
						textTransform: 'uppercase',
					}}>
						Match {currentMatchup + 1} of {round.length / 2}
					</p>
				</div>
				<div
					className='flex items-center gap-2 px-3 py-1.5 rounded-full'
					style={{ background: 'rgba(29,185,84,0.1)', border: '1px solid rgba(29,185,84,0.2)' }}
				>
					<span style={{ color: '#1db954', fontSize: '0.7rem' }}>♪</span>
					<span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.75rem', color: '#1db954', fontWeight: 600 }}>
						LIVE
					</span>
				</div>
			</div>

			{/* VS divider */}
			<div className='flex items-center gap-4 mb-4'>
				<div className='flex-1 h-px' style={{ background: '#222222' }} />
				<span style={{
					fontFamily: 'var(--font-display)',
					fontWeight: 900,
					fontSize: '1.25rem',
					letterSpacing: '0.1em',
					color: '#888888',
				}}>
					VS
				</span>
				<div className='flex-1 h-px' style={{ background: '#222222' }} />
			</div>

			{/* Song cards */}
			<div className='flex gap-4 flex-1'>
				{[
					{ song: songA, side: 'a' as const },
					{ song: songB, side: 'b' as const },
				].map(({ song, side }) => {
					const isChosen = chosen === side
					const isRejected = chosen !== null && chosen !== side
					return (
						<div
							key={song.id}
							className='flex-1 flex flex-col rounded-2xl border overflow-hidden transition-all duration-300'
							style={{
								background: isChosen ? 'rgba(29,185,84,0.12)' : isRejected ? 'rgba(255,255,255,0.02)' : '#111111',
								borderColor: isChosen ? '#1db954' : isRejected ? 'rgba(255,255,255,0.04)' : '#222222',
								opacity: isRejected ? 0.4 : 1,
								transform: isChosen ? 'scale(1.02)' : 'scale(1)',
							}}
						>
							{/* Album art */}
							<div className='relative w-full aspect-square overflow-hidden'>
								<a
									href={song.external_urls.spotify}
									target='_blank'
									rel='noopener noreferrer'
									onClick={(e) => e.stopPropagation()}
								>
									<img
										src={song.album.images[0]?.url}
										alt={song.name}
										className='w-full h-full object-cover'
									/>
								</a>
								{isChosen && (
									<div className='absolute inset-0 flex items-center justify-center' style={{ background: 'rgba(29,185,84,0.3)' }}>
										<div className='w-14 h-14 rounded-full flex items-center justify-center' style={{ background: '#1db954' }}>
											<span style={{ color: '#080808', fontSize: '1.5rem' }}>✓</span>
										</div>
									</div>
								)}
							</div>

							{/* Song info */}
							<div className='p-4 flex flex-col gap-1'>
								<p style={{
									fontFamily: 'var(--font-inter)',
									fontWeight: 600,
									fontSize: '0.95rem',
									color: '#f0f0f0',
									whiteSpace: 'nowrap',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
								}}>
									{song.name}
								</p>
								<p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.8rem', color: '#888888' }}>
									{song.artists[0].name}
								</p>
							</div>

							{/* Choose button */}
							<div className='px-4 pb-4 mt-auto'>
								<button
									onClick={() => handleChoose(song, side)}
									className='w-full py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.97]'
									style={{
										fontFamily: 'var(--font-inter)',
										fontWeight: 600,
										fontSize: '0.875rem',
										background: isChosen ? '#1db954' : '#1a1a1a',
										color: isChosen ? '#080808' : '#f0f0f0',
										border: isChosen ? 'none' : '1px solid #222222',
									}}
								>
									{isChosen ? '✓ Chosen' : 'Choose This Song'}
								</button>
							</div>
						</div>
					)
				})}
			</div>

			<p className='mt-6 text-center' style={{ fontFamily: 'var(--font-inter)', fontSize: '0.75rem', color: '#888888' }}>
				Pick the song you'd rather discover — not the one you already know.
			</p>
		</div>
	</>
	)
}