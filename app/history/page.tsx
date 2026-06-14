import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import BracketList from '@/components/BracketList'

export default async function History() {
	const cookieStore = await cookies()
	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() { return cookieStore.getAll() },
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value, options }) =>
						cookieStore.set(name, value, options)
					)
				},
			},
		}
	)

	const { data: { session } } = await supabase.auth.getSession()
	if (!session) redirect('/')

	const { data: brackets } = await supabase
		.from('brackets')
		.select('*')
		.order('created_at', { ascending: false })

	return (
		<main className='min-h-screen flex flex-col px-5 py-8 max-w-2xl mx-auto w-full'>
			<div className='flex items-center gap-4 mb-8'>
				<a href='/'>
					<button className='flex items-center justify-center w-10 h-10 rounded-full border transition-colors hover:bg-white/5' style={{ borderColor: '#222222', color: '#888888' }}>
						‹
					</button>
				</a>
				<div>
					<h1 style={{
						fontFamily: 'var(--font-display)',
						fontSize: '2rem',
						fontWeight: 800,
						letterSpacing: '0.02em',
						color: '#f0f0f0',
						lineHeight: 1,
					}}>
						BRACKET HISTORY
					</h1>
					<p style={{ fontFamily: 'var(--font-inter)', fontSize: '0.8rem', color: '#888888' }}>
						{brackets?.length ?? 0} past tournament{brackets?.length !== 1 ? 's' : ''}
					</p>
				</div>
			</div>

			<BracketList initialBrackets={brackets ?? []} />
		</main>
	)
}