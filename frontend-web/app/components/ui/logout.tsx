import { Button } from './button';
import { LogOut } from 'lucide-react';
import { logout } from '@/app/lib/auth';

async function Logout() {

    return (
        <form action={logout}>
            <Button type="submit" variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
        </form>
    )
}

export default Logout;
