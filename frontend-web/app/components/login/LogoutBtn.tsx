'use client'

import { Button } from "../ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { auth } from "../../lib/firebase"
import { signOut } from "firebase/auth"
import { toast } from "react-hot-toast"
import { useState } from "react"

export function LogoutButton() {
  const router = useRouter()
  const [isLoading,setIsLoading] = useState(false)

  const handleLogout = async () => {
    setIsLoading(true)
    
    try {
      await signOut(auth);
      toast.success("You have been signed out");
      router.push("/login");
      // Optional: router.refresh() if you want to force-refresh server components
    } catch (error) {
      console.log(`Logout error: ${error}`);
      toast.error(JSON.stringify(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      disabled={isLoading}
      className="gap-2"
    >
      {isLoading ? (
        <>
          <span className="h-4 w-4 animate-spin">⏳</span>
          Signing out...
        </>
      ) : (
        <>
          <LogOut className="h-4 w-4" />
          Logout
        </>
      )}
    </Button>
  )
}