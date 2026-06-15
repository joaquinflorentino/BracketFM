'use client'
import { useState, useEffect, useRef } from 'react'
import { Trophy, Download, Home } from 'lucide-react'
import confetti from 'canvas-confetti'

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

	const firedRef = useRef(false)

	useEffect(() => {
		if (!champion) return
		if (firedRef.current) return
		firedRef.current = true

		const fire = (particleRatio: number, opts: confetti.Options) => {
			confetti({
				origin: { y: 0.7 },
				...opts,
				particleCount: Math.floor(200 * particleRatio),
				colors: ['#1db954', '#ffffff', '#a3ffb4', '#69c97a'],
			})
		}

		setTimeout(() => {
			fire(0.25, { spread: 26, startVelocity: 55 })
			fire(0.2, { spread: 60 })
			fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
			fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
			fire(0.1, { spread: 120, startVelocity: 45 })
		}, 300)
	}, [champion])

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
			<div className='min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden'>
				<div
					className='absolute inset-0 pointer-events-none'
					style={{ background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(29,185,84,0.18) 0%, transparent 70%)' }}
				/>

				<div className='relative z-10 flex flex-col items-center text-center max-w-sm w-full'>
					<div
						className='mb-6 flex items-center justify-center w-20 h-20 rounded-full'
						style={{ background: 'rgba(29,185,84,0.15)', border: '1px solid rgba(29,185,84,0.4)' }}
					>
						<Trophy size={36} className='text-primary' />
					</div>

					<p style={{
						fontFamily: 'var(--font-inter)',
						fontSize: '0.75rem',
						letterSpacing: '0.2em',
						textTransform: 'uppercase',
						color: 'var(--primary)',
						fontWeight: 600,
					}}>
						BRACKET CHAMPION
					</p>

					<div className='mt-6 relative'>
						<div
							className='absolute inset-0 rounded-2xl blur-2xl'
							style={{ background: 'rgba(29,185,84,0.25)', transform: 'scale(0.9) translateY(8px)' }}
						/>
						<img
							src={champion.album.images[0]?.url}
							alt={champion.artists.map((a: any) => a.name).join(', ')}
							className='relative w-52 h-52 rounded-2xl object-cover'
							style={{ border: '2px solid rgba(29,185,84,0.4)' }}
						/>
					</div>

					<h2 className='mt-6' style={{
						fontFamily: 'var(--font-display)',
						fontSize: '2.5rem',
						fontWeight: 900,
						letterSpacing: '0.01em',
						lineHeight: 1.1,
						color: 'var(--foreground)',
					}}>
						{champion.name}
					</h2>
					<p className='mt-1 text-muted-foreground' style={{ fontFamily: 'var(--font-inter)', fontSize: '1rem' }}>
						{champion.artists[0].name}
					</p>

					<div className='mt-10 flex flex-col gap-3 w-full'>
						<button
							onClick={exportPlaylist}
							className='flex items-center justify-center gap-2 py-4 rounded-full bg-primary text-primary-foreground transition-all hover:scale-105 active:scale-95'
							style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '0.95rem' }}
						>
							<Download size={17} />
							Export to Spotify Playlist
						</button>

						<a href='/' className='w-full'>
							<button
								className='w-full flex items-center justify-center gap-2 py-4 rounded-full border border-border text-foreground transition-all hover:bg-secondary active:scale-95'
								style={{ fontFamily: 'var(--font-inter)', fontWeight: 500, fontSize: '0.95rem' }}
							>
								<Home size={17} />
								Back to Home
							</button>
						</a>
					</div>
				</div>
			</div>
		)
	}

	return (
			<div className='min-h-screen flex flex-col px-5 py-8 max-w-2xl mx-auto w-full'>
			{/* Progress bar */}
			<div className='mb-2'>
				<div className='h-1 w-full rounded-full' style={{ background: 'var(--secondary)' }}>
					<div
						className='h-1 rounded-full transition-all duration-500'
						style={{ width: `${progress}%`, background: 'var(--primary)' }}
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
						color: 'var(--foreground)',
					}}>
						ROUND {currentRound} <span className='text-muted-foreground' style={{ fontWeight: 700, fontSize: '1.2rem' }}>OF {totalRounds}</span>
					</p>
					<p style={{
						fontFamily: 'var(--font-inter)',
						fontSize: '0.8rem',
						color: 'var(--muted-foreground)',
						letterSpacing: '0.08em',
						textTransform: 'uppercase',
					}}>
						Match {currentMatchup + 1} of {round.length / 2}
					</p>
				</div>
			</div>

			{/* VS divider */}
			<div className='flex items-center gap-4 mb-4'>
				<div className='flex-1 h-px' style={{ background: 'var(--border)' }} />
				<span style={{
					fontFamily: 'var(--font-display)',
					fontWeight: 900,
					fontSize: '1.25rem',
					letterSpacing: '0.1em',
					color: 'var(--muted-foreground)',
				}}>
					VS
				</span>
				<div className='flex-1 h-px' style={{ background: 'var(--border)' }} />
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
								background: isChosen ? 'rgba(29,185,84,0.12)' : isRejected ? 'rgba(255,255,255,0.02)' : 'var(--card)',
								borderColor: isChosen ? 'var(--primary)' : isRejected ? 'rgba(255,255,255,0.04)' : 'var(--border)',
								opacity: isRejected ? 0.4 : 1,
								transform: isChosen ? 'scale(1.02)' : 'scale(1)',
							}}
						>
							{/* Album art */}
							<div className='relative w-full aspect-square overflow-hidden group'>
								<a
									href={song.external_urls.spotify}
									target='_blank'
									rel='noopener noreferrer'
									onClick={(e) => e.stopPropagation()}
									className='block w-full h-full'
								>
									<img
										src={song.album.images[0]?.url}
										alt={song.name}
										className='w-full h-full object-cover transition-opacity group-hover:opacity-50'
									/>
									<div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
										<span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.85rem', color: '#ffffff', fontWeight: 600 }}>
											▶ Listen on Spotify
										</span>
									</div>
								</a>
								{isChosen && (
									<div className='absolute inset-0 flex items-center justify-center' style={{ background: 'rgba(29,185,84,0.3)' }}>
										<div className='w-14 h-14 rounded-full flex items-center justify-center' style={{ background: 'var(--primary)' }}>
											<svg width='24' height='24' viewBox='0 0 24 24' fill='var(--primary-foreground)'>
												<path d='M20 6L9 17l-5-5' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' fill='none' />
											</svg>
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
									color: 'var(--foreground)',
									whiteSpace: 'nowrap',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
								}}>
									{song.name}
								</p>
								<p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
									{song.artists.map((a: any) => a.name).join(', ')}
								</p>
							</div>

							{/* Listen + Choose buttons */}
							<div className='px-4 pb-4 mt-auto flex flex-col gap-4'>
								<a
									href={song.external_urls.spotify}
									target='_blank'
									rel='noopener noreferrer'
									onClick={(e) => e.stopPropagation()}
								>
									<button
										className='w-full py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.97]'
										style={{
											fontFamily: 'var(--font-inter)',
											fontWeight: 600,
											fontSize: '0.875rem',
											background: 'var(--secondary)',
											color: 'var(--foreground)',
											border: '1px solid var(--border)',
										}}
									>
										▶ Listen on Spotify
									</button>
								</a>
								<button
									onClick={() => handleChoose(song, side)}
									className='w-full py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.97]'
									style={{
										fontFamily: 'var(--font-inter)',
										fontWeight: 600,
										fontSize: '0.875rem',
										background: isChosen ? 'var(--primary)' : 'var(--secondary)',
										color: isChosen ? 'var(--primary-foreground)' : 'var(--foreground)',
										border: isChosen ? 'none' : '1px solid var(--border)',
									}}
								>
									{isChosen ? '✓ Chosen' : 'Choose This Song'}
								</button>
							</div>
						</div>
					)
				})}
			</div>
			
			<div
				className='mt-6 text-center text-muted-foreground'
				style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem' }}
			>
				<br/>
			</div>
		</div>
	)
}