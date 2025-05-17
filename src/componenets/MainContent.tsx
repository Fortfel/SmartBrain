import * as React from 'react'
import { ImageLinkForm } from '@/componenets/ImageLinkForm.tsx'
import { FaceRecognition } from '@/componenets/FaceRecognition.tsx'

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

async function fetchClarifaiData({
  PAT,
  USER_ID,
  APP_ID,
  IMAGE_URL,
}: RequestOptionsArgs): Promise<Array<ClarifaiRegion>> {
  const requestOptions = getRequestOptions({ PAT, USER_ID, APP_ID, IMAGE_URL })

  const response = await fetch(
    (import.meta.env.DEV ? CORS_PROXY : '') + 'https://api.clarifai.com/v2/models/' + MODEL_ID + '/outputs',
    requestOptions,
  )

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status.toString()}`)
  }

  const result = (await response.json()) as ClarifaiResponse

  console.log(result)

  // Check the status code from the API response
  const statusCode = result.outputs?.[0]?.status?.code
  const statusDescription = result.outputs?.[0]?.status?.description || 'Unknown error'

  if (!statusCode) {
    throw new Error('Invalid API response format')
  }

  // Status code 10000 is success according to Clarifai API
  if (statusCode !== 10000) {
    throw new Error(`API Error (${statusCode}): ${statusDescription}`)
  }

  if (!result.outputs?.[0]?.data?.regions) {
    throw new Error('No face regions detected in the image')
  }

  return result.outputs[0].data.regions

  // regions.forEach((region) => {
  //   // Accessing and rounding the bounding box values
  //   const boundingBox = region.region_info.bounding_box
  //   const topRow = boundingBox.top_row.toFixed(3)
  //   const leftCol = boundingBox.left_col.toFixed(3)
  //   const bottomRow = boundingBox.bottom_row.toFixed(3)
  //   const rightCol = boundingBox.right_col.toFixed(3)
  //
  //   region.data.concepts.forEach((concept) => {
  //     // Accessing and rounding the concept value
  //     const name = concept.name
  //     const value = concept.value.toFixed(4)
  //
  //     console.log(`${name}: ${value} BBox: ${topRow}, ${leftCol}, ${bottomRow}, ${rightCol}`)
  //   })
  // })
}

function getRequestOptions({ PAT, USER_ID, APP_ID, IMAGE_URL }: RequestOptionsArgs) {
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
  const [inputValue, setInputValue] = React.useState('https://samples.clarifai.com/metro-north.jpg')
  const [imageUrl, setImageUrl] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState('')
  const [faceRegions, setFaceRegions] = React.useState<Array<ClarifaiRegion>>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleButtonSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    // Reset states
    setErrorMessage('')
    setIsLoading(true)
    setImageUrl(inputValue)

    try {
      const regions = await fetchClarifaiData({
        PAT: import.meta.env.VITE_CLARIFAI_PAT,
        USER_ID: import.meta.env.VITE_CLARIFAI_USER_ID,
        APP_ID: import.meta.env.VITE_CLARIFAI_APP_ID,
        IMAGE_URL: inputValue, // We can't use imageUrl directly here because it's not yet updated (async)
      })

      setFaceRegions(regions)
      console.log('Face regions detected:', regions)
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
        <p className={'text-center text-lg font-semibold'}>
          Fortel, your current rank is...
          <br />
          #5
        </p>
        <ImageLinkForm
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onButtonSubmit={handleButtonSubmit}
          isLoading={isLoading}
        />
        <FaceRecognition imageUrl={imageUrl} errorMessage={errorMessage} />
        <img src="https://samples.clarifai.com/metro-north.jpg" alt="" />
      </div>
    </main>
  )
}

export { MainContent }
