"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Désactiver temporairement la vérification d'authentification pour le développement
  // const { user, loading } = useAuth()
  // const router = useRouter()

  // useEffect(() => {
  //   if (!loading && (!user || user.role !== "admin")) {
  //     router.push("/login")
  //   }
  // }, [user, loading, router])

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-background">
  //       <div className="flex">
  //         <div className="w-64 border-r bg-card">
  //           <div className="p-6">
  //             <Skeleton className="h-8 w-32 mb-6" />
  //             <div className="space-y-2">
  //               {[...Array(6)].map((_, i) => (
  //                 <Skeleton key={i} className="h-10 w-full" />
  //               ))}
  //             </div>
  //           </div>
  //         </div>
  //         <div className="flex-1 p-6">
  //           <Skeleton className="h-8 w-48 mb-6" />
  //           <div className="grid grid-cols-4 gap-6 mb-8">
  //             {[...Array(4)].map((_, i) => (
  //               <Skeleton key={i} className="h-24 w-full" />
  //             ))}
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  // if (!user || user.role !== "admin") {
  //   return null
  // }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 overflow-auto lg:ml-0 ml-0">{children}</main>
      </div>
    </div>
  )
}
