import * as React from 'react'
import { ImageLinkForm } from '@/componenets/ImageLinkForm.tsx'
import { type BoundingBox, FaceRecognition } from '@/componenets/FaceRecognition.tsx'
import { useAuth } from '@/contexts'

type ClarifaiRegion = {
  data: {
    concepts: Array<{
      app_id: string
      id: string
      name: string
      user_id: string
      value: number
    }>
  }
  region_info: {
    bounding_box: {
      top_row: number
      right_col: number
      bottom_row: number
      left_col: number
    }
  }
  value: number
}

type ClarifaiResponse = {
  outputs: Array<{
    status: {
      code: number
      description: string
    }
    data: {
      regions: Array<ClarifaiRegion>
    }
  }>
}

type RequestOptionsArgs = {
  PAT: string
  USER_ID: string
  APP_ID: string
  IMAGE_URL: string
}

/** @see https://cors-anywhere.herokuapp.com/ */
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/'
// Change these to whatever model and image URL you want to use
const MODEL_ID = 'face-detection'
const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105'

async function fetchClarifaiData({
  PAT,
  USER_ID,
  APP_ID,
  IMAGE_URL,
}: RequestOptionsArgs): Promise<Array<ClarifaiRegion>> {
  const requestOptions = getRequestOptions({ PAT, USER_ID, APP_ID, IMAGE_URL })

  const response = await fetch(
    (import.meta.env.DEV ? CORS_PROXY : '') +
      'https://api.clarifai.com/v2/models/' +
      MODEL_ID +
      '/versions/' +
      MODEL_VERSION_ID +
      '/outputs',
    requestOptions,
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status.toString()}`)
  }

  const result = (await response.json()) as ClarifaiResponse

  // Check the status code from the API response
  const statusCode = result.outputs?.[0]?.status?.code // eslint-disable-line @typescript-eslint/no-unnecessary-condition
  const statusDescription = result.outputs?.[0]?.status?.description || 'Unknown error' // eslint-disable-line @typescript-eslint/no-unnecessary-condition

  if (!statusCode) {
    throw new Error('Invalid API response format')
  }

  // Status code 10000 is success according to Clarifai API
  if (statusCode !== 10000) {
    throw new Error(`API Error (${statusCode.toString()}): ${statusDescription}`)
  }

  return result.outputs[0].data.regions
}

function getRequestOptions({ PAT, USER_ID, APP_ID, IMAGE_URL }: RequestOptionsArgs): RequestInit {
  const raw = JSON.stringify({
    user_app_id: {
      user_id: USER_ID,
      app_id: APP_ID,
    },
    inputs: [
      {
        data: {
          image: {
            url: IMAGE_URL,
            // "base64": IMAGE_BYTES_STRING
          },
        },
      },
    ],
  })

  return {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: 'Key ' + PAT,
    },
    body: raw,
  }
}

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
      const regions = await fetchClarifaiData({
        PAT: import.meta.env.VITE_CLARIFAI_PAT as string,
        USER_ID: import.meta.env.VITE_CLARIFAI_USER_ID as string,
        APP_ID: import.meta.env.VITE_CLARIFAI_APP_ID as string,
        IMAGE_URL: inputValue, // We can't use imageUrl directly here because it's not yet updated (async)
      })

      const boundingBoxes = regions.map((region) => {
        // Accessing and rounding the bounding box values
        const boundingBox = region.region_info.bounding_box
        const topRow = boundingBox.top_row.toFixed(3)
        const leftCol = boundingBox.left_col.toFixed(3)
        const bottomRow = boundingBox.bottom_row.toFixed(3)
        const rightCol = boundingBox.right_col.toFixed(3)
        const value = region.value

        return {
          value,
          topRow,
          leftCol,
          bottomRow,
          rightCol,
        }
      })

      // Update user entries
      const response = await updateUserEntries({
        id: user.id,
        imageUrl: inputValue,
        detectionResults: boundingBoxes,
      })

      if (response.error) {
        setErrorMessage(response.error)
        return
      }

      setfaceRegions(boundingBoxes)

      // console.log('Face regions detected:', regions)
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
          <p className="text-center text-lg font-semibold">
            <span className="text-secondary">{user.name}</span>, you used face recognition tool
            <br />
            <span className="text-secondary">{user.entries}</span> times total
            <br />
            and <span className="text-secondary">0/10</span> this month
          </p>
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
