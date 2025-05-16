import * as React from 'react'
import { ImageLinkForm } from '@/componenets/ImageLinkForm.tsx'
import { FaceRecognition } from '@/componenets/FaceRecognition.tsx'

type ClarifaiResponse = {
  outputs: Array<{
    data: {
      regions: Array<{
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
      }>
    }
  }>
}

type RequestOptionsArgs = {
  PAT: string
  USER_ID: string
  APP_ID: string
  IMAGE_URL: string
}

async function fetchClarifaiData({ PAT, USER_ID, APP_ID, IMAGE_URL }: RequestOptionsArgs) {
  /** @see https://cors-anywhere.herokuapp.com/ */
  const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/'
  // Change these to whatever model and image URL you want to use
  const MODEL_ID = 'face-detection'

  const requestOptions = getRequestOptions({ PAT, USER_ID, APP_ID, IMAGE_URL })

  try {
    const response = await fetch(
      (import.meta.env.DEV ? CORS_PROXY : '') + 'https://api.clarifai.com/v2/models/' + MODEL_ID + '/outputs',
      requestOptions,
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status.toString()}`)
    }

    const result = (await response.json()) as ClarifaiResponse

    console.log(result)
    // Process the response data here

    const regions = result.outputs[0].data.regions

    regions.forEach((region) => {
      // Accessing and rounding the bounding box values
      const boundingBox = region.region_info.bounding_box
      const topRow = boundingBox.top_row.toFixed(3)
      const leftCol = boundingBox.left_col.toFixed(3)
      const bottomRow = boundingBox.bottom_row.toFixed(3)
      const rightCol = boundingBox.right_col.toFixed(3)

      region.data.concepts.forEach((concept) => {
        // Accessing and rounding the concept value
        const name = concept.name
        const value = concept.value.toFixed(4)

        console.log(`${name}: ${value} BBox: ${topRow}, ${leftCol}, ${bottomRow}, ${rightCol}`)
      })
    })
  } catch (error) {
    console.log('error', error)
  }
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
  // const [inputValue, setInputValue] = React.useState('https://')
  const [inputValue, setInputValue] = React.useState('https://samples.clarifai.com/metro-north.jpg')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleButtonSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    void fetchClarifaiData({
      PAT: import.meta.env.VITE_CLARIFAI_PAT,
      USER_ID: import.meta.env.VITE_CLARIFAI_USER_I,
      APP_ID: import.meta.env.VITE_CLARIFAI_APP_I,
      IMAGE_URL: inputValue,
    })
  }

  return (
    <main className="min-h-[600px] px-5 font-courier">
      <div className="mx-auto flex max-w-[var(--breakpoint-lg)] flex-col items-center gap-7">
        <p className={'text-center text-lg font-semibold'}>
          Fortel, your current rank is...
          <br />
          #5
        </p>
        <ImageLinkForm inputValue={inputValue} onInputChange={handleInputChange} onButtonSubmit={handleButtonSubmit} />
        <FaceRecognition />
        <img src="https://samples.clarifai.com/metro-north.jpg" alt="" />
      </div>
    </main>
  )
}

export { MainContent }
