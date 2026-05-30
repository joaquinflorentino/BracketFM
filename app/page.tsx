export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-8">Bracketify</h1>
      <a href="/api/auth/login">
        <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-full">
          Login with Spotify
        </button>
      </a>
    </main>
  )
}