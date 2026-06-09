'use client'

type Track = {
	id: string
	name: string
	artists: { name: string }[]
	external_urls: { spotify: string }
	album: { images: { url: string }[] }
	uri: string
}

type Bracket = {
	id: string
	champion: Track
	ranked_songs: Track[]
	seed: string
	created_at: string
}

type Props = {
    bracket: Bracket
    onDelete: (id: string) => void
}

export default function BracketCard({ bracket, onDelete }: Props) {
    async function exportPlaylist() {
        const response = await fetch('/api/playlist', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ tracks: bracket.ranked_songs.slice().reverse() })
		})
		const data = await response.json()
		window.open(data.playlistUrl, '_blank')
    }

    async function deleteBracket() {
        await fetch(`/api/brackets/${bracket.id}`, { method: 'DELETE' })
        onDelete(bracket.id)
    }

    return (
        <div className='border rounded-xl p-4 flex items-center gap-4'>
			<img
				src={bracket.champion.album.images[0]?.url}
				alt={bracket.champion.name}
				className='w-16 h-16 rounded-lg'
			/>
			<div className='flex-1'>
				<p className='font-bold'>{bracket.champion.name}</p>
				<p className='text-gray-500 text-sm'>{bracket.champion.artists[0].name}</p>
				<p className='text-gray-400 text-xs mt-1'>Seed: {bracket.seed}</p>
				<p className='text-gray-400 text-xs'>{new Date(bracket.created_at).toISOString().split('T')[0]}</p>
			</div>
			<div className='flex flex-col gap-2'>
				<button
					onClick={exportPlaylist}
					className='bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-3 rounded-full'
				>
					Export
				</button>
				<button
					onClick={deleteBracket}
					className='border text-xs py-1 px-3 rounded-full hover:bg-gray-100'
				>
					Delete
				</button>
			</div>
		</div>
    )
}