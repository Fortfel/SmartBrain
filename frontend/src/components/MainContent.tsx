import * as React from 'react'
import { ImageLinkForm } from '@/components/ImageLinkForm.tsx'
import { ApiUsageIndicator } from '@/components/ApiUsageIndicator.tsx'
import { type BoundingBox, FaceRecognition } from '@/components/FaceRecognition.tsx'
import { type ErrorResponse, useAuth } from '@/contexts'
import type { ProcessedBoundingBox } from '@backend/server/controllers/clarifai'
import { API_BASE_URL } from '@/utils/api.ts'

const API_URL = API_BASE_URL

/**
 * Main content component that handles image processing and face recognition
 * Manages form input, API interactions, and displays results
 * @returns React component representing the main content area
 */
const MainContent = (): React.JSX.Element => {
  const [inputValue, setInputValue] = React.useState('') //https://samples.clarifai.com/metro-north.jpg
  const [imageUrl, setImageUrl] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState('')
  const [faceRegions, setfaceRegions] = React.useState<Array<BoundingBox>>([])
  const { user, updateUserEntries, onLogout } = useAuth()

  /**
   * Effect to reset component state when user logs out
   * Registers a callback with the auth context's onLogout method
   */
  React.useEffect(() => {
    const unsubscribe = onLogout(() => {
      // Reset states
      setErrorMessage('')
      setImageUrl('')
      setfaceRegions([])
      setInputValue('')
    })

    return (): void => {
      unsubscribe?.()
    }
  }, [onLogout])

  /**
   * Handles changes to the image URL input field
   * @param e - Input change event
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInputValue(e.target.value)
  }

  /**
   * Handles submission of an image URL for face detection
   * Processes the image through Clarifai API and updates user entries
   * @param e - Mouse event from button click
   * @returns Promise resolving when processing completes
   */
  const handlePictureSubmit = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
    if (!user) {
      setErrorMessage('Please sign in to use this feature')
      return
    }
    e.preventDefault()

    // Reset states
    setErrorMessage('')
    setIsLoading(true)
    setImageUrl(inputValue)
    setfaceRegions([])

    try {
      const response = await fetch(API_URL + '/clarifai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: user.id, IMAGE_URL: inputValue }), // We can't use imageUrl directly here because it's not yet updated (async)
      })

      if (!response.ok) {
        const errrorData = (await response.json()) as ErrorResponse
        setErrorMessage(errrorData.error || 'Failed to process image')

        // Update user entries
        await updateUserEntries({
          id: user.id,
          imageUrl: inputValue,
          detectionResults: [],
        })

        return
      }

      const boundingBoxes = (await response.json()) as Array<ProcessedBoundingBox>

      setfaceRegions(() => {
        return boundingBoxes.length > 0
          ? boundingBoxes
          : [
              {
                topRow: '0',
                rightCol: '0',
                bottomRow: '0',
                leftCol: '0',
                value: 0,
              },
            ]
      })

      // Update user entries
      const updatedUser = await updateUserEntries({
        id: user.id,
        imageUrl: inputValue,
        detectionResults: boundingBoxes,
      })

      if (updatedUser.error) {
        setErrorMessage(updatedUser.error)
        return
      }
    } catch (error) {
      console.error('Error fetching face data:', error)
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-[600px] px-5 font-courier">
      <div className="mx-auto flex max-w-[var(--breakpoint-lg)] flex-col items-center gap-7">
        {user && (
          <div className={'font-semibold'}>
            <p className="text-center text-lg">
              <span className="text-secondary">{user.name}</span>, you used face recognition tool
              <br />
              <span className="text-secondary">{user.entries}</span> times total
            </p>
            <ApiUsageIndicator />
          </div>
        )}
        <ImageLinkForm
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onPictureSubmit={handlePictureSubmit}
          isLoading={isLoading}
        />
        <FaceRecognition imageUrl={imageUrl} errorMessage={errorMessage} faceRegions={faceRegions} />
      </div>
    </main>
  )
}

export { MainContent }
