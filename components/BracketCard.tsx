'use client'
import { useState } from 'react'
import { Trophy, Download, Trash2 } from 'lucide-react'

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

function formatDate(dateStr: string) {
	const d = new Date(dateStr)
	return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function truncateSeed(seed: string) {
	return seed.length > 36 ? seed.slice(0, 36) + '…' : seed
}

export default function BracketCard({ bracket, onDelete }: Props) {
	const [deleting, setDeleting] = useState(false)

	const runnerUp = bracket.ranked_songs[bracket.ranked_songs.length - 2]

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
		setDeleting(true)
		setTimeout(async () => {
			await fetch(`/api/brackets/${bracket.id}`, { method: 'DELETE' })
			onDelete(bracket.id)
		}, 300)
	}

    return (
        <div
			className='rounded-2xl border overflow-hidden transition-all duration-300'
			style={{
				background: '#111111',
				borderColor: '#222222',
				opacity: deleting ? 0 : 1,
				transform: deleting ? 'translateX(20px)' : 'none',
			}}
		>
			{/* Champion row */}
			<div className='flex items-center gap-4 p-4'>
				<div className='relative flex-shrink-0'>
					<img
						src={bracket.champion.album.images[0]?.url}
						alt={bracket.champion.name}
						className='w-16 h-16 rounded-xl object-cover'
					/>
					<div className='absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center' style={{ background: '#1db954' }}>
						<Trophy size={10} style={{ color: '#080808' }} />
					</div>
				</div>

				<div className='flex-1 min-w-0'>
					<span style={{
						fontFamily: 'var(--font-inter)',
						fontSize: '0.65rem',
						letterSpacing: '0.12em',
						color: '#1db954',
						fontWeight: 600,
						textTransform: 'uppercase',
					}}>
						Champion
					</span>
					<p style={{
						fontFamily: 'var(--font-inter)',
						fontWeight: 600,
						fontSize: '0.95rem',
						color: '#f0f0f0',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
					}}>
						{bracket.champion.name}
					</p>
					<p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.8rem', color: '#888888' }}>
						{bracket.champion.artists.map((a: any) => a.name).join(', ')}
					</p>
				</div>

				<div className='flex flex-col items-end gap-1 flex-shrink-0'>
					<span
						className='px-2 py-0.5 rounded-full'
						style={{
							fontFamily: 'var(--font-display)',
							fontWeight: 700,
							fontSize: '0.8rem',
							background: 'rgba(29,185,84,0.1)',
							color: '#1db954',
							border: '1px solid rgba(29,185,84,0.2)',
						}}
					>
						{bracket.ranked_songs.length}-song
					</span>
					<span style={{ fontFamily: 'var(--font-inter)', fontSize: '0.7rem', color: '#888888' }}>
						{formatDate(bracket.created_at)}
					</span>
				</div>
			</div>

			{/* Runner-up + seed row */}
			<div className='px-4 py-3 flex items-center gap-3' style={{ borderTop: '1px solid #222222', background: 'rgba(255,255,255,0.02)' }}>
				<div className='flex-1 min-w-0'>
					<p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.7rem', color: '#888888', marginBottom: '1px' }}>
						Runner-up
					</p>
					<p style={{
						fontFamily: 'var(--font-inter)',
						fontSize: '0.8rem',
						color: '#f0f0f0',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
					}}>
						{runnerUp?.name} — {runnerUp?.artists.map((a: any) => a.name).join(', ')}
					</p>
				</div>
				<div className='flex-1 min-w-0 border-l pl-3' style={{ borderColor: '#222222' }}>
					<p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.7rem', color: '#888888', marginBottom: '1px' }}>
						Seed
					</p>
					{bracket.seed.startsWith('https://') ? (
						<a
							href={bracket.seed}
							target='_blank'
							rel='noopener noreferrer'
							style={{
								fontFamily: 'var(--font-inter)',
								fontSize: '0.8rem',
								color: '#1db954',
								textDecoration: 'underline',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
								display: 'block',
							}}
						>
							Open Playlist ↗
						</a>
					) : (
						<p style={{
							fontFamily: 'var(--font-inter)',
							fontSize: '0.8rem',
							color: '#f0f0f0',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
							whiteSpace: 'nowrap',
						}}>
							{bracket.seed}
						</p>
					)}
				</div>
			</div>

			{/* Actions */}
			<div className='flex gap-2 px-4 py-3' style={{ borderTop: '1px solid #222222' }}>
				<button
					onClick={exportPlaylist}
					className='flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all hover:bg-white/5'
					style={{ fontFamily: 'var(--font-inter)', fontWeight: 500, fontSize: '0.8rem', color: '#f0f0f0', borderColor: '#222222' }}
				>
					<Download size={14} />
					Export Playlist
				</button>
				<button
					onClick={deleteBracket}
					className='flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-all hover:bg-red-500/10'
					style={{ fontFamily: 'var(--font-inter)', fontWeight: 500, fontSize: '0.8rem', color: '#888888', borderColor: '#222222' }}
				>
					<Trash2 size={14} />
					Delete
				</button>
			</div>
		</div>
    )
}