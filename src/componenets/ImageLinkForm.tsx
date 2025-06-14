import * as React from 'react'
import { useAuth } from '@/contexts'

type ImageLinkFormProps = {
  inputValue: string
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onPictureSubmit: (event: React.MouseEvent<HTMLButtonElement>) => void
  isLoading: boolean
}

const ImageLinkForm = ({
  inputValue,
  onInputChange,
  onPictureSubmit,
  isLoading,
}: ImageLinkFormProps): React.JSX.Element => {
  const { user } = useAuth()

  const inputRef = React.useRef<HTMLInputElement>(null)

  // Check validity before calling onPictureSubmit
  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (inputRef.current && inputRef.current.validity.valid) {
      onPictureSubmit(event)
    }
  }

  return (
    <section className={'flex flex-col items-center gap-4'}>
      <p className={'text-center text-lg font-semibold'}>
        This Magic Brain will detect faces in your pictures. Give it a try!
      </p>
      <div className="join w-full max-w-lg">
        <div className={'grow-1'}>
          <label className="validator input input-lg join-item w-full">
            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2.5" fill="none" stroke="currentColor">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </g>
            </svg>
            <input
              ref={inputRef}
              type="url"
              required
              placeholder="https://"
              value={inputValue}
              pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9\-].*[a-zA-Z0-9])?\.)+[a-zA-Z].*$"
              title="Must be valid URL"
              onChange={onInputChange}
            />
          </label>
          <p className="validator-hint">Must be valid URL</p>
        </div>
        <button
          className="btn join-item btn-lg btn-secondary"
          onClick={handleButtonClick}
          disabled={isLoading || !user}
        >
          {isLoading ? (
            <>
              <span className="loading loading-sm loading-spinner"></span>
              Detect
            </>
          ) : (
            'Detect'
          )}
        </button>
      </div>
    </section>
  )
}

export { ImageLinkForm }
