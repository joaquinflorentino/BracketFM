'use client'

import { useState } from "react"

type Track = {
    id: string
    name: string
    artists: { name: string }[]
    preview_url: string | null
}

type Props = {
    songs: Track[]
}

export default function Bracket({ songs }: Props) {
    const [currentMatchup, setCurrentMatchup] = useState(0)
    const [round, setRound] = useState<Track[]>(songs)
    const [winners, setWinners] = useState<Track[]>([])

    const songA = round[currentMatchup * 2]
    const songB = round[currentMatchup * 2 + 1]

    function pickWinner(winner: Track) {
        const newWinners = [...winners, winner]

        const matchupsInRound = round.length / 2
        const isLastMatchup = currentMatchup + 1 === matchupsInRound

        if (isLastMatchup) {
            if (newWinners.length === 1) {
                alert(`Champion: ${newWinners[0].name}`)
            }
            setCurrentMatchup(0)
            setRound(newWinners)
            setWinners([])
        }
        else {
            setCurrentMatchup(currentMatchup + 1)
            setWinners(newWinners)
        }
    }

    return (
        <div className="flex flex-col items-center gap-8 p-8">
      <p className="text-gray-500">Round matchup {currentMatchup + 1} of {round.length / 2}</p>
      <div className="flex gap-8">
        <button
          onClick={() => pickWinner(songA)}
          className="flex flex-col items-center gap-2 p-6 border rounded-xl hover:bg-gray-100 w-48"
        >
          <p className="font-bold text-center">{songA?.name}</p>
          <p className="text-gray-500 text-sm text-center">{songA?.artists[0].name}</p>
          <span className="text-xs text-gray-400">▶ Play</span>
        </button>

        <div className="flex items-center font-bold text-xl">VS</div>

        <button
          onClick={() => pickWinner(songB)}
          className="flex flex-col items-center gap-2 p-6 border rounded-xl hover:bg-gray-100 w-48"
        >
          <p className="font-bold text-center">{songB?.name}</p>
          <p className="text-gray-500 text-sm text-center">{songB?.artists[0].name}</p>
          <span className="text-xs text-gray-400">▶ Play</span>
        </button>
      </div>
    </div>
    )
}