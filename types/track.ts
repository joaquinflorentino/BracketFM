export type Track = {
	id: string
	name: string
	artists: { name: string }[]
	external_urls: { spotify: string }
	album: {
		name: string
		images: { url: string }[]
	}
	duration_ms: number
	uri: string
}