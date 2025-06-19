/* eslint-disable */
import type { Request, Response, NextFunction } from 'express'
// @ts-expect-error - ClarifaiStub isn't properly typed
import { ClarifaiStub, grpc } from 'clarifai-nodejs-grpc'
import { type SafeUser } from '../types.js'
import '../config.js' // Load environment variables
import { AppError } from '../utils/errors.js'

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

// Model configuration
const MODEL_ID = 'face-detection'
const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105'

// Initialize Clarifai client
const stub = ClarifaiStub.grpc()

/**
 * Handles Clarifai API requests for face detection
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
const handleClarifaiRequest = (
  req: Request<object, object, ClarifaiRequestBody> & { user?: SafeUser },
  res: Response,
  next: NextFunction,
): void => {
  const { IMAGE_URL } = req.body

  if (!IMAGE_URL) {
    next(new AppError('Image URL is required', 400))
    return
  }

  // Set up Clarifai API authentication
  const metadata = new grpc.Metadata()
  metadata.set('authorization', `Key ${process.env.CLARIFAI_PAT as string}`)

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
        next(new AppError(`Error processing image: ${err.message}`, 500))
        return
      }

      if (response.status.code !== 10000) {
        next(new AppError(`Post model outputs failed: ${response.status.description}`, 500))
        return
      }

      // Check if we have valid outputs
      if (!response.outputs?.[0]?.data?.regions) {
        next(new AppError('No faces detected in the image', 400))
        return
      }

      const regions = response.outputs[0].data.regions

      const boundingBoxes = regions.map((region) => {
        // Extract and format bounding box values
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
  } catch (error: unknown) {
    next(new AppError('Error processing image request', 500))
  }
}

export { handleClarifaiRequest }
