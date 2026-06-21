import type { Track } from './track'

export type Bracket = {
	id: string
	champion: Track
	ranked_songs: Track[]
	seed: string
	created_at: string
}