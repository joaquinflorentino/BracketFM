import type { Metadata } from 'next'
import './globals.css'
import { Barlow_Condensed, Inter } from 'next/font/google'

const barlowCondensed = Barlow_Condensed({
	weight: ['900'],
	variable: '--font-display',
	subsets: ['latin'],
})

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'Bracket.FM',
	description: 'Discover music through tournament brackets',
	icons: {
		icon: '/favicon.ico',
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='en' className={`${barlowCondensed.variable} ${inter.variable} h-full antialiased`}>
			<body className='min-h-full flex flex-col'>{children}</body>
		</html>
	)
}