'use client'

import { useState, useEffect, useCallback } from 'react'
import { format } from 'date-fns'
import { useToast } from '@/components/ui/use-toast'
import Link from 'next/link'

interface Dog {
  id: number
  name: string
  photoPath: string | null
  active: boolean
  createdAt: string
}

interface DogWalk {
  id: number
  date: string
  durationMinutes: number
  distanceKm: number | null
  steps: number | null
  avgHeartRate: number | null
  paceMinPerKm: number | null
  comments: string | null
  dogs: { dog: Dog }[]
}

export default function DogsPage() {
  const [dogs, setDogs] = useState<Dog[]>([])
  const [walks, setWalks] = useState<DogWalk[]>([])
  const [isAddingDog, setIsAddingDog] = useState(false)
  const [isLoggingWalk, setIsLoggingWalk] = useState(false)
  const [editingDog, setEditingDog] = useState<Dog | null>(null)

  // Dog form state
  const [newDogName, setNewDogName] = useState('')
  const [newDogPhoto, setNewDogPhoto] = useState<File | null>(null)

  // Walk form state
  const [selectedDogs, setSelectedDogs] = useState<number[]>([])
  const [walkDuration, setWalkDuration] = useState('')
  const [walkDistance, setWalkDistance] = useState('')
  const [walkSteps, setWalkSteps] = useState('')
  const [walkHeartRate, setWalkHeartRate] = useState('')
  const [walkPace, setWalkPace] = useState('')
  const [walkComments, setWalkComments] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const today = new Date()
  const formattedDate = format(today, 'EEEE, MMMM d, yyyy')
  const todayString = format(today, 'yyyy-MM-dd')

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch all dogs
      const dogsResponse = await fetch('/api/dogs')
      if (dogsResponse.ok) {
        const data = await dogsResponse.json()
        setDogs(data.dogs || [])
      }

      // Fetch recent walks
      const walksResponse = await fetch('/api/dogs/walks')
      if (walksResponse.ok) {
        const data = await walksResponse.json()
        setWalks(data.walks || [])
      }
    } catch (error) {
      console.error('Error fetching dog data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAddDog = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newDogName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a dog name',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', newDogName.trim())
      if (newDogPhoto) {
        formData.append('photo', newDogPhoto)
      }

      const response = await fetch('/api/dogs', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Success!',
          description: data.message,
        })
        setNewDogName('')
        setNewDogPhoto(null)
        setIsAddingDog(false)
        fetchData()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to add dog',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error adding dog:', error)
      toast({
        title: 'Error',
        description: 'Failed to add dog',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateDog = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingDog) return

    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append('id', editingDog.id.toString())
      formData.append('name', newDogName.trim())
      if (newDogPhoto) {
        formData.append('photo', newDogPhoto)
      }

      const response = await fetch('/api/dogs', {
        method: 'PUT',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Success!',
          description: data.message,
        })
        cancelEdit()
        fetchData()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to update dog',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating dog:', error)
      toast({
        title: 'Error',
        description: 'Failed to update dog',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteDog = async (id: number) => {
    if (!confirm('Are you sure you want to remove this dog?')) return

    try {
      const response = await fetch(`/api/dogs?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Removed',
          description: 'Dog removed successfully',
        })
        fetchData()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to remove dog',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error deleting dog:', error)
    }
  }

  const handleEditDog = (dog: Dog) => {
    setEditingDog(dog)
    setNewDogName(dog.name)
    setNewDogPhoto(null)
    setIsAddingDog(false)
  }

  const cancelEdit = () => {
    setEditingDog(null)
    setNewDogName('')
    setNewDogPhoto(null)
  }

  const handleLogWalk = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedDogs.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one dog',
        variant: 'destructive',
      })
      return
    }

    if (!walkDuration || parseInt(walkDuration) <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid duration',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/dogs/walks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dogIds: selectedDogs,
          durationMinutes: parseInt(walkDuration),
          distanceKm: walkDistance ? parseFloat(walkDistance) : null,
          steps: walkSteps ? parseInt(walkSteps) : null,
          avgHeartRate: walkHeartRate ? parseInt(walkHeartRate) : null,
          paceMinPerKm: walkPace ? parseFloat(walkPace) : null,
          comments: walkComments,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Walk logged!',
          description: data.message,
        })
        // Reset form
        setSelectedDogs([])
        setWalkDuration('')
        setWalkDistance('')
        setWalkSteps('')
        setWalkHeartRate('')
        setWalkPace('')
        setWalkComments('')
        setIsLoggingWalk(false)
        fetchData()
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to log walk',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error logging walk:', error)
      toast({
        title: 'Error',
        description: 'Failed to log walk',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const toggleDogSelection = (dogId: number) => {
    setSelectedDogs((prev) =>
      prev.includes(dogId)
        ? prev.filter((id) => id !== dogId)
        : [...prev, dogId]
    )
  }

  const activeDogs = dogs.filter((d) => d.active)

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <div className="mx-auto w-full max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block">
            &larr; Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Dog Walk Tracking</h1>
          <p className="text-lg text-muted-foreground">{formattedDate}</p>
        </header>

        {/* Dogs Management Section */}
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">My Dogs</h2>
            <button
              onClick={() => setIsAddingDog(!isAddingDog)}
              className="rounded-md bg-dogs px-4 py-2 font-medium text-white hover:opacity-90"
            >
              {isAddingDog ? 'Cancel' : 'Add Dog'}
            </button>
          </div>

          {/* Edit Dog Form */}
          {editingDog && (
            <form onSubmit={handleUpdateDog} className="space-y-4 border-t pt-4 mb-4">
              <h3 className="font-medium">Edit Dog: {editingDog.name}</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="editDogName" className="mb-2 block text-sm font-medium">
                    Dog Name *
                  </label>
                  <input
                    id="editDogName"
                    type="text"
                    placeholder="e.g., Max"
                    value={newDogName}
                    onChange={(e) => setNewDogName(e.target.value)}
                    className="w-full rounded-md border bg-input px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="editDogPhoto" className="mb-2 block text-sm font-medium">
                    Photo (optional)
                  </label>
                  <input
                    id="editDogPhoto"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewDogPhoto(e.target.files?.[0] || null)}
                    className="w-full rounded-md border bg-input px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-md bg-dogs px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Update Dog'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-md border px-4 py-2 font-medium hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Add Dog Form */}
          {isAddingDog && !editingDog && (
            <form onSubmit={handleAddDog} className="space-y-4 border-t pt-4 mb-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="dogName" className="mb-2 block text-sm font-medium">
                    Dog Name *
                  </label>
                  <input
                    id="dogName"
                    type="text"
                    placeholder="e.g., Max"
                    value={newDogName}
                    onChange={(e) => setNewDogName(e.target.value)}
                    className="w-full rounded-md border bg-input px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="dogPhoto" className="mb-2 block text-sm font-medium">
                    Photo (optional)
                  </label>
                  <input
                    id="dogPhoto"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewDogPhoto(e.target.files?.[0] || null)}
                    className="w-full rounded-md border bg-input px-3 py-2"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-md bg-dogs px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Dog'}
              </button>
            </form>
          )}

          {/* Dogs List */}
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : activeDogs.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No dogs added yet. Click "Add Dog" to get started.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {activeDogs.map((dog) => (
                <div key={dog.id} className="rounded-lg border p-4 text-center">
                  <div className="mb-2 mx-auto h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {dog.photoPath ? (
                      <img
                        src={dog.photoPath}
                        alt={dog.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">🐕</span>
                    )}
                  </div>
                  <h3 className="font-medium">{dog.name}</h3>
                  <div className="mt-2 flex justify-center gap-2">
                    <button
                      onClick={() => handleEditDog(dog)}
                      className="text-xs text-blue-500 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteDog(dog.id)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Log Walk Section */}
        <div className="mb-8 rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Log Walk</h2>
            <button
              onClick={() => setIsLoggingWalk(!isLoggingWalk)}
              disabled={activeDogs.length === 0}
              className="rounded-md bg-dogs px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {isLoggingWalk ? 'Cancel' : 'Log Walk'}
            </button>
          </div>

          {isLoggingWalk && activeDogs.length > 0 && (
            <form onSubmit={handleLogWalk} className="space-y-4 border-t pt-4">
              {/* Dog Selection */}
              <div>
                <label className="mb-2 block text-sm font-medium">Select Dogs *</label>
                <div className="flex flex-wrap gap-2">
                  {activeDogs.map((dog) => (
                    <button
                      key={dog.id}
                      type="button"
                      onClick={() => toggleDogSelection(dog.id)}
                      className={`flex items-center gap-2 rounded-full px-4 py-2 border ${
                        selectedDogs.includes(dog.id)
                          ? 'bg-dogs text-white border-dogs'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {dog.photoPath ? (
                        <img
                          src={dog.photoPath}
                          alt={dog.name}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        <span>🐕</span>
                      )}
                      <span>{dog.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <div>
                  <label htmlFor="walkDuration" className="mb-2 block text-sm font-medium">
                    Duration (min) *
                  </label>
                  <input
                    id="walkDuration"
                    type="number"
                    placeholder="30"
                    value={walkDuration}
                    onChange={(e) => setWalkDuration(e.target.value)}
                    className="w-full rounded-md border bg-input px-3 py-2"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="walkDistance" className="mb-2 block text-sm font-medium">
                    Distance (km)
                  </label>
                  <input
                    id="walkDistance"
                    type="number"
                    step="0.1"
                    placeholder="2.5"
                    value={walkDistance}
                    onChange={(e) => setWalkDistance(e.target.value)}
                    className="w-full rounded-md border bg-input px-3 py-2"
                  />
                </div>
                <div>
                  <label htmlFor="walkSteps" className="mb-2 block text-sm font-medium">
                    Steps
                  </label>
                  <input
                    id="walkSteps"
                    type="number"
                    placeholder="3000"
                    value={walkSteps}
                    onChange={(e) => setWalkSteps(e.target.value)}
                    className="w-full rounded-md border bg-input px-3 py-2"
                  />
                </div>
                <div>
                  <label htmlFor="walkHeartRate" className="mb-2 block text-sm font-medium">
                    Avg Heart Rate
                  </label>
                  <input
                    id="walkHeartRate"
                    type="number"
                    placeholder="100"
                    value={walkHeartRate}
                    onChange={(e) => setWalkHeartRate(e.target.value)}
                    className="w-full rounded-md border bg-input px-3 py-2"
                  />
                </div>
                <div>
                  <label htmlFor="walkPace" className="mb-2 block text-sm font-medium">
                    Pace (min/km)
                  </label>
                  <input
                    id="walkPace"
                    type="number"
                    step="0.1"
                    placeholder="12.5"
                    value={walkPace}
                    onChange={(e) => setWalkPace(e.target.value)}
                    className="w-full rounded-md border bg-input px-3 py-2"
                  />
                </div>
                <div>
                  <label htmlFor="walkComments" className="mb-2 block text-sm font-medium">
                    Comments
                  </label>
                  <input
                    id="walkComments"
                    type="text"
                    placeholder="Great walk!"
                    value={walkComments}
                    onChange={(e) => setWalkComments(e.target.value)}
                    className="w-full rounded-md border bg-input px-3 py-2"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving || selectedDogs.length === 0}
                className="rounded-md bg-dogs px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {isSaving ? 'Logging...' : 'Log Walk'}
              </button>
            </form>
          )}
        </div>

        {/* Recent Walks */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Recent Walks</h2>
          {walks.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No walks logged yet. Add dogs and start logging walks!
            </p>
          ) : (
            <div className="space-y-3">
              {walks.map((walk) => (
                <div key={walk.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {walk.dogs.map(({ dog }) => (
                        <div key={dog.id} className="flex items-center gap-1">
                          {dog.photoPath ? (
                            <img
                              src={dog.photoPath}
                              alt={dog.name}
                              className="h-6 w-6 rounded-full object-cover"
                            />
                          ) : (
                            <span>🐕</span>
                          )}
                          <span className="text-sm font-medium">{dog.name}</span>
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(walk.date), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>{walk.durationMinutes} min</span>
                    {walk.distanceKm && <span>{walk.distanceKm} km</span>}
                    {walk.steps && <span>{walk.steps.toLocaleString()} steps</span>}
                    {walk.avgHeartRate && <span>❤️ {walk.avgHeartRate} bpm</span>}
                  </div>
                  {walk.comments && (
                    <p className="mt-2 text-sm italic text-muted-foreground">{walk.comments}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
