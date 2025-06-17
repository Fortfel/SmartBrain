import * as React from 'react'
import { ImageLinkForm } from '@/componenets/ImageLinkForm.tsx'
import { ApiUsageIndicator } from '@/componenets/ApiUsageIndicator.tsx'
import { type BoundingBox, FaceRecognition } from '@/componenets/FaceRecognition.tsx'
import { type ErrorResponse, useAuth } from '@/contexts'
import { type ProcessedBoundingBox } from '@/../../backend/server/controllers/clarifai.ts'

const MainContent = (): React.JSX.Element => {
  const [inputValue, setInputValue] = React.useState('') //https://samples.clarifai.com/metro-north.jpg
  const [imageUrl, setImageUrl] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState('')
  const [faceRegions, setfaceRegions] = React.useState<Array<BoundingBox>>([])
  const { user, updateUserEntries, onLogout } = useAuth()

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInputValue(e.target.value)
  }

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

    try {
      const response = await fetch('/api/clarifai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: user.id, IMAGE_URL: inputValue }), // We can't use imageUrl directly here because it's not yet updated (async)
      })

      if (!response.ok) {
        const errrorData = (await response.json()) as ErrorResponse
        setErrorMessage(errrorData.error || 'Failed to process image')
        return
      }

      const boundingBoxes = (await response.json()) as Array<ProcessedBoundingBox>

      setfaceRegions(boundingBoxes)

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
