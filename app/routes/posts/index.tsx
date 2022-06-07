import { json, LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import getPosts from "~/models/posts.server";
import { useOptionAdminUser } from "~/utils";

type Iposts = {
  slug: string;
  title: string;
  content: string;
};

type LoaderData = {
  posts: Awaited<ReturnType<typeof getPosts>>;
};

export const loader: LoaderFunction = async () => {
  const posts = await getPosts();
  return json<LoaderData>({ posts });
};

export default function PostsIndex() {
  const { posts } = useLoaderData() as LoaderData;
  const isAdminUser = useOptionAdminUser();
  return (
    <main>
      <h1>Posts</h1>
      {isAdminUser && (
        <Link to="admin" className="text-red-600 underline">
          Admin
        </Link>
      )}
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              to={post.slug}
              prefetch="intent"
              className="text-blue-600 underline"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
