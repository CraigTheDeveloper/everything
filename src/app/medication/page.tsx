'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'
import { Spinner, EmptyState, CardSkeleton } from '@/components/ui/loading-states'
import { Input, Select, Radio, RadioGroup, Checkbox } from '@/components/ui/form-inputs'

interface Medication {
  id: number
  name: string
  dosage: string | null
  isChronic: boolean
  frequency: 'ONCE' | 'TWICE' | 'THRICE'
  active: boolean
  createdAt: string
}

interface MedicationLog {
  id: number
  date: string
  medicationId: number
  timeOfDay: string
  taken: boolean
}

interface MedicationStat {
  id: number
  name: string
  dosage: string | null
  frequency: string
  slotsPerDay: number
  takenCount: number
  compliance: number
  isComplete: boolean
}

interface ComplianceStats {
  date: string
  medications: MedicationStat[]
  summary: {
    totalMedications: number
    completeMedications: number
    totalSlots: number
    totalTaken: number
    overallCompliance: number
  }
}

export default function MedicationPage() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [todayLogs, setTodayLogs] = useState<MedicationLog[]>([])
  const [complianceStats, setComplianceStats] = useState<ComplianceStats | null>(null)
  const [isAddingMedication, setIsAddingMedication] = useState(false)
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null)
  const [newMedName, setNewMedName] = useState('')
  const [newMedDosage, setNewMedDosage] = useState('')
  const [newMedIsChronic, setNewMedIsChronic] = useState(true)
  const [newMedFrequency, setNewMedFrequency] = useState<'ONCE' | 'TWICE' | 'THRICE'>('ONCE')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const today = new Date()
  const formattedDate = format(today, 'EEEE, MMMM d, yyyy')
  const todayString = format(today, 'yyyy-MM-dd')

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch all medications
      const medsResponse = await fetch('/api/medication')
      if (medsResponse.ok) {
        const data = await medsResponse.json()
        setMedications(data.medications || [])
      }

      // Fetch today's logs
      const logsResponse = await fetch(`/api/medication/logs?date=${todayString}`)
      if (logsResponse.ok) {
        const data = await logsResponse.json()
        setTodayLogs(data.logs || [])
      }

      // Fetch compliance stats
      const statsResponse = await fetch(`/api/medication/stats?date=${todayString}`)
      if (statsResponse.ok) {
        const data = await statsResponse.json()
        setComplianceStats(data)
      }
    } catch (error) {
      console.error('Error fetching medication data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [todayString])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMedName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a medication name',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/medication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newMedName.trim(),
          dosage: newMedDosage.trim() || null,
          isChronic: newMedIsChronic,
          frequency: newMedFrequency,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Success!',
          description: data.message,
        })
        // Reset form
        setNewMedName('')
        setNewMedDosage('')
        setNewMedIsChronic(true)
        setNewMedFrequency('ONCE')
        setIsAddingMedication(false)
        fetchData()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to add medication',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error adding medication:', error)
      toast({
        title: 'Error',
        description: 'Failed to add medication',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleMedication = async (medId: number, timeOfDay: string, currentValue: boolean) => {
    try {
      const response = await fetch('/api/medication/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          medicationId: medId,
          timeOfDay,
          taken: !currentValue,
        }),
      })

      if (response.ok) {
        fetchData()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to update log',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating medication log:', error)
    }
  }

  const handleDeleteMedication = async (id: number) => {
    if (!confirm('Are you sure you want to delete this medication?')) return

    try {
      const response = await fetch(`/api/medication?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Deleted',
          description: 'Medication removed successfully',
        })
        fetchData()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to delete medication',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error deleting medication:', error)
    }
  }

  const handleEditMedication = (med: Medication) => {
    setEditingMedication(med)
    setNewMedName(med.name)
    setNewMedDosage(med.dosage || '')
    setNewMedIsChronic(med.isChronic)
    setNewMedFrequency(med.frequency)
    setIsAddingMedication(false)
  }

  const handleUpdateMedication = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingMedication) return

    if (!newMedName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a medication name',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/medication', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingMedication.id,
          name: newMedName.trim(),
          dosage: newMedDosage.trim() || null,
          isChronic: newMedIsChronic,
          frequency: newMedFrequency,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Success!',
          description: data.message,
        })
        // Reset form
        setNewMedName('')
        setNewMedDosage('')
        setNewMedIsChronic(true)
        setNewMedFrequency('ONCE')
        setEditingMedication(null)
        fetchData()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to update medication',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating medication:', error)
      toast({
        title: 'Error',
        description: 'Failed to update medication',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const cancelEdit = () => {
    setEditingMedication(null)
    setNewMedName('')
    setNewMedDosage('')
    setNewMedIsChronic(true)
    setNewMedFrequency('ONCE')
  }

  const getLogStatus = (medId: number, timeOfDay: string): boolean => {
    const log = todayLogs.find(
      (l) => l.medicationId === medId && l.timeOfDay === timeOfDay
    )
    return log?.taken || false
  }

  const getTimesOfDay = (frequency: 'ONCE' | 'TWICE' | 'THRICE'): string[] => {
    switch (frequency) {
      case 'ONCE':
        return ['morning']
      case 'TWICE':
        return ['morning', 'evening']
      case 'THRICE':
        return ['morning', 'afternoon', 'evening']
    }
  }

  const activeMedications = medications.filter((m) => m.active)

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Medication Tracking</h1>
          <p className="text-lg text-muted-foreground">{formattedDate}</p>
        </header>

        {/* Add Medication Section */}
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Medications</h2>
            <button
              onClick={() => setIsAddingMedication(!isAddingMedication)}
              className="rounded-md bg-medication px-4 py-2 font-medium text-white hover:opacity-90"
            >
              {isAddingMedication ? 'Cancel' : 'Add Medication'}
            </button>
          </div>

          {editingMedication && (
            <form onSubmit={handleUpdateMedication} className="space-y-5 border-t pt-4">
              <h3 className="font-medium text-medication">Edit Medication: {editingMedication.name}</h3>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Input
                  label="Medication Name"
                  placeholder="e.g., Aspirin"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  variant="medication"
                  required
                />
                <Input
                  label="Dosage"
                  placeholder="e.g., 10mg"
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  variant="medication"
                />
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <RadioGroup label="Type">
                  <Radio
                    name="editMedType"
                    label="Chronic"
                    checked={newMedIsChronic}
                    onChange={() => setNewMedIsChronic(true)}
                    variant="medication"
                  />
                  <Radio
                    name="editMedType"
                    label="Temporary"
                    checked={!newMedIsChronic}
                    onChange={() => setNewMedIsChronic(false)}
                    variant="medication"
                  />
                </RadioGroup>
                <Select
                  label="Frequency"
                  value={newMedFrequency}
                  onChange={(e) => setNewMedFrequency(e.target.value as 'ONCE' | 'TWICE' | 'THRICE')}
                  variant="medication"
                  options={[
                    { value: 'ONCE', label: 'Once daily' },
                    { value: 'TWICE', label: 'Twice daily' },
                    { value: 'THRICE', label: 'Three times daily' },
                  ]}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-medication px-5 py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {isSaving ? 'Saving...' : 'Update Medication'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-lg border-2 border-border px-5 py-2.5 font-medium hover:bg-muted transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {isAddingMedication && !editingMedication && (
            <form onSubmit={handleAddMedication} className="space-y-5 border-t pt-4">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Input
                  label="Medication Name"
                  placeholder="e.g., Aspirin"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  variant="medication"
                  required
                />
                <Input
                  label="Dosage"
                  placeholder="e.g., 10mg"
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  variant="medication"
                />
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <RadioGroup label="Type">
                  <Radio
                    name="medType"
                    label="Chronic"
                    checked={newMedIsChronic}
                    onChange={() => setNewMedIsChronic(true)}
                    variant="medication"
                  />
                  <Radio
                    name="medType"
                    label="Temporary"
                    checked={!newMedIsChronic}
                    onChange={() => setNewMedIsChronic(false)}
                    variant="medication"
                  />
                </RadioGroup>
                <Select
                  label="Frequency"
                  value={newMedFrequency}
                  onChange={(e) => setNewMedFrequency(e.target.value as 'ONCE' | 'TWICE' | 'THRICE')}
                  variant="medication"
                  options={[
                    { value: 'ONCE', label: 'Once daily' },
                    { value: 'TWICE', label: 'Twice daily' },
                    { value: 'THRICE', label: 'Three times daily' },
                  ]}
                />
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-medication px-5 py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {isSaving ? 'Saving...' : 'Save Medication'}
              </button>
            </form>
          )}
        </div>

        {/* Today's Medication Checklist */}
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Today's Medications</h2>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner color="medication" size="lg" />
            </div>
          ) : activeMedications.length === 0 ? (
            <EmptyState
              variant="medication"
              title="Medication Made Simple"
              description="Add your medications to get reminders and track your doses. Taking care of yourself has never been easier!"
              action={
                <button
                  onClick={() => setIsAddingMed(true)}
                  className="rounded-lg bg-medication px-4 py-2 font-medium text-white hover:opacity-90 transition-opacity"
                >
                  Add Medication
                </button>
              }
            />
          ) : (
            <div className="space-y-4">
              {activeMedications.map((med) => (
                <div key={med.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{med.name}</h3>
                      {med.dosage && (
                        <p className="text-sm text-muted-foreground">{med.dosage}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {med.isChronic ? 'Chronic' : 'Temporary'} •{' '}
                        {med.frequency === 'ONCE'
                          ? 'Once daily'
                          : med.frequency === 'TWICE'
                          ? 'Twice daily'
                          : 'Three times daily'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditMedication(med)}
                        className="text-sm text-blue-500 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMedication(med.id)}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-4 flex-wrap">
                    {getTimesOfDay(med.frequency).map((timeOfDay) => {
                      const taken = getLogStatus(med.id, timeOfDay)
                      return (
                        <Checkbox
                          key={timeOfDay}
                          label={timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)}
                          checked={taken}
                          onChange={() => handleToggleMedication(med.id, timeOfDay, taken)}
                          variant="medication"
                          className={taken ? 'opacity-60' : ''}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Compliance Statistics */}
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Compliance Statistics</h2>
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : !complianceStats || complianceStats.medications.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No statistics available. Add medications to see compliance data.
            </p>
          ) : (
            <div className="space-y-6">
              {/* Overall Compliance */}
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Overall Compliance</p>
                <p className={`text-3xl font-bold ${
                  complianceStats.summary.overallCompliance >= 80
                    ? 'text-green-500'
                    : complianceStats.summary.overallCompliance >= 50
                    ? 'text-yellow-500'
                    : 'text-red-500'
                }`}>
                  {complianceStats.summary.overallCompliance}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {complianceStats.summary.totalTaken} of {complianceStats.summary.totalSlots} doses taken today
                </p>
              </div>

              {/* Per-Medication Compliance */}
              <div className="space-y-3">
                <h3 className="font-medium text-sm">Per-Medication Compliance</h3>
                {complianceStats.medications.map((stat) => (
                  <div key={stat.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium text-sm">{stat.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {stat.takenCount} of {stat.slotsPerDay} doses
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            stat.compliance >= 100
                              ? 'bg-green-500'
                              : stat.compliance >= 50
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(stat.compliance, 100)}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium min-w-[3rem] text-right ${
                        stat.compliance >= 100
                          ? 'text-green-500'
                          : stat.compliance >= 50
                          ? 'text-yellow-500'
                          : 'text-red-500'
                      }`}>
                        {stat.compliance}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* All Medications List */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">All Medications</h2>
          {medications.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No medications found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left font-medium">Name</th>
                    <th className="py-2 text-left font-medium">Dosage</th>
                    <th className="py-2 text-left font-medium">Type</th>
                    <th className="py-2 text-left font-medium">Frequency</th>
                    <th className="py-2 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {medications.map((med) => (
                    <tr key={med.id} className="border-b last:border-0">
                      <td className="py-2">{med.name}</td>
                      <td className="py-2">{med.dosage || '-'}</td>
                      <td className="py-2">{med.isChronic ? 'Chronic' : 'Temporary'}</td>
                      <td className="py-2">
                        {med.frequency === 'ONCE'
                          ? 'Once'
                          : med.frequency === 'TWICE'
                          ? 'Twice'
                          : 'Thrice'}
                      </td>
                      <td className="py-2">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                            med.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {med.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
