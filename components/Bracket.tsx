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

	async function exportPlaylist() {
		const response = await fetch('/api/playlist', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ 'tracks': rankedSongs.slice().reverse() })
		})
		const data = await response.json()
		window.open(data.playlistUrl, '_blank')
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

	async function saveBracket(champion: Track, rankedSongs: Track[], seed: string) {
		await fetch('/api/brackets', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ champion, rankedSongs, seed })
		})
	}

	return (
		<div className="flex flex-col items-center gap-8 p-8">
			<p className="text-gray-500">Round matchup {currentMatchup + 1} of {round.length / 2}</p>
			<div className="flex gap-8">
				<button
					onClick={() => pickWinner(songA)}
					className="flex flex-col items-center gap-2 p-6 border rounded-xl hover:bg-gray-100 w-48"
				>
					<p className="font-bold text-center">{songA?.name}</p>
					<p className="text-gray-500 text-sm text-center">{songA?.artists[0].name}</p>
					<a
						href={songA.external_urls.spotify}
						target="_blank"
						rel="noopener noreferrer"
						onClick={(e) => e.stopPropagation()}
					>
						<img
							src={songA.album.images[0]?.url}
							alt={songA.name}
							className="w-24 h-24 rounded-lg"
						/>
					</a>
				</button>

				<div className="flex items-center font-bold text-xl">VS</div>

				<button
					onClick={() => pickWinner(songB)}
					className="flex flex-col items-center gap-2 p-6 border rounded-xl hover:bg-gray-100 w-48"
				>
					<p className="font-bold text-center">{songB?.name}</p>
					<p className="text-gray-500 text-sm text-center">{songB?.artists[0].name}</p>
					<a
						href={songB.external_urls.spotify}
						target="_blank"
						rel="noopener noreferrer"
						onClick={(e) => e.stopPropagation()}
					>
						<img
							src={songB.album.images[0]?.url}
							alt={songB.name}
							className="w-24 h-24 rounded-lg"
						/>
					</a>
				</button>
			</div>
		</div>
	)
}