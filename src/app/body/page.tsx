'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'

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

export default function BodyPage() {
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [muscle, setMuscle] = useState('')
  const [todayMetric, setTodayMetric] = useState<BodyMetric | null>(null)
  const [recentMetrics, setRecentMetrics] = useState<BodyMetric[]>([])
  const [todayPhotos, setTodayPhotos] = useState<ProgressPhoto[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null)
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

  useEffect(() => {
    fetchData()
  }, [fetchData])

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
        <header className="mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Body Tracking</h1>
          <p className="text-lg text-muted-foreground">{formattedDate}</p>
        </header>

        {/* Today's Metrics Input */}
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Today's Metrics</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label htmlFor="weight" className="mb-2 block text-sm font-medium">
                  Weight (kg)
                </label>
                <input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 75.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full rounded-md border bg-input px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="bodyFat" className="mb-2 block text-sm font-medium">
                  Body Fat (%)
                </label>
                <input
                  id="bodyFat"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 15.5"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                  className="w-full rounded-md border bg-input px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="muscle" className="mb-2 block text-sm font-medium">
                  Muscle (%)
                </label>
                <input
                  id="muscle"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 42.0"
                  value={muscle}
                  onChange={(e) => setMuscle(e.target.value)}
                  className="w-full rounded-md border bg-input px-3 py-2"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-body px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
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
                        src={photo.filePath}
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
