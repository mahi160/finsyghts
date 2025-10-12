import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { useEffect } from 'react'
import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => {
    useEffect(() => {
      const theme = localStorage.getItem('theme')
      const isDark = localStorage.getItem('darkMode') === 'true'
      if (theme)
        document.body.setAttribute(
          'data-theme',
          localStorage.getItem('theme') || '',
        )
      if (isDark) document.body.classList.add('dark')
    }, [])
    return (
      <>
        <Outlet />
      </>
    )
  },
  beforeLoad: () => {
    const userId = localStorage.getItem('user_id')
    if (!userId) localStorage.setItem('user_id', crypto.randomUUID())
  },
})
