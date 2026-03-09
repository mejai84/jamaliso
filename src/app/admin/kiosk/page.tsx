import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KioskSettings } from '@/components/admin/kiosk/KioskSettings';

export const metadata = {
    title: 'Módulo Kiosco | JAMALI OS',
    description: 'Configuración de terminal de autoservicio para clientes',
};

export default function KioskPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Kioscos de Autoservicio</h2>
            </div>
            <div className="grid gap-4">
                <KioskSettings />
            </div>
        </div>
    );
}
