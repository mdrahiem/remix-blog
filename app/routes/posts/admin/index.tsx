import { Link } from "@remix-run/react";

export default function AdminIndexRoute() {
  return (
    <p>
      <Link to="create" className="text-red-600 underline">
        Create new post
      </Link>
    </p>
  );
}
