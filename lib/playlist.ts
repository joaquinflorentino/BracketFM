import type { Track } from '@/types/track'

export async function exportPlaylist(tracks: Track[]) {
	const response = await fetch('/api/playlist', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ tracks: tracks.slice().reverse() })
	})
	const data = await response.json()
	window.open(data.playlistUrl, '_blank')
}