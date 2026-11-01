import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: ShelfPage })

function ShelfPage() {
  return <h1>本棚</h1>
}
