import { type FC, type ReactNode } from 'react'
import { SidebarMenuButton, useSidebar } from '@oasisprotocol/ui-library/src/components/ui/sidebar'
import { MessageSquare, HelpCircle } from 'lucide-react'
import { Button } from '@oasisprotocol/ui-library/src/components/ui/button'

const MessageAnchor = ({ children, className }: { children: ReactNode; className?: string }) => (
  <a
    href="https://forms.gle/yewQDdMzNg81wKtw9"
    target="_blank"
    rel="noopener noreferrer"
    title="Provide feedback"
    className={className}
  >
    {children}
  </a>
)

const DiscordAnchor = ({ children, className }: { children: ReactNode; className?: string }) => (
  <a
    href="https://oasis.io/discord"
    target="_blank"
    rel="noopener noreferrer"
    title="Get support"
    className={className}
  >
    {children}
  </a>
)

export const SidebarFooterContent: FC = () => {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  if (isCollapsed) {
    return (
      <>
        <MessageAnchor>
          <SidebarMenuButton asChild>
            <Button variant="ghost" className="w-full justify-start p-2 h-8 rounded-md cursor-pointer">
              <MessageSquare className="h-4 w-4 text-sidebar-foreground" />
            </Button>
          </SidebarMenuButton>
        </MessageAnchor>
        <DiscordAnchor>
          <SidebarMenuButton asChild>
            <Button variant="ghost" className="w-full justify-start p-2 h-8 rounded-md cursor-pointer">
              <HelpCircle className="h-4 w-4 text-sidebar-foreground" />
            </Button>
          </SidebarMenuButton>
        </DiscordAnchor>
      </>
    )
  }

  return (
    <>
      <div className="bg-sidebar-accent p-4 rounded-md text-sm text-foreground">
        <span className="font-bold">Running in Beta</span>
        <br />
        <MessageAnchor className="underline">Provide feedback here</MessageAnchor>
      </div>
      <div className="bg-sidebar-accent p-4 rounded-md text-sm text-foreground">
        <span className="font-bold">Need Support?</span>
        <br />
        <DiscordAnchor className="underline">Speak to our devs</DiscordAnchor>
      </div>
    </>
  )
}
