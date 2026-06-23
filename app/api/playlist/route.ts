import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
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
	if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

	const accessToken = session.provider_token
	const { tracks } = await request.json()

	const playlistRes = await fetch(`https://api.spotify.com/v1/me/playlists`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			name: 'Bracket.FM Results',
			description: 'Songs ranked by my tournament bracket on Bracket.FM',
			public: true
		})
	})
	const playlist = await playlistRes.json()

	const uris = tracks.map((t: any) => t.uri)
	await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/items`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ uris })
	})

	return NextResponse.json({ playlistUrl: playlist.external_urls.spotify })
}