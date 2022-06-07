import {
  Form,
  useActionData,
  useCatch,
  useLoaderData,
  useParams,
  useTransition,
} from "@remix-run/react";
import {
  ActionFunction,
  redirect,
  json,
  LoaderFunction,
} from "@remix-run/node";
import {
  createPost,
  deletePost,
  getPost,
  updatePost,
  Post,
} from "~/models/posts.server";
import invariant from "tiny-invariant";

const inputClassname = "w-full rounded border border-gray px-2 py-1";

type ActionData = {
  title: null | string;
  markdown: null | string;
  slug: null | string;
};

type LoaderData = { post?: Post };

export const loader: LoaderFunction = async ({ params }) => {
  const { slug } = params;
  invariant(slug, "slug is required");
  if (slug === "create") {
    return json<LoaderData>({});
  }
  const post = await getPost(slug);
  if (!post) {
    throw new Response("Not Found", {
      status: 404,
    });
  }
  return json<LoaderData>({
    post,
  });
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();

  const intent = formData.get("intent");
  invariant(params.slug, "slug is required");

  if (intent === "delete") {
    await deletePost(params.slug);
    return redirect("/posts/admin");
  }

  const title = formData.get("title");
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");

  const errors: ActionData = {
    title: title ? null : "Title is required",
    slug: slug ? null : "Slug is required",
    markdown: markdown ? null : "Markdown is required",
  };

  const hasErrors = Object.values(errors).some(
    (errorMessage) => errorMessage !== null
  );

  if (hasErrors) {
    return json<ActionData>(errors);
  }

  console.log("----------------", "hello from action loader");

  invariant(typeof title === "string", "title must be string");
  invariant(typeof slug === "string", "slug must be string");
  invariant(typeof markdown === "string", "markdown must be string");

  if (params.slug === "create") {
    await createPost({ title, slug, markdown });
  } else {
    await updatePost({ title, markdown, slug }, params.slug);
  }
  return redirect("/posts/admin");
};

export default function AdminCreateRoute() {
  const errors = useActionData();
  const data = useLoaderData() as LoaderData;
  const { post } = data;
  const isNewPost = !data.post;
  const transition = useTransition();
  const isCreating =
    transition.submission?.formData?.get("intent") === "create";
  const isUpdating =
    transition.submission?.formData?.get("intent") === "update";
  const isDeleting =
    transition.submission?.formData?.get("intent") === "delete";
  return (
    <Form method="post">
      <p>
        <label>
          Post title:{" "}
          {errors?.title && <em className="text-red-600">{errors.title}</em>}
          <input
            type="text"
            name="title"
            className={inputClassname}
            defaultValue={post?.title}
          />
        </label>
      </p>
      <p>
        <label>
          Post slug:{" "}
          {errors?.slug && <em className="text-red-600">{errors.slug}</em>}
          <input
            type="text"
            name="slug"
            className={inputClassname}
            defaultValue={post?.slug}
          />
        </label>
      </p>
      <p>
        <label>
          Markdown:{" "}
          {errors?.markdown && (
            <em className="text-red-600">{errors.markdown}</em>
          )}
        </label>
        <textarea
          id="markdown"
          rows={10}
          name="markdown"
          className={inputClassname}
          defaultValue={post?.markdown}
        />
      </p>
      <div className="flex justify-end gap-4">
        {!isNewPost && (
          <button
            type="submit"
            className="rounded bg-red-500 py-2 px-4 text-white"
            disabled={isDeleting}
            value="delete"
            name="intent"
          >
            {isDeleting ? "Deleting..." : "Delete post"}
          </button>
        )}
        <button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 text-white"
          disabled={isCreating || isUpdating}
          value={isNewPost ? "create" : "update"}
          name="intent"
        >
          {isNewPost ? (isCreating ? "Creating..." : "Create post") : null}
          {isNewPost ? null : isUpdating ? "Updating..." : "Update post"}
        </button>
      </div>
    </Form>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();
  if (caught.status === 404) {
    return (
      <p className="text-blue p-4">
        Nooooooooooo. This slug {`${params.slug}`} doesn't exist
      </p>
    );
  }
  throw new Error(`Unsupported behaviour: ${caught.status}`);
}
