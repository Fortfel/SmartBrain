/* eslint-disable */
import type { Request, Response } from 'express'
// @ts-expect-error apparently ClarifaiStub isn't exported
import { ClarifaiStub, grpc } from 'clarifai-nodejs-grpc'
import { SafeUser } from '../types.js'

export type BoundingBox = {
  top_row: number
  left_col: number
  bottom_row: number
  right_col: number
}
export type ProcessedBoundingBox = {
  value: number
  topRow: string
  leftCol: string
  bottomRow: string
  rightCol: string
}

export type Concept = {
  app_id: string
  id: string
  name: string
  value: number
}

export type RegionInfo = {
  bounding_box: BoundingBox
}

export type Region = {
  id: string
  data: {
    concepts: Array<Concept>
  }
  region_info: RegionInfo
  value: number
}

export type ClarifaiResponse = {
  status: {
    code: number
    description: string
    req_id: string
  }
  outputs: Array<{
    status: {
      code: number
      description: string
    }
    data: {
      regions: Array<Region>
    }
  }>
}

export type PostModelOutputsRequest = {
  user_app_id: {
    user_id: string
    app_id: string
  }
  model_id: string
  version_id?: string
  inputs: Array<{
    data: {
      image: {
        url?: string
        base64?: Buffer
        allow_duplicate_url?: boolean
      }
    }
  }>
}

export type ClarifaiRequestBody = {
  IMAGE_URL: string
}

// Change these to whatever model and image URL you want to use
const MODEL_ID = 'face-detection'
const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105'

const stub = ClarifaiStub.grpc()

const hanfleClarifaiRequest = async (
  req: Request<object, object, ClarifaiRequestBody> & { user?: SafeUser },
  res: Response,
): Promise<void> => {
  const { IMAGE_URL } = req.body

  // This will be used by every Clarifai endpoint call
  const metadata = new grpc.Metadata()
  metadata.set('authorization', 'Key ' + process.env.CLARIFAI_PAT)

  const request = {
    user_app_id: {
      user_id: process.env.CLARIFAI_USER_ID as string,
      app_id: process.env.CLARIFAI_APP_ID as string,
    },
    model_id: MODEL_ID,
    version_id: MODEL_VERSION_ID,
    inputs: [
      {
        data: {
          image: {
            url: IMAGE_URL,
            // "base64": imageBytes
            // allow_duplicate_url: true,
          },
        },
      },
    ],
  } satisfies PostModelOutputsRequest

  try {
    stub.PostModelOutputs(request, metadata, (err: Error | null, response: ClarifaiResponse) => {
      if (err) {
        console.error('Error processing image:', err)
        res.status(500).json({ error: 'Error processing image' })
        return
      }

      if (response.status.code !== 10000) {
        console.error('Post model outputs failed, status: ' + response.status.description)
        res.status(500).json({ error: 'Error processing image' })
        return
      }

      const regions = response.outputs[0].data.regions

      const boundingBoxes = regions.map((region) => {
        // Accessing and rounding the bounding box values
        const boundingBox = region.region_info.bounding_box
        const topRow = boundingBox.top_row.toFixed(3)
        const leftCol = boundingBox.left_col.toFixed(3)
        const bottomRow = boundingBox.bottom_row.toFixed(3)
        const rightCol = boundingBox.right_col.toFixed(3)
        const value = region.value

        // region.data.concepts.forEach((concept) => {
        //   // Accessing and rounding the concept value
        //   const name = concept.name
        //   const value = concept.value.toFixed(4)
        //
        //   console.log(`${name}: ${value} BBox: ${topRow}, ${leftCol}, ${bottomRow}, ${rightCol}`)
        // })

        return {
          value,
          topRow,
          leftCol,
          bottomRow,
          rightCol,
        } satisfies ProcessedBoundingBox
      })

      res.json(boundingBoxes)
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error processing image' })
  }
}

export { hanfleClarifaiRequest }
