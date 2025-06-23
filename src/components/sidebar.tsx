'use client';

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, LayoutDashboard, Info, Menu, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useHospital } from "@/context/HospitalContext"
import { useAuth } from "./providers"
import { useRouter } from "next/navigation"

const mainNavItems = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  // {
  //   title: "About",
  //   href: "/about",
  //   icon: Info,
  // },
]

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const { loggedInHospital } = useHospital()
  const {  user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[240px] p-0 bg-gray-50/50">
          <MobileSidebar />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <div
          className={cn(
            "flex h-screen flex-col border-r bg-gray-50/50 transition-all duration-300",
            isCollapsed ? "w-[60px]" : "w-[240px]"
          )}
        >
          <div className="flex h-14 items-center justify-between border-b px-4 bg-white/50">
            <div className="flex items-center space-x-2 overflow-hidden">
              <Link 
                href="/" 
                className="flex items-center space-x-2"
              >
                <span className={cn(
                  "font-bold whitespace-nowrap transition-all duration-300",
                  isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                )}>
                  Medic Warehouse
                </span>
              </Link>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-1 p-2">
              <TooltipProvider delayDuration={0}>
                {mainNavItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/50 hover:text-accent-foreground",
                            pathname === item.href
                              ? "bg-black text-white hover:bg-black hover:text-white"
                              : "transparent",
                            isCollapsed && "justify-center px-2 gap-0"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className={cn(
                            "transition-all duration-300",
                            isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                          )}>
                            {item.title}
                          </span>
                        </Link>
                      </TooltipTrigger>
                      {isCollapsed && (
                        <TooltipContent side="right" className="flex items-center gap-2">
                          <span>{item.title}</span>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  )
                })}
              </TooltipProvider>
            </div>
          </ScrollArea>
          {/* Avatar & Hospital Info (pinned bottom) */}
          <div className="border-t px-4 py-3">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "flex items-center",
                      isCollapsed ? "justify-center" : "gap-3"
                    )}
                  >
                    <Avatar className="size-8">
                      <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    {!isCollapsed && (
                        <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium leading-none">{user?.name || 'User'}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1">
                          {user?.hospitalName || loggedInHospital}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2 w-6 h-6 p-0"
                          onClick={handleLogout}
                          title="Logout"
                        >
                          <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12H4m12 0-4 4m4-4-4-4m3-4h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2"/>
                          </svg>
                        </Button>
                        </div>
                    )}
                  </div>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    <span>{loggedInHospital}</span>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </>
  )
}

function MobileSidebar() {
  const pathname = usePathname()
  const { loggedInHospital } = useHospital()

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4 bg-white/50">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold">Medic Warehouse</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {mainNavItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/50 hover:text-accent-foreground",
                  pathname === item.href
                    ? "bg-black text-white hover:bg-black hover:text-white"
                    : "transparent"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </div>
      </ScrollArea>
      <div className="border-t px-4 py-4 flex items-center gap-3">
        <Avatar className="size-8">
          <AvatarImage src="/avatar.png" alt="User" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium leading-none">User</span>
          <span className="text-xs text-muted-foreground line-clamp-1">
            {loggedInHospital}
          </span>
        </div>
      </div>
    </div>
  )
} 