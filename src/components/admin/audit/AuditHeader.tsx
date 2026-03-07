"use client"

import { Lock, Search } from "lucide-react"
import { StaffMember } from "@/app/admin/audit/types"

interface AuditHeaderProps {
    searchTerm: string
    setSearchTerm: (val: string) => void
    filterAction: string
    setFilterAction: (val: string) => void
    filterStaff: string
    setFilterStaff: (val: string) => void
    filterEntity: string
    setFilterEntity: (val: string) => void
    staff: StaffMember[]
    entityTypes: string[]
}

export function AuditHeader({
    searchTerm,
    setSearchTerm,
    filterAction,
    setFilterAction,
    filterStaff,
    setFilterStaff,
    filterEntity,
    setFilterEntity,
    staff,
    entityTypes
}: AuditHeaderProps) {
    return (
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 border-b border-slate-200 pb-12 font-sans">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg">
                        <Lock className="w-5 h-5 text-orange-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-orange-500 italic">Audit Protocol v5.0 • Live</span>
                </div>
                <h1 className="text-6xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">Caja <span className="text-orange-500 italic">Negra</span></h1>
                <p className="text-slate-500 font-bold text-sm uppercase tracking-widest italic flex items-center gap-3">
                    Monitor de integridad y trazabilidad operativa
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-2" />
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full xl:w-auto">
                {/* Search */}
                <div className="relative group/search sm:col-span-2 lg:col-span-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/search:text-orange-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="BUSCAR EVENTO..."
                        className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-14 pr-6 outline-none focus:border-orange-500 transition-all text-[11px] font-black italic uppercase placeholder:text-slate-300 shadow-sm text-slate-900"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Filter Action */}
                <select
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    className="h-14 bg-white border border-slate-200 rounded-2xl px-6 outline-none focus:border-orange-500 transition-all text-[11px] font-black italic uppercase appearance-none cursor-pointer hover:bg-slate-50 text-slate-900 shadow-sm custom-select"
                >
                    <option value="ALL">TODAS LAS ACCIONES</option>
                    <option value="INSERT">INSERCIONES (+)</option>
                    <option value="UPDATE">MODIFICACIONES (Δ)</option>
                    <option value="DELETE">ELIMINACIONES (-)</option>
                </select>

                {/* Filter Staff */}
                <select
                    value={filterStaff}
                    onChange={(e) => setFilterStaff(e.target.value)}
                    className="h-14 bg-white border border-slate-200 rounded-2xl px-6 outline-none focus:border-orange-500 transition-all text-[11px] font-black italic uppercase appearance-none cursor-pointer hover:bg-slate-50 text-slate-900 shadow-sm truncate max-w-[200px] custom-select"
                >
                    <option value="ALL">TODOS LOS SUJETOS</option>
                    {staff.map(s => (
                        <option key={s.id} value={s.id}>{s.full_name}</option>
                    ))}
                </select>

                {/* Filter Entity */}
                <select
                    value={filterEntity}
                    onChange={(e) => setFilterEntity(e.target.value)}
                    className="h-14 bg-white border border-slate-200 rounded-2xl px-6 outline-none focus:border-orange-500 transition-all text-[11px] font-black italic uppercase appearance-none cursor-pointer hover:bg-slate-50 text-slate-900 shadow-sm custom-select"
                >
                    <option value="ALL">TODAS LAS ENTIDADES</option>
                    {entityTypes.map(type => (
                        <option key={type} value={type}>{type.toUpperCase()}</option>
                    ))}
                </select>
            </div>
            <style jsx>{`
                .custom-select {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ff4d00' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 1.5rem center;
                    background-size: 1.25rem;
                }
            `}</style>
        </div>
    )
}
