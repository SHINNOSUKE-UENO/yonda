import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/books/$id")({ component: BookDetailPage });

function BookDetailPage() {
  return <h1>本の詳細</h1>;
}
