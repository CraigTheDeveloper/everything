import { auth } from "@/lib/auth"
import { Navigation } from "./navigation"

interface NavigationWrapperProps {
  children: React.ReactNode
}

export async function NavigationWrapper({ children }: NavigationWrapperProps) {
  const session = await auth()

  return (
    <Navigation user={session?.user}>
      {children}
    </Navigation>
  )
}
