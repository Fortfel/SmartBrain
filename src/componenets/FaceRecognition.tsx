import * as React from 'react'

import placeholder from '@/assets/img/placeholder.png'
import { useAuth } from '@/contexts/AuthContext.tsx'

export type BoundingBox = {
  value: number
  topRow: string
  leftCol: string
  bottomRow: string
  rightCol: string
}

type FaceRecognitionProps = {
  imageUrl: string
  errorMessage: string
  faceRegions: Array<BoundingBox>
}

const FaceRecognition = ({ imageUrl, errorMessage, faceRegions }: FaceRecognitionProps): React.JSX.Element => {
  const { user } = useAuth()

  return (
    <div className="flex w-full flex-col items-center">
      {errorMessage.length > 0 && (
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
            <span className="text-sm">{errorMessage}</span>
          </div>
        </div>
      )}
      {imageUrl && (
        <div className="relative mb-5">
          <img src={imageUrl} alt="face recognition result" className="w-full max-w-lg" />
          {faceRegions.length > 0 && (
            <div className="absolute inset-0">
              {faceRegions.map((region, index) => {
                if (region.value < 0.9) return null

                const topRow = parseFloat(region.topRow)
                const leftCol = parseFloat(region.leftCol)
                const rightCol = parseFloat(region.rightCol)
                const bottomRow = parseFloat(region.bottomRow)

                return (
                  <div
                    key={index}
                    className="absolute border-2 border-[#308b93]"
                    style={{
                      top: topRow * 100 + '%',
                      left: leftCol * 100 + '%',
                      width: (rightCol - leftCol) * 100 + '%',
                      height: (bottomRow - topRow) * 100 + '%',
                    }}
                  ></div>
                )
              })}
            </div>
          )}
        </div>
      )}
      {!imageUrl && errorMessage.length === 0 && (
        <>
          {!user && (
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
          )}
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
