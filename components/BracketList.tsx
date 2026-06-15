'use client'
import { useState } from 'react'
import { Clock } from 'lucide-react'
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
		return (
			<div className='flex-1 flex flex-col items-center justify-center gap-3 text-center py-20'>
				<Clock size={36} className='text-muted-foreground opacity-40' />
				<p style={{ fontFamily: 'var(--font-inter)', color: 'var(--muted-foreground)', fontSize: '0.95rem' }}>
					No brackets run yet. Start your first tournament!
				</p>
			</div>
		)
	}

	return (
		<div className='flex flex-col gap-4'>
			{brackets.map((bracket) => (
				<BracketCard key={bracket.id} bracket={bracket} onDelete={handleDelete} />
			))}
		</div>
	)
}