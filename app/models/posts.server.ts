import { Post } from "@prisma/client"
import { prisma } from "~/db.server"

export type { Post }

export default async function getPosts() {
  return prisma.post.findMany()
}

export async function getPost(slug: string) {
    return prisma.post.findUnique({
        where: {
        slug,
        },
    })
}

export async function createPost(post: Pick<Post ,'title' | 'markdown' | 'slug'>) {
    return prisma.post.create({
        data: post,
    })
}

export async function updatePost(post: Pick<Post, 'title'  | 'markdown' | 'slug'>, slug: string) {
    return prisma.post.update({
        data: post,
        where: {slug},
    })
}

export async function deletePost(slug: string) {
    return prisma.post.delete({
        where: {slug},
    })
}