import {
    LayoutDashboard,
    ShoppingBag,
    ChefHat,
    Calendar,
    Users,
    QrCode,
    Truck,
    Bike,
    Clock,
    History,
    Package,
    UtensilsCrossed,
    Tag,
    BarChart3,
    Wallet,
    Zap,
    ShieldCheck,
    ShieldAlert,
    Shield,
    Settings,
    Printer,
    Server,
    User,
    BadgeDollarSign,
    Utensils,
    FileText,
    Globe,
    Gift,
    MonitorSmartphone,
    CalendarDays
} from "lucide-react"

export const sidebarSections = [
    {
        title: "VENTAS Y OPERACIÓN",
        items: [
            { icon: LayoutDashboard, label: "Vista General", href: "/admin", roles: ['admin', 'manager', 'cashier'] },
            { icon: Utensils, label: "Portal Mesero", href: "/admin/waiter", roles: ['admin', 'manager', 'waiter'] },
            { icon: BadgeDollarSign, label: "Control de Caja", href: "/admin/cashier", roles: ['admin', 'manager', 'cashier'] },
            { icon: QrCode, label: "Mesas & QR", href: "/admin/tables", roles: ['admin', 'manager', 'waiter', 'cashier'] },
            { icon: ShoppingBag, label: "Listado Pedidos", href: "/admin/orders", roles: ['admin', 'manager', 'cashier', 'waiter'] },
            { icon: Calendar, label: "Reservas / Agenda", href: "/admin/reservations", roles: ['admin', 'manager', 'host', 'cashier'] },
        ]
    },
    {
        title: "PRODUCCIÓN Y LOGÍSTICA",
        items: [
            { icon: ChefHat, label: "Cocina (KDS)", href: "/admin/kitchen", roles: ['admin', 'manager', 'cook', 'chef'] },
            { icon: UtensilsCrossed, label: "Menú & Productos", href: "/admin/products", roles: ['admin', 'manager', 'chef'] },
            { icon: Package, label: "Stock e Insumos", href: "/admin/inventory", roles: ['admin', 'manager', 'chef'] },
            { icon: ChefHat, label: "Libro de Recetas", href: "/admin/inventory/recipes", roles: ['admin', 'manager', 'chef'] },
            { icon: Truck, label: "Proveedores", href: "/admin/inventory/suppliers", roles: ['admin', 'manager'] },
            { icon: ShoppingBag, label: "Compras / Ingresos", href: "/admin/inventory/purchases", roles: ['admin', 'manager'] },
            { icon: MonitorSmartphone, label: "Kiosco Autoservicio", href: "/admin/kiosk", roles: ['admin', 'manager'] },
        ]
    },
    {
        title: "GESTIÓN DE TALENTO",
        items: [
            { icon: Clock, label: "Mi Turno / Entrada", href: "/admin/cashier/start-shift", roles: ['admin', 'manager', 'staff', 'waiter', 'cook', 'chef', 'cashier', 'cleaner', 'host', 'driver'] },
            { icon: BadgeDollarSign, label: "Nómina y Pagos", href: "/admin/payroll", roles: ['admin', 'manager'] },
            { icon: CalendarDays, label: "Novedades Laborales", href: "/admin/payroll", roles: ['admin', 'manager'] },
            { icon: Users, label: "Gestión de Personal", href: "/admin/employees", roles: ['admin', 'manager'] },
            { icon: Bike, label: "Repartidores", href: "/admin/drivers", roles: ['admin', 'manager'] },
            { icon: User, label: "Mi Perfil", href: "/admin/me", roles: ['admin', 'manager', 'cashier', 'waiter', 'cook', 'chef', 'cleaner', 'host'] },
        ]
    },
    {
        title: "ECOSISTEMA DIGITAL",
        items: [
            { icon: Globe, label: "Ventas / Web App", href: "/admin/online-sales", roles: ['admin', 'manager'] },
            { icon: Users, label: "CRM de Clientes", href: "/admin/customers", roles: ['admin', 'manager', 'cashier'] },
            { icon: Gift, label: "Programa de Lealtad", href: "/admin/loyalty", roles: ['admin', 'manager'] },
            { icon: Tag, label: "Promociones / Cupones", href: "/admin/coupons", roles: ['admin', 'manager'] },
        ]
    },
    {
        title: "COMANDO CENTRAL",
        items: [
            { icon: BarChart3, label: "Reportes Avanzados", href: "/admin/reports", roles: ['admin', 'manager'] },
            { icon: FileText, label: "Facturación DIAN/SAT", href: "/admin/billing", roles: ['admin', 'manager', 'cashier'] },
            { icon: Wallet, label: "Caja Menor / Gastos", href: "/admin/petty-cash", roles: ['admin', 'manager', 'cashier'] },
            { icon: ShieldCheck, label: "Auditoría / Roles", href: "/admin/employees", roles: ['admin', 'owner', 'developer'] },
            { icon: Zap, label: "JAMALI Hub Live", href: "/admin/hub", roles: ['admin', 'owner', 'developer'] },
            { icon: Settings, label: "Configuración", href: "/admin/settings", roles: ['admin'] },
            { icon: Printer, label: "Soporte Impresoras", href: "/admin/settings/printers", roles: ['admin', 'manager'] },
            { icon: Server, label: "Infraestructura Core", href: "/admin/settings/infrastructure", roles: ['admin'] },
        ]
    }
]
