import { marked } from "marked";
import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getPost } from "~/models/posts.server";
import invariant from "tiny-invariant";

type LoaderData = {
  title: string;
  html: string;
};

export const loader: LoaderFunction = async ({ params }) => {
  const { slug } = params;
  invariant(slug, "slug is required");
  const post = await getPost(slug);

  invariant(post, `post is required: ${slug}`);
  return json<LoaderData>({ title: post.title, html: marked(post.markdown) });
};

export default function PostItem() {
  const { title, html } = useLoaderData() as LoaderData;
  return (
    <main>
      <h1>{title}</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
