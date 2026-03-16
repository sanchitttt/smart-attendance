'use client'

import { Button } from "./button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { auth } from "@/app/lib/firebase"
import { signOut } from "firebase/auth"
import { toast } from "react-hot-toast"
import { useState } from "react"
import { logout } from "@/app/lib/auth"


function Logout() {
    const router = useRouter()
    const [isLoading,setIsLoading] = useState(false)

    const handleLogout = async () => {
        setIsLoading(true)

        try {
            await signOut(auth);
            toast.success("You have been signed out");
            logout();
        } catch (error) {
            console.error("Logout error:");
            console.log(error);
            toast.error("Failed to sign out. Please try again.")
        } finally {
            setIsLoading(false)
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

export default Logout;
