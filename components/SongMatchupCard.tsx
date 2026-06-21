'use client'
import type { Track } from '@/types/track'
import { formatDuration } from '@/lib/format'

type Props = {
	song: Track
	side: 'a' | 'b'
	isChosen: boolean
	isRejected: boolean
	onChoose: (song: Track, side: 'a' | 'b') => void
}

export default function SongMatchupCard({ song, side, isChosen, isRejected, onChoose }: Props) {
	return (
		<div
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
					{song.artists.map((a) => a.name).join(', ')}
				</p>
				<p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.75rem', color: 'var(--muted-foreground)', opacity: 0.7 }}>
					{song.album?.name} • {formatDuration(song.duration_ms)}
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
					onClick={() => onChoose(song, side)}
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
}