'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trophy, Plus, Edit, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Sponsor { id: string; name: string; logo?: string; description?: string; level: 'PLATINUM'|'GOLD'|'SILVER'|'BRONZE'|'PARTNER'; contactName?: string; contactEmail?: string; contactPhone?: string; website?: string; contractStart?: string; contractEnd?: string; amount: number; status: 'ACTIVE'|'INACTIVE'|'PENDING'|'EXPIRED'; benefits?: string; benefitsStatus?: string; invoiceNumber?: string; invoiceDate?: string; paymentStatus: 'PENDING'|'COMPLETED'|'REFUNDED'; paymentDate?: string; notes?: string; createdAt: string }
const levelColors = { PLATINUM: { bg: 'bg-gradient-to-r from-gray-300 to-gray-400', text: 'text-gray-900', label: 'Platinum' }, GOLD: { bg: 'bg-gradient-to-r from-yellow-400 to-yellow-600', text: 'text-yellow-900', label: 'Gold' }, SILVER: { bg: 'bg-gradient-to-r from-gray-400 to-gray-500', text: 'text-white', label: 'Silver' }, BRONZE: { bg: 'bg-gradient-to-r from-amber-600 to-amber-700', text: 'text-white', label: 'Bronze' }, PARTNER: { bg: 'bg-gradient-to-r from-blue-500 to-blue-600', text: 'text-white', label: 'Partenaire' } }

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentSponsor, setCurrentSponsor] = useState<Sponsor | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ name: '', logo: '', description: '', level: 'BRONZE', contactName: '', contactEmail: '', contactPhone: '', website: '', contractStart: '', contractEnd: '', amount: '', status: 'ACTIVE', benefits: '', benefitsStatus: '', invoiceNumber: '', invoiceDate: '', paymentStatus: 'PENDING', paymentDate: '', notes: '' })

  useEffect(() => { fetchSponsors() }, [])

  const fetchSponsors = async () => {
    try {
      const response = await fetch('/api/sponsors')
      if (response.ok) setSponsors(await response.json())
    } catch (error) { toast.error('Erreur lors du chargement') } finally { setIsLoading(false) }
  }

  const handleOpenDialog = (sponsor?: Sponsor) => {
    if (sponsor) {
      setIsEditing(true)
      setCurrentSponsor(sponsor)
      setFormData({ name: sponsor.name, logo: sponsor.logo || '', description: sponsor.description || '', level: sponsor.level, contactName: sponsor.contactName || '', contactEmail: sponsor.contactEmail || '', contactPhone: sponsor.contactPhone || '', website: sponsor.website || '', contractStart: sponsor.contractStart ? format(new Date(sponsor.contractStart), 'yyyy-MM-dd') : '', contractEnd: sponsor.contractEnd ? format(new Date(sponsor.contractEnd), 'yyyy-MM-dd') : '', amount: sponsor.amount.toString(), status: sponsor.status, benefits: sponsor.benefits || '', benefitsStatus: sponsor.benefitsStatus || '', invoiceNumber: sponsor.invoiceNumber || '', invoiceDate: sponsor.invoiceDate ? format(new Date(sponsor.invoiceDate), 'yyyy-MM-dd') : '', paymentStatus: sponsor.paymentStatus, paymentDate: sponsor.paymentDate ? format(new Date(sponsor.paymentDate), 'yyyy-MM-dd') : '', notes: sponsor.notes || '' })
    } else {
      setIsEditing(false)
      setCurrentSponsor(null)
      setFormData({ name: '', logo: '', description: '', level: 'BRONZE', contactName: '', contactEmail: '', contactPhone: '', website: '', contractStart: '', contractEnd: '', amount: '', status: 'ACTIVE', benefits: '', benefitsStatus: '', invoiceNumber: '', invoiceDate: '', paymentStatus: 'PENDING', paymentDate: '', notes: '' })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const url = isEditing ? `/api/sponsors/${currentSponsor?.id}` : '/api/sponsors'
      const method = isEditing ? 'PUT' : 'POST'
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, amount: parseFloat(formData.amount) || 0 }) })
      if (response.ok) { toast.success(isEditing ? 'Sponsor modifié' : 'Sponsor ajouté'); setIsDialogOpen(false); fetchSponsors() } else toast.error('Erreur')
    } catch (error) { toast.error('Erreur') } finally { setSubmitting(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce sponsor ?')) return
    try {
      const response = await fetch(`/api/sponsors/${id}`, { method: 'DELETE' })
      if (response.ok) { toast.success('Sponsor supprimé'); fetchSponsors() } else toast.error('Erreur')
    } catch (error) { toast.error('Erreur') }
  }

  const stats = { total: sponsors.length, active: sponsors.filter(s => s.status === 'ACTIVE').length, totalAmount: sponsors.reduce((acc, s) => acc + s.amount, 0), paid: sponsors.filter(s => s.paymentStatus === 'COMPLETED').length }

  if (isLoading) return <div className="flex h-[600px] items-center justify-center"><div className="text-center"><div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div><p className="text-muted-foreground">Chargement...</p></div></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Sponsors</h1><p className="mt-2 text-muted-foreground">Gérez vos sponsors et partenaires</p></div>
        <Button onClick={() => handleOpenDialog()}><Plus className="mr-2 h-4 w-4" />Ajouter</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[{title:'Total',val:stats.total,col:''},{title:'Actifs',val:stats.active,col:'text-green-600'},{title:'Montant',val:stats.totalAmount.toFixed(2)+' €',col:'text-blue-600'},{title:'Payés',val:stats.paid,col:'text-emerald-600'}].map((s,i)=><Card key={i}><CardHeader className="pb-3"><CardTitle className="text-sm font-medium">{s.title}</CardTitle></CardHeader><CardContent><div className={`text-2xl font-bold ${s.col}`}>{s.val}</div></CardContent></Card>)}
      </div>
      <Card><CardHeader><CardTitle>Liste des sponsors</CardTitle></CardHeader><CardContent><div className="rounded-lg border"><Table><TableHeader><TableRow>{['Sponsor','Niveau','Montant','Contrat','Paiement','Statut','Actions'].map(h=><TableHead key={h} className={h==='Actions'?'text-right':''}>{h}</TableHead>)}</TableRow></TableHeader><TableBody>
        {sponsors.length===0?<TableRow><TableCell colSpan={7} className="text-center py-8"><Trophy className="mx-auto h-12 w-12 text-muted-foreground/40 mb-2"/><p className="text-sm text-muted-foreground">Aucun sponsor</p></TableCell></TableRow>:sponsors.map(s=>(
          <TableRow key={s.id}>
            <TableCell><div><p className="font-medium">{s.name}</p>{s.contactEmail&&<p className="text-xs text-muted-foreground">{s.contactEmail}</p>}</div></TableCell>
            <TableCell><Badge className={`${levelColors[s.level].bg} ${levelColors[s.level].text}`}>{levelColors[s.level].label}</Badge></TableCell>
            <TableCell><span className="font-medium">{s.amount.toFixed(2)} €</span></TableCell>
            <TableCell>{s.contractStart?<div><p className="text-sm">{format(new Date(s.contractStart),'dd/MM/yyyy')}</p>{s.contractEnd&&<p className="text-xs text-muted-foreground">→ {format(new Date(s.contractEnd),'dd/MM/yyyy')}</p>}</div>:'-'}</TableCell>
            <TableCell>{s.paymentStatus==='COMPLETED'?<Badge variant="outline" className="border-green-500 text-green-600"><CheckCircle className="h-3 w-3 mr-1"/>Payé</Badge>:s.paymentStatus==='PENDING'?<Badge variant="outline" className="border-amber-500 text-amber-600"><Clock className="h-3 w-3 mr-1"/>Attente</Badge>:<Badge variant="outline" className="border-red-500 text-red-600"><XCircle className="h-3 w-3 mr-1"/>Remboursé</Badge>}</TableCell>
            <TableCell>{s.status==='ACTIVE'?<Badge variant="default">Actif</Badge>:s.status==='PENDING'?<Badge variant="secondary">Attente</Badge>:s.status==='EXPIRED'?<Badge variant="destructive">Expiré</Badge>:<Badge variant="outline">Inactif</Badge>}</TableCell>
            <TableCell className="text-right"><div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={()=>handleOpenDialog(s)}><Edit className="h-4 w-4"/></Button><Button variant="ghost" size="sm" onClick={()=>handleDelete(s.id)}><Trash2 className="h-4 w-4"/></Button></div></TableCell>
          </TableRow>
        ))}
      </TableBody></Table></div></CardContent></Card>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}><DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{isEditing?'Modifier':'Ajouter'} le sponsor</DialogTitle></DialogHeader><form onSubmit={handleSubmit}><div className="grid gap-4 py-4"><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Nom *</Label><Input value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} required/></div><div className="space-y-2"><Label>Niveau *</Label><Select value={formData.level} onValueChange={v=>setFormData({...formData,level:v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{['PLATINUM','GOLD','SILVER','BRONZE','PARTNER'].map(l=><SelectItem key={l} value={l}>{levelColors[l as keyof typeof levelColors].label}</SelectItem>)}</SelectContent></Select></div></div><Textarea placeholder="Description" value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} rows={2}/><div className="grid grid-cols-3 gap-4">{[['contactName','Contact'],['contactEmail','Email'],['contactPhone','Téléphone']].map(([k,l])=><div key={k} className="space-y-2"><Label>{l}</Label><Input value={formData[k as keyof typeof formData]} onChange={e=>setFormData({...formData,[k]:e.target.value})}/></div>)}</div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Montant (€)</Label><Input type="number" step="0.01" value={formData.amount} onChange={e=>setFormData({...formData,amount:e.target.value})}/></div><div className="space-y-2"><Label>Statut</Label><Select value={formData.status} onValueChange={v=>setFormData({...formData,status:v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{[['ACTIVE','Actif'],['PENDING','Attente'],['INACTIVE','Inactif'],['EXPIRED','Expiré']].map(([v,l])=><SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></div></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Début contrat</Label><Input type="date" value={formData.contractStart} onChange={e=>setFormData({...formData,contractStart:e.target.value})}/></div><div className="space-y-2"><Label>Fin contrat</Label><Input type="date" value={formData.contractEnd} onChange={e=>setFormData({...formData,contractEnd:e.target.value})}/></div></div><Textarea placeholder="Contreparties promises" value={formData.benefits} onChange={e=>setFormData({...formData,benefits:e.target.value})} rows={2}/><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>N° Facture</Label><Input value={formData.invoiceNumber} onChange={e=>setFormData({...formData,invoiceNumber:e.target.value})}/></div><div className="space-y-2"><Label>Statut paiement</Label><Select value={formData.paymentStatus} onValueChange={v=>setFormData({...formData,paymentStatus:v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{[['PENDING','Attente'],['COMPLETED','Payé'],['REFUNDED','Remboursé']].map(([v,l])=><SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></div></div></div><DialogFooter><Button type="button" variant="outline" onClick={()=>setIsDialogOpen(false)} disabled={submitting}>Annuler</Button><Button type="submit" disabled={submitting}>{submitting?'Enregistrement...':(isEditing?'Modifier':'Ajouter')}</Button></DialogFooter></form></DialogContent></Dialog>
    </div>
  )
}
