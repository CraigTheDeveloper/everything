import { NavigationWrapper } from '@/components/navigation-wrapper'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NavigationWrapper>
      {children}
    </NavigationWrapper>
  )
}
