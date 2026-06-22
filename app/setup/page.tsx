import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import SeedingSetup from '@/components/SeedingSetup'

export default async function Dashboard() {
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

	const { data: { session } } = await supabase.auth.getSession()

	if (!session || !session.provider_token) {
		await supabase.auth.signOut()
		redirect('/')
	}

	const accessToken = session.provider_token

	const artistsResponse = await fetch(`https://api.spotify.com/v1/me/top/artists?limit=6`, {
		headers: { Authorization: `Bearer ${accessToken}`}
	})
	const topArtists = await artistsResponse.json()

	return (
		<main className='flex min-h-screen flex-col items-center justify-center'>
			<SeedingSetup topArtists={topArtists.items} />
		</main>
	)
}