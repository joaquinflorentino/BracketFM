'use client'
import { useEffect, useRef } from 'react'
import { Trophy, Download, Home } from 'lucide-react'
import confetti from 'canvas-confetti'
import type { Track } from '@/types/track'

type Props = {
	champion: Track
	onExport: () => void
}

export default function ChampionCard({ champion, onExport }: Props) {
	const firedRef = useRef(false)

	useEffect(() => {
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
	}, [])

	return (
		<div className='w-full min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden'>
			<div
				className='fixed inset-0 pointer-events-none'
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
						alt={champion.artists.map((a) => a.name).join(', ')}
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
				<p
					className='mt-0.5'
					style={{ fontFamily: 'var(--font-inter)', fontSize: '0.8rem', color: 'var(--muted-foreground)', opacity: 0.7 }}
				>
					{champion.album.name}
				</p>

				<div className='mt-10 flex flex-col gap-3 w-full'>
					<button
						onClick={onExport}
						className='w-full flex items-center justify-center gap-2 py-4 rounded-full bg-primary text-primary-foreground transition-all hover:scale-105 active:scale-95'
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