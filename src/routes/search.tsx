import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/search")({ component: SearchPage });

function SearchPage() {
  return <h1>検索</h1>;
}
