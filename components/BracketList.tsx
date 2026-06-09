'use client'
import { useState } from 'react'
import BracketCard from './BracketCard'

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
	initialBrackets: Bracket[]
}

export default function BracketList({ initialBrackets }: Props) {
	const [brackets, setBrackets] = useState(initialBrackets)

	function handleDelete(id: string) {
		setBrackets(brackets.filter(b => b.id !== id))
	}

	if (brackets.length === 0) {
		return <p className='text-gray-500'>No brackets yet.</p>
	}

	return (
		<div className='flex flex-col gap-6 w-full max-w-xl'>
			{brackets.map((bracket) => (
				<BracketCard key={bracket.id} bracket={bracket} onDelete={handleDelete} />
			))}
		</div>
	)
}