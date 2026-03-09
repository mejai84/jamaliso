import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoyaltyDashboard } from '@/components/admin/loyalty/LoyaltyDashboard';

export const metadata = {
    title: 'Programa de Lealtad | JAMALI OS',
    description: 'Gestión del programa de fidelización de clientes',
};

export default function LoyaltyPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Programa de Lealtad</h2>
            </div>
            <div className="grid gap-4">
                <LoyaltyDashboard />
            </div>
        </div>
    );
}
