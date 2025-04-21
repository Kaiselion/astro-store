import { defineConfig } from 'auth-astro'
import Credentials from '@auth/core/providers/credentials'
import { db, eq, User } from 'astro:db'
import bcrypt from 'bcryptjs'
import type { AdapterUser } from '@auth/core/adapters'
import Google from '@auth/core/providers/google'
import { randomUUID } from 'crypto'

export default defineConfig({
	providers: [
		Google({
			clientId: import.meta.env.GOOGLE_CLIENT_ID,
			clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET
		}),
		Credentials({
			credentials: {
				email: { label: 'Correo', type: 'email' },
				password: { label: 'Contraseña', type: 'password' }
			},
			authorize: async ({ email, password }) => {
				const [user] = await db
					.select()
					.from(User)
					.where(eq(User.email, `${email}`))

				if (!user) {
					throw new Error('User not found')
				}

				if (!bcrypt.compareSync(password as string, user.password)) {
					throw new Error('Invalid password')
				}

				const { password: _, ...rest } = user

				console.log(rest)
				return rest
			}
		})
	],

	callbacks: {
		jwt: ({ token, user }) => {
			if (user) {
				token.user = user
			}

			return token
		},
		async signIn({ user, account }) {
			// Si el usuario se autentica con Google
			if (account?.provider === 'google') {
				try {
					// Buscar si el usuario ya existe en la base de datos
					const [existingUser] = await db
						.select()
						.from(User)
						.where(eq(User.email, user.email!))

					if (existingUser) {
						// Si existe, mantén su rol actual
						user.role = existingUser.role
					} else {
						// Si es un usuario nuevo, crear registro con rol predeterminado
						await db.insert(User).values({
							id: user.id,
							email: user.email!,
							name: user.name!,
							role: 'user',
							password: `google_auth_${randomUUID()}` // rol predeterminado para nuevos usuarios
							// otros campos que necesites
						})

						// Asignar rol al objeto user para esta sesión
						user.role = 'user'
					}
				} catch (error) {
					console.error('Error al procesar usuario de Google:', error)
					return false // rechaza el inicio de sesión si hay un error
				}
			}
			return true
		},

		session: ({ session, token }) => {
			session.user = token.user as AdapterUser
			return session
		}
	}
})
