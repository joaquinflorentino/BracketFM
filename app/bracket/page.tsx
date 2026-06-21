import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Matchup from '@/components/Matchup'

export default async function BracketPage({
	searchParams,
}: {
	searchParams: Promise<{ artist?: string; playlist?: string; size?: number }>
}) {
	const { artist, playlist, size: sizeParam } = await searchParams
    const size = Number(sizeParam) || 16

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
        seedArtistNames = artist.split(',')
    }
    else if (playlist) {
        const playlistId = playlist.split('/playlist/')[1]?.split('?')[0]
        const playlistRes = await fetch(
            `https://api.spotify.com/v1/playlists/${playlistId}/items?limit=50`,
			{ headers: { Authorization: `Bearer ${accessToken}` } }
        )
        const playlistData = await playlistRes.json()

        const shuffledItems = playlistData.items
            ?.filter((item: any) => item.item?.artists)
            .sort(() => Math.random() - 0.5)
            .slice(0, 32)

        const artistNames = shuffledItems
            ?.flatMap((item: any) => item.item?.artists ?? [])
            ?.map((artist: any) => artist.name)

        seedArtistNames = [...new Set(artistNames)].slice(0, 10) as string[]
    }

    const similarArtistsPerSeed = Math.ceil(10 / seedArtistNames.length)

    const lastfmResults = await Promise.all(
        seedArtistNames.map((name) =>
            fetch(
                `https://ws.audioscrobbler.com/2.0/?method=artist.getSimilar&artist=${encodeURIComponent(name)}&api_key=${process.env.LASTFM_API_KEY}&format=json&limit=${similarArtistsPerSeed}`
            ).then((res: any) => res.json())
        )
    )
    const similarArtists = lastfmResults
        .flatMap((result: any) => result.similarartists?.artist ?? [])

    const spotifySearchResults = await Promise.all(
        similarArtists.map((artist: any) =>
            fetch(
                `https://api.spotify.com/v1/search?q=artist:${encodeURIComponent(artist.name)}&type=track&limit=5`,
				{ headers: { Authorization: `Bearer ${accessToken}` } }
            ).then((res: any) => res.json())
        )
    )
    const bracketSongs = spotifySearchResults
        .flatMap((result: any) => result.tracks?.items ?? [])
        .filter(Boolean)

    const uniqueSongs = Array.from(
        new Map(bracketSongs.map((song: any) => [song.id, song])).values()
    )
        
    const shuffled = uniqueSongs.sort(() => Math.random() - 0.5)

    const validSizes = [32, 16, 8]
    const targetSize = bracketSongs.length >= size 
        ? size 
        : validSizes.find(s => bracketSongs.length >= s) ?? 0

    if (targetSize === 0) redirect('/dashboard')

    const finalSongs = shuffled.slice(0, size)

    return (
        <main className='flex min-h-screen flex-col items-center justify-center'>
			<Matchup songs={finalSongs} seed={artist ?? playlist ?? ''} />
		</main>
    )
}