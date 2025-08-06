"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, User, Settings, LogOut } from "lucide-react"

import { useSession, signOut } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

// Navigation items
const navigationItems = [
    {
        title: "Dashboard",
        url: "/",
        icon: Home,
    },
    {
        title: "Profile",
        url: "/profile",
        icon: User,
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
    },
]

export function AppSidebar() {
    const { data: session } = useSession()
    const pathname = usePathname()

    const handleSignOut = async () => {
        try {
            await signOut({
                fetchOptions: {
                    onSuccess: () => {
                        window.location.href = '/'
                    },
                },
            })
        } catch (error) {
            console.error('Sign out error:', error)
        }
    }

    const isActivePath = (path: string) => {
        if (path === '/') {
            return pathname === '/'
        }
        return pathname.startsWith(path)
    }

    return (
        <Sidebar variant="inset" collapsible="icon">
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-2">
                    <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Home className="h-4 w-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">Finance Tracker</span>
                        <span className="truncate text-xs text-muted-foreground">
                            Portfolio Management
                        </span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigationItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={isActivePath(item.url)}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarSeparator className="mx-0" />

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-3 px-2 py-2">
                            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                                {session?.user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{session?.user.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{session?.user.email}</p>
                            </div>
                        </div>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-2 px-2">
                            <ThemeToggle />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSignOut}
                                className="flex-1"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Sign Out
                            </Button>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
