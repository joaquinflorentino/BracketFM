import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Bracket from '@/components/Bracket'

export default async function BracketPage({
	searchParams,
}: {
	searchParams: Promise<{ artist?: string; playlist?: string }>
}) {
	const { artist, playlist } = await searchParams

	if (!artist && !playlist) redirect('/dashboard')

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

    let seedArtistNames: string[] = []

    if (artist) {
        seedArtistNames = [artist]
    }
    else if (playlist) {
        const playlistId = playlist.split('/playlist/')[1]?.split('?')[0]
        const playlistRes = await fetch(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`,
			{ headers: { Authorization: `Bearer ${accessToken}` } }
        )
        const playlistData = await playlistRes.json()
        const artistNames = playlistData.items
            ?.flatMap((item: any) => item.track?.artists ?? [])
            ?.map((artist: any) => artist.name)
        seedArtistNames = [...new Set(artistNames)].slice(0, 5) as string[]
    }

    const lastfmResults = await Promise.all(
        seedArtistNames.map((name) =>
            fetch(
                `https://ws.audioscrobbler.com/2.0/?method=artist.getSimilar&artist=${encodeURIComponent(name)}&api_key=${process.env.LASTFM_API_KEY}&format=json&limit=4`
            ).then((res: any) => res.json())
        )
    )
    const similarArtists = lastfmResults
        .flatMap((result: any) => result.similarartists?.artist ?? [])
        .slice(0, 8)

    const spotifySearchResults = await Promise.all(
        similarArtists.map((artist: any) =>
            fetch(
                `https://api.spotify.com/v1/search?q=artist:${encodeURIComponent(artist.name)}&type=track&limit=2`,
				{ headers: { Authorization: `Bearer ${accessToken}` } }
            ).then((res: any) => res.json())
        )
    )
    const bracketSongs = spotifySearchResults
        .flatMap((result: any) => result.tracks?.items ?? [])
        .slice(0, 16)

    return (
        <main className='flex min-h-screen flex-col items-center justify-center'>
			<Bracket songs={bracketSongs} />
		</main>
    )
}