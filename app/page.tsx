import { Music2 } from 'lucide-react'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function Home() {
	const cookieStore = await cookies()
	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() { return cookieStore.getAll() },
				setAll() {},
			},
		}
	)

	const { data: { user } } = await supabase.auth.getUser()

	return (
		<main className='min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden'>
			{/* Background glow */}
			<div
				className='absolute inset-0 pointer-events-none'
				style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 60%, rgba(29,185,84,0.12) 0%, transparent 70%)' }}
			/>

			{/* Music staff lines*/}
			<svg
				className='absolute inset-0 w-full h-full pointer-events-none'
				xmlns='http://www.w3.org/2000/svg'
				viewBox='0 0 1440 1000'
				preserveAspectRatio='none'
				style={{ opacity: 0.065 }}
				aria-hidden='true'
			>
				<defs>
				<filter id='staff-blur'>
					<feGaussianBlur stdDeviation='0.5' />
				</filter>
				</defs>
				{/* 7 staff groups, each 5 lines, spread across the full height */}
				{[0.08, 0.22, 0.36, 0.50, 0.64, 0.78, 0.92].map((yBase, gi) => {
				const lineSpacing = 0.018; // fraction of viewport height between lines
				const amp = [6, 4, 7, 5, 8, 4, 6][gi];
				const freq = [0.008, 0.011, 0.007, 0.013, 0.009, 0.012, 0.008][gi];
				const phase = [0, 0.6, 1.2, 0.3, 0.9, 1.5, 0.4][gi];
				const steps = 80;

				return (
					<g key={gi} filter='url(#staff-blur)'>
					{/* 5 staff lines */}
					{[0, 1, 2, 3, 4].map((li) => {
						const yOffset = (yBase + li * lineSpacing) * 1000;
						const pts = Array.from({ length: steps + 1 }, (_, i) => {
						const x = (i / steps) * 1440;
						const y = yOffset + Math.sin(x * freq + phase + li * 0.3) * amp;
						return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
						}).join(' ');
						return (
						<path
							key={li}
							d={pts}
							stroke='white'
							strokeWidth={li === 2 ? '0.9' : '0.65'}
							fill='none'
							vectorEffect='non-scaling-stroke'
						/>
						);
					})}
					</g>
				);
				})}
			</svg>

			<div className='relative z-10 flex flex-col items-center text-center max-w-md w-full'>
				{/* Logo mark */}
				<div
					className='mb-8 flex items-center justify-center w-20 h-20 rounded-full border border-border'
					style={{ background: 'rgba(29,185,84,0.1)' }}
				>
					<Music2 size={36} className='text-primary' />
				</div>

				{/* App name */}
				<h1 style={{
					fontFamily: 'var(--font-display)',
					fontSize: 'clamp(3rem, 10vw, 5.5rem)',
					fontWeight: 900,
					lineHeight: 1,
					letterSpacing: '-0.02em',
					color: '#f0f0f0',
				}}>
					BRACKET<span className='text-primary'>.FM</span>
				</h1>

				{!user ? (
					<>
						<p className='mt-4 text-muted-foreground' style={{ fontFamily: 'var(--font-inter)', fontSize: '1rem' }}>
							Your Spotify taste seeds the bracket. Unfamiliar songs go head to head, advancing through rounds into a curated playlist built from your rankings.
						</p>

						<a href='/api/auth/login' className='mt-10'>
							<button
								className='flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-primary-foreground transition-all hover:scale-105 active:scale-95'
								style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '1rem' }}
							>
								<svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'>
									<path d='M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z' />
								</svg>
								Login with Spotify
							</button>
						</a>
					</>
				) : (
					<>
						<p className='mt-4 text-muted-foreground' style={{ fontFamily: 'var(--font-inter)', fontSize: '1rem' }}>
							Ready to discover your next favourite song?
						</p>

						<div className='mt-10 flex flex-col gap-4 w-full max-w-xs'>
							<a href='/setup' className='w-full'>
								<button
									className='w-full flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-primary text-primary-foreground transition-all hover:scale-105 active:scale-95'
									style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '1rem' }}
								>
									Start Tournament
								</button>
							</a>

							<a href='/history' className='w-full'>
								<button
									className='w-full flex items-center justify-center gap-3 px-8 py-4 rounded-full border border-border text-foreground transition-all hover:bg-secondary active:scale-95'
									style={{ fontFamily: 'var(--font-inter)', fontWeight: 500, fontSize: '1rem' }}
								>
									View History
								</button>
							</a>
						</div>
					</>
				)}
			</div>

			<p className='absolute bottom-8 text-muted-foreground' style={{ fontFamily: 'var(--font-inter)', fontSize: '0.75rem', letterSpacing: '0.12em' }}>
				POWERED BY SPOTIFY
			</p>
		</main>
	)
}