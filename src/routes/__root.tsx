import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Outlet />
    </>
  ),
  beforeLoad: () => {
    const userId = localStorage.getItem('user_id')
    if (!userId) localStorage.setItem('user_id', crypto.randomUUID())
  },
})
