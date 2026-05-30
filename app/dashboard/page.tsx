import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

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

  const artistsResponse = await fetch('https://api.spotify.com/v1/me/top/artists?limit=5', {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

  const topArtists = await artistsResponse.json();
  const topArtistName = topArtists.items[0].name;

  const lastfmResponse = await fetch(
    `https://ws.audioscrobbler.com/2.0/?method=artist.getSimilar&artist=${encodeURIComponent(topArtistName)}&api_key=${process.env.LASTFM_API_KEY}&format=json&limit=5`
  )

  const lastfmData = await lastfmResponse.json();
  const similarArtists = lastfmData.similarartists?.artist ?? [];

  return (
  <main className="flex min-h-screen flex-col items-center justify-center gap-8">
    <section>
      <h2 className='text-xl font-bold mb-4'>Top Artists</h2>
      {topArtists.items?.map((artist: any) => (
        <div key={artist.id} className='mb-2'>
            <p className='font-semibold'>{artist.name}</p>
        </div>
      ))}
    </section>
    <section>
        <h2 className='text-xl font-bold mb-4'>Similar Artists to {topArtistName}</h2>
        {similarArtists.map((artist: any) => (
            <div key={artist.name} className='mb-2'>
                <p className='font-semibold'>{artist.name}</p>
            </div>
        ))}
    </section>
  </main>
    )
}