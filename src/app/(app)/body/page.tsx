'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'
import { Input } from '@/components/ui/form-inputs'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface BodyMetric {
  id: number
  date: string
  weight: number | null
  bodyFatPercent: number | null
  musclePercent: number | null
  pointsEarned: number
}

interface ProgressPhoto {
  id: number
  date: string
  type: 'front' | 'back' | 'side'
  filePath: string
}

interface BodyGoal {
  id: number
  targetWeight: number | null
  targetBodyFatPercent: number | null
  weeklyLossRate: number | null
}

export default function BodyPage() {
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [muscle, setMuscle] = useState('')
  const [todayMetric, setTodayMetric] = useState<BodyMetric | null>(null)
  const [recentMetrics, setRecentMetrics] = useState<BodyMetric[]>([])
  const [todayPhotos, setTodayPhotos] = useState<ProgressPhoto[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null)
  const [allPhotos, setAllPhotos] = useState<ProgressPhoto[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null)
  const [bodyGoal, setBodyGoal] = useState<BodyGoal | null>(null)
  const [targetWeight, setTargetWeight] = useState('')
  const [targetBodyFat, setTargetBodyFat] = useState('')
  const [weeklyLossRate, setWeeklyLossRate] = useState('')
  const [isSavingGoals, setIsSavingGoals] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const today = new Date()
  const formattedDate = format(today, 'EEEE, MMMM d, yyyy')
  const todayString = format(today, 'yyyy-MM-dd')

  const fetchData = useCallback(async () => {
    try {
      // Fetch today's metric
      const todayResponse = await fetch(`/api/body/metrics?date=${todayString}`)
      if (todayResponse.ok) {
        const data = await todayResponse.json()
        if (data.metric) {
          setTodayMetric(data.metric)
          setWeight(data.metric.weight?.toString() || '')
          setBodyFat(data.metric.bodyFatPercent?.toString() || '')
          setMuscle(data.metric.musclePercent?.toString() || '')
        }
      }

      // Fetch recent metrics
      const recentResponse = await fetch('/api/body/metrics')
      if (recentResponse.ok) {
        const data = await recentResponse.json()
        setRecentMetrics(data.metrics || [])
      }

      // Fetch today's photos
      const photosResponse = await fetch(`/api/body/photos?date=${todayString}`)
      if (photosResponse.ok) {
        const data = await photosResponse.json()
        setTodayPhotos(data.photos || [])
      }

      // Fetch all recent photos for gallery
      const allPhotosResponse = await fetch('/api/body/photos')
      if (allPhotosResponse.ok) {
        const data = await allPhotosResponse.json()
        setAllPhotos(data.photos || [])
      }

      // Fetch body goals
      const goalsResponse = await fetch('/api/body/goals')
      if (goalsResponse.ok) {
        const data = await goalsResponse.json()
        if (data.goal) {
          setBodyGoal(data.goal)
          setTargetWeight(data.goal.targetWeight?.toString() || '')
          setTargetBodyFat(data.goal.targetBodyFatPercent?.toString() || '')
          setWeeklyLossRate(data.goal.weeklyLossRate?.toString() || '')
        }
      }
    } catch (error) {
      console.error('Error fetching body data:', error)
    }
  }, [todayString])

  const handlePhotoUpload = async (type: 'front' | 'back' | 'side', file: File) => {
    setUploadingPhoto(type)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const response = await fetch('/api/body/photos', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Success!',
          description: data.message,
        })
        fetchData() // Refresh photos
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to upload photo',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload photo',
        variant: 'destructive',
      })
    } finally {
      setUploadingPhoto(null)
    }
  }

  const getPhotoByType = (type: 'front' | 'back' | 'side') => {
    return todayPhotos.find(p => p.type === type)
  }

  const handleSaveGoals = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingGoals(true)
    try {
      const response = await fetch('/api/body/goals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetWeight: targetWeight ? parseFloat(targetWeight) : null,
          targetBodyFatPercent: targetBodyFat ? parseFloat(targetBodyFat) : null,
          weeklyLossRate: weeklyLossRate ? parseFloat(weeklyLossRate) : null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setBodyGoal(data.goal)
        toast({
          title: 'Success!',
          description: data.message,
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to save goals',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error saving goals:', error)
      toast({
        title: 'Error',
        description: 'Failed to save goals',
        variant: 'destructive',
      })
    } finally {
      setIsSavingGoals(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handle browser back button for photo modal
  useEffect(() => {
    if (selectedPhoto) {
      // Push a state when modal opens
      window.history.pushState({ photoModalOpen: true }, '')

      const handlePopState = () => {
        // Close modal when back button is pressed
        setSelectedPhoto(null)
      }

      window.addEventListener('popstate', handlePopState)

      return () => {
        window.removeEventListener('popstate', handlePopState)
      }
    }
  }, [selectedPhoto])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const weightVal = weight ? parseFloat(weight) : undefined
    const bodyFatVal = bodyFat ? parseFloat(bodyFat) : undefined
    const muscleVal = muscle ? parseFloat(muscle) : undefined

    if (!weightVal && !bodyFatVal && !muscleVal) {
      toast({
        title: 'Error',
        description: 'Please enter at least one metric',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/body/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weight: weightVal,
          bodyFatPercent: bodyFatVal,
          musclePercent: muscleVal,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setTodayMetric(data.metric)
        toast({
          title: 'Success!',
          description: data.message,
        })
        fetchData()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to save metrics',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error saving metrics:', error)
      toast({
        title: 'Error',
        description: 'Failed to save metrics',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <header className="mb-8 animate-fade-in-up">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Body Tracking</h1>
          <p className="text-lg text-muted-foreground">{formattedDate}</p>
        </header>

        {/* Today's Metrics Input */}
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm animate-fade-in-up stagger-1">
          <h2 className="mb-4 text-xl font-semibold">Today's Metrics</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <Input
                label="Weight (kg)"
                type="number"
                step="0.1"
                placeholder="e.g., 75.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                variant="body"
              />
              <Input
                label="Body Fat (%)"
                type="number"
                step="0.1"
                placeholder="e.g., 15.5"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                variant="body"
              />
              <Input
                label="Muscle (%)"
                type="number"
                step="0.1"
                placeholder="e.g., 42.0"
                value={muscle}
                onChange={(e) => setMuscle(e.target.value)}
                variant="body"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-body px-5 py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {isLoading ? 'Saving...' : todayMetric ? 'Update Metrics' : 'Save Metrics'}
            </button>
          </form>
        </div>

        {/* Progress Photos Upload */}
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Progress Photos</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {(['front', 'back', 'side'] as const).map((type) => {
              const photo = getPhotoByType(type)
              const isUploading = uploadingPhoto === type
              return (
                <div key={type} className="flex flex-col items-center">
                  <p className="mb-2 font-medium capitalize">{type} View</p>
                  <div className="relative flex h-48 w-full items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
                    {photo ? (
                      <img
                        src={`/api${photo.filePath}`}
                        alt={`${type} view`}
                        className="h-full w-full rounded-lg object-cover"
                      />
                    ) : (
                      <span className="text-muted-foreground">No photo</span>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                        <span className="text-white">Uploading...</span>
                      </div>
                    )}
                  </div>
                  <label className="mt-2 cursor-pointer rounded-md bg-body px-3 py-1 text-sm font-medium text-white hover:opacity-90">
                    {photo ? 'Replace' : 'Upload'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handlePhotoUpload(type, file)
                        }
                      }}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              )
            })}
          </div>
          {todayPhotos.length === 3 && (
            <p className="mt-4 text-center text-sm text-green-600">
              +1 point earned for uploading all 3 photos!
            </p>
          )}
        </div>

        {/* Photo Gallery/Timeline */}
        {allPhotos.length > 0 && (
          <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Photo Gallery</h2>
            <div className="space-y-6">
              {/* Group photos by date */}
              {Object.entries(
                allPhotos.reduce((acc, photo) => {
                  const dateKey = format(new Date(photo.date), 'yyyy-MM-dd')
                  if (!acc[dateKey]) acc[dateKey] = []
                  acc[dateKey].push(photo)
                  return acc
                }, {} as Record<string, ProgressPhoto[]>)
              )
                .sort(([a], [b]) => b.localeCompare(a)) // Sort dates descending
                .map(([dateKey, photos]) => (
                  <div key={dateKey}>
                    <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                      {format(new Date(dateKey), 'EEEE, MMMM d, yyyy')}
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {(['front', 'back', 'side'] as const).map((type) => {
                        const photo = photos.find((p) => p.type === type)
                        return (
                          <div
                            key={type}
                            className="relative aspect-[3/4] overflow-hidden rounded-lg border bg-muted/50"
                          >
                            {photo ? (
                              <button
                                onClick={() => setSelectedPhoto(photo)}
                                className="h-full w-full"
                              >
                                <img
                                  src={`/api${photo.filePath}`}
                                  alt={`${type} view - ${dateKey}`}
                                  className="h-full w-full cursor-pointer object-cover transition-transform hover:scale-105"
                                />
                              </button>
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <span className="text-xs text-muted-foreground capitalize">
                                  No {type}
                                </span>
                              </div>
                            )}
                            <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-xs capitalize text-white">
                              {type}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Photo Modal */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => window.history.back()}
          >
            <div className="relative max-h-[90vh] max-w-4xl">
              <img
                src={`/api${selectedPhoto.filePath}`}
                alt={`${selectedPhoto.type} view`}
                className="max-h-[90vh] rounded-lg object-contain"
              />
              <div className="absolute bottom-4 left-4 rounded bg-black/50 px-3 py-1.5 text-white">
                <span className="capitalize">{selectedPhoto.type}</span> -{' '}
                {format(new Date(selectedPhoto.date), 'MMMM d, yyyy')}
              </div>
              <button
                onClick={() => window.history.back()}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Body Goals */}
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Goals</h2>
          <form onSubmit={handleSaveGoals} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <Input
                label="Target Weight (kg)"
                type="number"
                step="0.1"
                placeholder="e.g., 70"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                variant="body"
              />
              <Input
                label="Target Body Fat (%)"
                type="number"
                step="0.1"
                placeholder="e.g., 12"
                value={targetBodyFat}
                onChange={(e) => setTargetBodyFat(e.target.value)}
                variant="body"
              />
              <Input
                label="Weekly Loss Rate (kg)"
                type="number"
                step="0.1"
                placeholder="e.g., 0.5"
                value={weeklyLossRate}
                onChange={(e) => setWeeklyLossRate(e.target.value)}
                variant="body"
              />
            </div>
            <button
              type="submit"
              disabled={isSavingGoals}
              className="rounded-lg bg-body px-5 py-2.5 font-medium text-white hover:opacity-90 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {isSavingGoals ? 'Saving...' : 'Save Goals'}
            </button>
          </form>
        </div>

        {/* Current Values Display */}
        {todayMetric && (
          <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Today's Recorded Values</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-body/10 p-4 text-center">
                <p className="text-sm text-muted-foreground">Weight</p>
                <p className="text-2xl font-bold text-body">
                  {todayMetric.weight !== null ? `${todayMetric.weight} kg` : '-'}
                </p>
              </div>
              <div className="rounded-lg bg-body/10 p-4 text-center">
                <p className="text-sm text-muted-foreground">Body Fat</p>
                <p className="text-2xl font-bold text-body">
                  {todayMetric.bodyFatPercent !== null ? `${todayMetric.bodyFatPercent}%` : '-'}
                </p>
              </div>
              <div className="rounded-lg bg-body/10 p-4 text-center">
                <p className="text-sm text-muted-foreground">Muscle</p>
                <p className="text-2xl font-bold text-body">
                  {todayMetric.musclePercent !== null ? `${todayMetric.musclePercent}%` : '-'}
                </p>
              </div>
            </div>
            {todayMetric.pointsEarned > 0 && (
              <p className="mt-4 text-center text-sm text-green-600">
                +{todayMetric.pointsEarned} point earned for logging all metrics!
              </p>
            )}
          </div>
        )}

        {/* Metrics Charts */}
        {recentMetrics.length > 1 && (
          <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Trends</h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Weight Chart */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">Weight (kg)</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[...recentMetrics].reverse().map((m) => ({
                        date: format(new Date(m.date), 'MMM d'),
                        value: m.weight,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: '#10b981' }}
                        name="Weight"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Body Fat Chart */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">Body Fat (%)</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[...recentMetrics].reverse().map((m) => ({
                        date: format(new Date(m.date), 'MMM d'),
                        value: m.bodyFatPercent,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ fill: '#f59e0b' }}
                        name="Body Fat"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Muscle Chart */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">Muscle (%)</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[...recentMetrics].reverse().map((m) => ({
                        date: format(new Date(m.date), 'MMM d'),
                        value: m.musclePercent,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6' }}
                        name="Muscle"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent History */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Recent History</h2>
          {recentMetrics.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left font-medium">Date</th>
                    <th className="py-2 text-right font-medium">Weight (kg)</th>
                    <th className="py-2 text-right font-medium">Body Fat (%)</th>
                    <th className="py-2 text-right font-medium">Muscle (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMetrics.map((metric) => (
                    <tr key={metric.id} className="border-b last:border-0">
                      <td className="py-2">
                        {format(new Date(metric.date), 'MMM d, yyyy')}
                      </td>
                      <td className="py-2 text-right">
                        {metric.weight ?? '-'}
                      </td>
                      <td className="py-2 text-right">
                        {metric.bodyFatPercent ?? '-'}
                      </td>
                      <td className="py-2 text-right">
                        {metric.musclePercent ?? '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No metrics recorded yet. Start tracking today!
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
