import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

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
		<main className='flex min-h-screen flex-col items-center p-8'>
			<h1 className='text-2xl font-bold mb-8'>Past Brackets</h1>
			{brackets?.length === 0 && (
				<p className='text-gray-500'>No brackets yet.</p>
			)}
			<div className='flex flex-col gap-6 w-full max-w-xl'>
				{brackets?.map((bracket) => (
					<div key={bracket.id} className='border rounded-xl p-4 flex items-center gap-4'>
						<img
							src={bracket.champion.album.images[0]?.url}
							alt={bracket.champion.name}
							className='w-16 h-16 rounded-lg'
						/>
						<div className='flex-1'>
							<p className='font-bold'>{bracket.champion.name}</p>
							<p className='text-gray-500 text-sm'>{bracket.champion.artists[0].name}</p>
							<p className='text-gray-400 text-xs mt-1'>Seed: {bracket.seed}</p>
							<p className='text-gray-400 text-xs'>{new Date(bracket.created_at).toLocaleDateString()}</p>
						</div>
					</div>
				))}
			</div>
		</main>
	)
}