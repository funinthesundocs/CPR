import { Shield } from 'lucide-react'

export default function AdminPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Shield className="h-7 w-7" style={{ color: 'hsl(var(--primary))' }} />
                    Admin Panel
                </h1>
                <p className="text-muted-foreground mt-1">
                    System administration and configuration
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Users', description: 'Manage user accounts and roles' },
                    { label: 'Settings', description: 'System configuration' },
                    { label: 'Audit Log', description: 'View system activity' },
                ].map((item) => (
                    <div
                        key={item.label}
                        className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                        <h3 className="font-semibold">{item.label}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {item.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}
