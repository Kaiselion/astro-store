// @ts-check
import { defineConfig } from 'astro/config'

import tailwindcss from '@tailwindcss/vite'

import netlify from '@astrojs/netlify'
// import auth from 'auth-astro'

import db from '@astrojs/db'

import react from '@astrojs/react'

import auth from 'auth-astro'

// https://astro.build/config
export default defineConfig({
	integrations: [db(), react(), auth()],
	vite: {
		plugins: [tailwindcss()]
	},
	output: 'server',
	adapter: netlify()
})
