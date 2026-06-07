import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Bracket from '@/components/Bracket'

export default async function Dashboard() {
	const cookieStore = await cookies()
	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll()
				},
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

	const accessToken = session.provider_token

	const artistsResponse = await fetch(`https://api.spotify.com/v1/me/top/artists?limit=5`, {
		headers: { Authorization: `Bearer ${accessToken}`}
	})
	const topArtists = await artistsResponse.json()
	const topArtistName = topArtists.items[0].name

	const lastfmResponse = await fetch(
		`https://ws.audioscrobbler.com/2.0/?method=artist.getSimilar&artist=${encodeURIComponent(topArtistName)}&api_key=${process.env.LASTFM_API_KEY}&format=json&limit=8`
	)

	const lastfmData = await lastfmResponse.json();
	const similarArtists = lastfmData.similarartists?.artist ?? []

	const spotifySearchResults = await Promise.all(
		similarArtists.map((artist: any) =>
			fetch(
				`https://api.spotify.com/v1/search?q=artist:${encodeURIComponent(artist.name)}&type=track&limit=3`,
				{ headers: { Authorization: `Bearer ${accessToken}` } }
			).then((res: any) => res.json())
		)
	)
	const bracketSongs = await spotifySearchResults
		.flatMap((result: any) => result.tracks?.items ?? [])
		.slice(0, 16)

	return (
		<main className="flex min-h-screen flex-col items-center justify-center">
			<h1 className="text-2xl font-bold mb-8">Bracketify</h1>
			<Bracket songs={bracketSongs} />
		</main>
	)
}