"use client"

import { getUserPermissions, checkPermission, UserPermissions } from "@/lib/permissions"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Users, Search } from "lucide-react"
import { toast } from "sonner"
import { Employee } from "./types"

// Components
import { EmployeesHeader } from "@/components/admin/employees/EmployeesHeader"
import { EmployeeCard } from "@/components/admin/employees/EmployeeCard"
import { SystemStats } from "@/components/admin/employees/SystemStats"
import { EmployeeModal } from "@/components/admin/employees/EmployeeModal"

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        full_name: "",
        phone: "",
        role: "staff",
        document_id: "",
        waiter_pin: "",
        food_discount_pct: 0,
        max_credit: 0,
        base_salary: 0,
        commission_percentage: 0,
        contract_type: "indefinido",
        hire_date: new Date().toISOString().split('T')[0]
    })
    const [submitting, setSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [currentUserPerms, setCurrentUserPerms] = useState<UserPermissions | null>(null)

    useEffect(() => {
        fetchEmployees()
        loadPermissions()
    }, [])

    async function loadPermissions() {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const perms = await getUserPermissions(user.id)
            setCurrentUserPerms(perms)
        }
    }

    async function fetchEmployees() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .neq('role', 'customer')
                .order('created_at', { ascending: false })

            if (error) throw error
            setEmployees(data || [])
        } catch (error) {
            console.error('Error fetching employees:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddOpen = () => {
        setFormData({
            email: "",
            password: "",
            full_name: "",
            phone: "",
            role: "staff",
            document_id: "",
            waiter_pin: "",
            food_discount_pct: 0,
            max_credit: 0,
            base_salary: 0,
            commission_percentage: 0,
            contract_type: "indefinido",
            hire_date: new Date().toISOString().split('T')[0]
        })
        setIsAddModalOpen(true)
    }

    const handleEditOpen = (emp: Employee) => {
        setSelectedEmployee(emp)
        setFormData({
            email: emp.email,
            password: "",
            full_name: emp.full_name || "",
            phone: emp.phone || "",
            role: emp.role,
            document_id: emp.document_id || "",
            waiter_pin: emp.waiter_pin || "",
            food_discount_pct: emp.food_discount_pct || 0,
            max_credit: emp.max_credit || 0,
            base_salary: emp.base_salary || 0,
            commission_percentage: emp.commission_percentage || 0,
            contract_type: emp.contract_type || "indefinido",
            hire_date: emp.hire_date || ""
        })
        setIsEditModalOpen(true)
    }

    const handleCreateEmployee = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: { data: { full_name: formData.full_name, role: formData.role } }
            })

            if (authError) throw authError
            if (!authData.user) throw new Error("No se pudo crear el usuario")

            const { data: { user: currentUser } } = await supabase.auth.getUser()
            const { data: myProfile } = await supabase.from('profiles').select('restaurant_id').eq('id', currentUser?.id).single()
            const restaurantId = myProfile?.restaurant_id || (await supabase.from('restaurants').select('id').single()).data?.id

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: authData.user.id,
                    email: formData.email,
                    full_name: formData.full_name,
                    phone: formData.phone,
                    role: formData.role,
                    document_id: formData.document_id,
                    waiter_pin: formData.waiter_pin,
                    food_discount_pct: formData.food_discount_pct,
                    max_credit: formData.max_credit,
                    base_salary: formData.base_salary,
                    commission_percentage: formData.commission_percentage,
                    contract_type: formData.contract_type,
                    hire_date: formData.hire_date,
                    restaurant_id: restaurantId,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' })

            if (profileError) throw profileError

            toast.success("Empleado creado exitosamente.")
            setIsAddModalOpen(false)
            setTimeout(() => fetchEmployees(), 500)
        } catch (error: any) {
            toast.error(error.message || "Error al crear empleado")
        } finally {
            setSubmitting(false)
        }
    }

    const handleUpdateEmployee = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedEmployee) return
        setSubmitting(true)

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    phone: formData.phone,
                    role: formData.role,
                    document_id: formData.document_id,
                    waiter_pin: formData.waiter_pin,
                    food_discount_pct: formData.food_discount_pct,
                    max_credit: formData.max_credit,
                    base_salary: formData.base_salary,
                    commission_percentage: formData.commission_percentage,
                    contract_type: formData.contract_type,
                    hire_date: formData.hire_date
                })
                .eq('id', selectedEmployee.id)

            if (error) throw error

            toast.success("Empleado actualizado correctamente")
            setIsEditModalOpen(false)
            setTimeout(() => fetchEmployees(), 500)
        } catch (error: any) {
            toast.error(error.message || "Error al actualizar")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteEmployee = async (id: string) => {
        if (!confirm("¿Está seguro de eliminar este empleado? Esta acción no puede deshacerse de forma sencilla (afecta el historial de órdenes).")) return

        try {
            const { error } = await supabase.from('profiles').update({ role: 'customer' }).eq('id', id)
            if (error) throw error
            fetchEmployees()
        } catch (error) { toast.error("Error al eliminar") }
    }

    const filteredEmployees = employees.filter(emp =>
        emp.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-orange-500 overflow-x-hidden flex flex-col h-screen relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-orange-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full opacity-50" />
            </div>

            <EmployeesHeader onAddOpen={handleAddOpen} />

            <div className="relative z-10 p-4 md:p-10 lg:p-12 flex-1 flex flex-col gap-6 md:gap-10 max-w-[1800px] mx-auto w-full overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-10">
                    <div className="lg:col-span-3 space-y-6 md:space-y-8">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-all" />
                            <input
                                type="text"
                                placeholder="BUSCAR POR NOMBRE O CARGO..."
                                className="w-full h-16 md:h-20 pl-16 pr-8 rounded-2xl md:rounded-[2.5rem] bg-white border border-slate-200 focus:border-orange-500/20 outline-none transition-all shadow-sm font-black uppercase tracking-[0.2em] text-slate-900 text-[10px] md:text-xs placeholder:text-slate-400 italic"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 md:gap-8">
                            {loading ? (
                                Array(4).fill(0).map((_, i) => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-[3rem] border border-slate-200" />)
                            ) : filteredEmployees.length === 0 ? (
                                <div className="col-span-full py-32 text-center bg-white/60 backdrop-blur-3xl rounded-[4rem] border border-dashed border-slate-200 animate-in fade-in shadow-sm">
                                    <Users className="w-20 h-20 mx-auto mb-6 text-slate-300" />
                                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500 italic">No se detectaron perfiles activos en la zona</p>
                                </div>
                            ) : filteredEmployees.map((emp) => (
                                <EmployeeCard
                                    key={emp.id}
                                    employee={emp}
                                    currentUserPerms={currentUserPerms}
                                    onEdit={handleEditOpen}
                                    onDelete={handleDeleteEmployee}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-0 space-y-6 md:space-y-8">
                            <SystemStats employees={employees} />
                        </div>
                    </div>
                </div>

                <EmployeeModal
                    isOpen={isAddModalOpen || isEditModalOpen}
                    isEdit={isEditModalOpen}
                    onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                    formData={formData}
                    setFormData={setFormData}
                    submitting={submitting}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    onSubmit={isAddModalOpen ? handleCreateEmployee : handleUpdateEmployee}
                />

                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
                `}</style>
            </div>
        </div>
    )
}
