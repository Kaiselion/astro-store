import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'
import { db, eq, ProductImage } from 'astro:db'
import { getSession } from 'auth-astro/server'
import { ImageUpload } from '@/utils/image-upload'

export const deleteProductImage = defineAction({
	accept: 'json',
	input: z.string(),
	handler: async (imageId, { request }) => {
		const session = await getSession(request)
		const user = session?.user

		if (!user) {
			throw new Error('User not authenticated')
		}

		const [productImage] = await db
			.select()
			.from(ProductImage)
			.where(eq(ProductImage.id, imageId))

		if (!productImage) {
			throw new Error(`Image with id ${imageId} not found`)
		}

		const deleted = await db
			.delete(ProductImage)
			.where(eq(ProductImage.id, imageId))

		if (productImage.image.includes('http')) {
			await ImageUpload.delete(productImage.image)
		}

		return { ok: true }
	}
})
