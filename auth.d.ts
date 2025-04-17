import { DefaultSession, DefaultUser } from '@auth/core/types'

declare module '@auth/core/types' {
	interface User extends Defaultuser {
		role?: string
	}

	interface Session extends DefaultSession {
		user: User
	}
}
