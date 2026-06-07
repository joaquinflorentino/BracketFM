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
    const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
    const [playlistUrl, setPlaylistUrl] = useState('')
    const [mode, setMode] = useState<'artist' | 'playlist'>('artist')

    function startBracket() {
        if (mode == 'artist' && selectedArtist) {
            router.push(`/bracket?artist=${encodeURIComponent(selectedArtist.name)}`)
        }
        else if (mode == 'playlist' && playlistUrl) {
            router.push(`/bracket?playlist=${encodeURIComponent(playlistUrl)}`)
        }
    }

    return (
        <div className='flex flex-col items-center gap-8'>
			<h1 className='text-2xl font-bold'>Start a Bracket</h1>

			<div className='flex gap-4'>
				<button
					onClick={() => setMode('artist')}
					className={`px-4 py-2 rounded ${mode === 'artist' ? 'bg-green-500 text-white' : 'border'}`}
				>
					Pick an Artist
				</button>
				<button
					onClick={() => setMode('playlist')}
					className={`px-4 py-2 rounded ${mode === 'playlist' ? 'bg-green-500 text-white' : 'border'}`}
				>
					Paste a Playlist
				</button>
			</div>

			{mode === 'artist' && (
				<div className='flex flex-col gap-3'>
					{topArtists.map((artist) => (
						<button
							key={artist.id}
							onClick={() => setSelectedArtist(artist)}
							className={`flex items-center gap-3 p-3 rounded-xl border w-64 ${selectedArtist?.id === artist.id ? 'border-green-500' : ''}`}
						>
							{artist.images[0] && (
								<img src={artist.images[0].url} alt={artist.name} className='w-10 h-10 rounded-full' />
							)}
							<span>{artist.name}</span>
						</button>
					))}
				</div>
			)}

			{mode === 'playlist' && (
				<input
					type='text'
					placeholder='Paste Spotify playlist URL...'
					value={playlistUrl}
					onChange={(e) => setPlaylistUrl(e.target.value)}
					className='border rounded-lg px-4 py-2 w-80'
				/>
			)}

			<button
				onClick={startBracket}
				disabled={mode === 'artist' ? !selectedArtist : !playlistUrl}
				className='bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold py-3 px-8 rounded-full'
			>
				Start Bracket
			</button>
		</div>
    )
}