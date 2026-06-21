'use client'
import { useState } from 'react'
import type { Track } from '@/types/track'
import ChampionCard from './ChampionCard'
import SongMatchupCard from './SongMatchupCard'
import { exportPlaylist } from '@/lib/playlist'

type Props = {
	songs: Track[]
	seed: string
}

export default function Matchup({ songs, seed }: Props) {
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

		const loser = (songA === winner) ? songB : songA
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

	async function saveBracket(champion: Track, rankedSongs: Track[], seed: string) {
		await fetch('/api/brackets', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ champion, rankedSongs, seed })
		})
	}

	if (champion) {
		return <ChampionCard champion={champion} onExport={() => exportPlaylist(rankedSongs)} />
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
				].map(({ song, side }) => (
					<SongMatchupCard
						key={song.id}
						song={song}
						side={side}
						isChosen={chosen === side}
						isRejected={chosen !== null && chosen !== side}
						onChoose={handleChoose}
					/>
				))}
			</div>

			<div
				className='mt-6 text-center text-muted-foreground'
				style={{ fontFamily: 'var(--font-inter)', fontSize: '0.75rem' }}
			>
				<br/>
			</div>
		</div>
	)
}