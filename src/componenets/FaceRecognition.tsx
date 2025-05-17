import * as React from 'react'

type FaceRecognitionProps = {
  imageUrl: string
  errorMessage: string
}

const FaceRecognition = ({ imageUrl, errorMessage }: FaceRecognitionProps): React.JSX.Element => {
  return (
    <div className="flex w-full flex-col items-center">
      {imageUrl && errorMessage.length === 0 && (
        <div className="relative">
          <img src={imageUrl} alt="face recognition result" className="w-full max-w-lg" />
        </div>
      )}
      {errorMessage.length > 0 && (
        <>
          <div className="alert-soft alert w-full max-w-lg alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <span className="text-sm">{errorMessage}</span>
            </div>
          </div>
          {imageUrl && (
            <div className="relative">
              <img src={imageUrl} alt="face recognition result" className="w-full max-w-lg" />
            </div>
          )}
        </>
      )}
      {!imageUrl && errorMessage.length === 0 && (
        <div className="alert-soft alert w-full max-w-lg alert-info">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="h-6 w-6 shrink-0 stroke-current"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>Enter an image URL and click Detect to analyze faces</span>
        </div>
      )}
    </div>
  )
}

export { FaceRecognition }
