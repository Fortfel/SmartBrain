import * as React from 'react'

import placeholder from '@/assets/img/placeholder.png'
import { useAuth } from '@/contexts'

/**
 * Represents the bounding box coordinates for a detected face
 * @param value - Confidence value of the face detection (0-1)
 * @param topRow - Top coordinate as a percentage string
 * @param leftCol - Left coordinate as a percentage string
 * @param bottomRow - Bottom coordinate as a percentage string
 * @param rightCol - Right coordinate as a percentage string
 */
export type BoundingBox = {
  value: number
  topRow: string
  leftCol: string
  bottomRow: string
  rightCol: string
}

/**
 * Props for the FaceRecognition component
 * @param imageUrl - URL of the image to display and process
 * @param errorMessage - Error message to display if face detection fails
 * @param faceRegions - Array of detected face regions with bounding boxes
 */
export type FaceRecognitionProps = {
  imageUrl: string
  errorMessage: string
  faceRegions: Array<BoundingBox>
}

/**
 * Threshold below which a face detection is considered low confidence
 * @readonly
 */
const LOW_CONFIDENCE_THRESHOLD = 0.9

/**
 * Component that displays an image with highlighted face regions
 * Shows different UI states based on authentication status and detection results
 *
 * @returns React component displaying the image with face detection results
 */
const FaceRecognition = ({ imageUrl, errorMessage, faceRegions }: FaceRecognitionProps): React.JSX.Element => {
  const { isAuthenticated, isAuthorized } = useAuth()

  /**
   * Determines if all detected faces are below the confidence threshold
   * Used to display a "No faces detected" message when confidence is low
   */
  const areAllFacesLowConfidence =
    faceRegions.length > 0 && faceRegions.every((region) => region.value < LOW_CONFIDENCE_THRESHOLD)
  const noFacesError = areAllFacesLowConfidence ? 'No faces detected' : ''

  /**
   * Combined error message to display (either from props or low confidence)
   */
  const displayError = errorMessage || noFacesError

  return (
    <div className="flex w-full flex-col items-center">
      {displayError.length > 0 && isAuthenticated && (
        <div className="alert-soft alert w-full max-w-lg alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <span className="text-sm">{displayError}</span>
          </div>
        </div>
      )}
      {imageUrl && isAuthenticated && (
        <div className="relative mb-5">
          <img src={imageUrl} alt="face recognition result" className="w-full max-w-lg" />
          {faceRegions.length > 0 && (
            <div className="absolute inset-0">
              {faceRegions.map((region, index) => {
                if (region.value < LOW_CONFIDENCE_THRESHOLD) return null

                const topRow = parseFloat(region.topRow)
                const leftCol = parseFloat(region.leftCol)
                const rightCol = parseFloat(region.rightCol)
                const bottomRow = parseFloat(region.bottomRow)

                return (
                  <div
                    /* eslint-disable-next-line react-x/no-array-index-key */
                    key={index}
                    className="absolute border-2 border-[#308b93]"
                    style={{
                      top: (topRow * 100).toString() + '%',
                      left: (leftCol * 100).toString() + '%',
                      width: ((rightCol - leftCol) * 100).toString() + '%',
                      height: ((bottomRow - topRow) * 100).toString() + '%',
                    }}
                  ></div>
                )
              })}
            </div>
          )}
        </div>
      )}
      {isAuthenticated && !isAuthorized && (
        <div className="alert-soft mb-2 alert w-full max-w-lg alert-warning">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="h-6 w-6 shrink-0 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>
            You have to be <strong>authorized</strong> to use this feature.
          </span>
        </div>
      )}
      {!isAuthenticated && (
        <>
          <div className="alert-soft mb-2 alert w-full max-w-lg alert-warning">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="h-6 w-6 shrink-0 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>
              You have to be <strong>logged in</strong> to use this feature.
            </span>
          </div>
          <div className="alert-soft alert w-full max-w-lg alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="h-6 w-6 shrink-0 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>Enter an image URL and click Detect to find faces.</span>
          </div>
          <img src={placeholder} alt="face recognition result" className="mt-5 w-full max-w-lg" />
        </>
      )}
    </div>
  )
}

export { FaceRecognition }
