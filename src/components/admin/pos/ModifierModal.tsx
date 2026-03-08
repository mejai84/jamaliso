"use client"

import { useState, useEffect } from "react"
import { X, Check, Plus, Minus, ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn, formatPrice } from "@/lib/utils"
import { ModifierGroup, ModifierOption, SelectedModifier } from "@/app/admin/pos/types"

interface ModifierModalProps {
    isOpen: boolean
    product: { id: string; name: string; price: number; description?: string } | null
    modifierGroups: ModifierGroup[]
    onConfirm: (modifiers: SelectedModifier[]) => void
    onClose: () => void
}

export function ModifierModal({ isOpen, product, modifierGroups, onConfirm, onClose }: ModifierModalProps) {
    const [selected, setSelected] = useState<Record<string, SelectedModifier[]>>({})
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Reset state when product changes
    useEffect(() => {
        if (isOpen && product) {
            const defaults: Record<string, SelectedModifier[]> = {}
            modifierGroups.forEach(group => {
                const defaultOptions = group.options
                    .filter(opt => opt.is_default && opt.is_available)
                    .map(opt => ({
                        option_id: opt.id,
                        name: opt.name,
                        price_adjustment: opt.price_adjustment,
                        quantity: 1
                    }))
                if (defaultOptions.length > 0) {
                    defaults[group.id] = defaultOptions
                }
            })
            setSelected(defaults)
            setErrors({})
        }
    }, [isOpen, product, modifierGroups])

    if (!isOpen || !product) return null

    const toggleOption = (group: ModifierGroup, option: ModifierOption) => {
        setSelected(prev => {
            const groupSelections = prev[group.id] || []
            const existingIndex = groupSelections.findIndex(s => s.option_id === option.id)

            if (group.selection_type === 'single') {
                // Radio behavior: replace selection
                return {
                    ...prev,
                    [group.id]: [{
                        option_id: option.id,
                        name: option.name,
                        price_adjustment: option.price_adjustment,
                        quantity: 1
                    }]
                }
            }

            // Multiple selection: toggle
            if (existingIndex >= 0) {
                return {
                    ...prev,
                    [group.id]: groupSelections.filter(s => s.option_id !== option.id)
                }
            }

            // Check max selections
            if (groupSelections.length >= group.max_selections) return prev

            return {
                ...prev,
                [group.id]: [...groupSelections, {
                    option_id: option.id,
                    name: option.name,
                    price_adjustment: option.price_adjustment,
                    quantity: 1
                }]
            }
        })

        // Clear error for this group
        setErrors(prev => ({ ...prev, [group.id]: '' }))
    }

    const isSelected = (groupId: string, optionId: string) => {
        return (selected[groupId] || []).some(s => s.option_id === optionId)
    }

    const handleConfirm = () => {
        // Validate required groups
        const newErrors: Record<string, string> = {}
        modifierGroups.forEach(group => {
            if (group.is_required) {
                const groupSelections = selected[group.id] || []
                if (groupSelections.length < group.min_selections) {
                    newErrors[group.id] = `Selecciona al menos ${group.min_selections} opción(es)`
                }
            }
        })

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        // Flatten all selected modifiers
        const allModifiers = Object.values(selected).flat()
        onConfirm(allModifiers)
    }

    const extraCost = Object.values(selected).flat().reduce((sum, m) => sum + m.price_adjustment, 0)
    const totalPrice = product.price + extraCost

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div className="relative bg-white w-full md:max-w-lg md:rounded-[2.5rem] rounded-t-[2.5rem] max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 border border-slate-200">
                {/* Header */}
                <div className="p-6 pb-4 border-b border-slate-100 shrink-0">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center border border-orange-100">
                                <ChefHat className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black uppercase italic tracking-tight text-slate-900">{product.name}</h2>
                                <p className="text-xs text-slate-400 font-bold">{formatPrice(product.price)} base</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                    {product.description && (
                        <p className="text-xs text-slate-500 mt-2 italic">{product.description}</p>
                    )}
                </div>

                {/* Modifier Groups */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {modifierGroups.map(group => (
                        <div key={group.id} className="space-y-3">
                            {/* Group Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                                        {group.name}
                                        {group.is_required && <span className="text-red-500 ml-1">*</span>}
                                    </h3>
                                    <p className="text-[9px] text-slate-400 mt-0.5 font-medium">
                                        {group.selection_type === 'single' ? 'Elige 1' : `Hasta ${group.max_selections}`}
                                        {group.is_required ? ' · Obligatorio' : ' · Opcional'}
                                    </p>
                                </div>
                            </div>

                            {/* Error */}
                            {errors[group.id] && (
                                <p className="text-[10px] font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-xl">
                                    {errors[group.id]}
                                </p>
                            )}

                            {/* Options */}
                            <div className="space-y-2">
                                {group.options.filter(o => o.is_available).map(option => {
                                    const active = isSelected(group.id, option.id)
                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => toggleOption(group, option)}
                                            className={cn(
                                                "w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all duration-200",
                                                active
                                                    ? "border-orange-500 bg-orange-50/80 shadow-sm"
                                                    : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-6 h-6 flex items-center justify-center transition-all",
                                                    group.selection_type === 'single' ? "rounded-full" : "rounded-lg",
                                                    active
                                                        ? "bg-orange-600 text-white"
                                                        : "bg-slate-100 border border-slate-200"
                                                )}>
                                                    {active && <Check className="w-3.5 h-3.5" />}
                                                </div>
                                                <span className={cn(
                                                    "text-sm font-bold",
                                                    active ? "text-orange-700" : "text-slate-700"
                                                )}>
                                                    {option.name}
                                                </span>
                                            </div>
                                            {option.price_adjustment > 0 && (
                                                <span className={cn(
                                                    "text-xs font-black font-mono",
                                                    active ? "text-orange-600" : "text-slate-400"
                                                )}>
                                                    +{formatPrice(option.price_adjustment)}
                                                </span>
                                            )}
                                            {option.price_adjustment === 0 && (
                                                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">
                                                    Gratis
                                                </span>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ))}

                    {modifierGroups.length === 0 && (
                        <div className="text-center py-8 text-slate-400">
                            <p className="text-sm font-medium">Sin modificadores disponibles</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 pt-4 border-t border-slate-100 shrink-0 space-y-3">
                    {extraCost > 0 && (
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400 font-bold uppercase tracking-wider">Extras:</span>
                            <span className="font-black text-orange-600 font-mono">+{formatPrice(extraCost)}</span>
                        </div>
                    )}
                    <Button
                        onClick={handleConfirm}
                        className="w-full bg-orange-600 hover:bg-orange-500 text-white h-14 rounded-2xl font-black uppercase text-sm tracking-widest italic shadow-lg shadow-orange-600/20 transition-all active:scale-95"
                    >
                        AGREGAR · {formatPrice(totalPrice)}
                    </Button>
                </div>
            </div>
        </div>
    )
}
