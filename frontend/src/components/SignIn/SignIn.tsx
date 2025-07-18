import * as React from 'react'
import SvgBrain from '@/assets/img/Brain.tsx'
import { Login } from '@/components/SignIn/Login.tsx'
import { Register } from '@/components/SignIn/Register.tsx'

/**
 * Props for the SignIn component
 * @param ref - Reference to the dialog element for controlling modal visibility
 */
export type SignInProps = {
  ref: React.RefObject<HTMLDialogElement | null>
}

/**
 * Modal component that handles user authentication
 * Provides both login and registration interfaces with toggling between them
 * @returns React component with authentication modal dialog
 */
const SignIn = ({ ref }: SignInProps): React.JSX.Element => {
  const [route, setRoute] = React.useState('login')

  const isLoginRoute = route === 'login'

  /**
   * Closes the authentication modal dialog
   */
  const closeModal = (): void => {
    ref.current?.close()
  }

  return (
    <dialog
      id="my_modal"
      className="modal"
      ref={ref}
      onTransitionEnd={(e) => {
        if (e.target === ref.current && !ref.current.open) {
          setRoute('login')
        }
      }}
    >
      <div className="modal-box sm:p-10">
        <SvgBrain className="hidden size-8 w-full justify-center fill-current sm:flex" />
        <button type="button" className="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm" onClick={closeModal}>
          ✕
        </button>
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight">
          Sign {isLoginRoute ? 'In to your account' : 'Up'}
        </h2>
        <div className="mt-5">
          {isLoginRoute ? <Login onSuccess={closeModal} /> : <Register onSuccess={closeModal} />}

          {isLoginRoute ? (
            <p className="mt-5 text-center text-sm/6 text-base-content/50">
              Don't have an account?{' '}
              <button
                type="button"
                className="btn p-0 align-baseline font-semibold text-primary btn-link no-underline"
                onClick={() => {
                  setRoute('register')
                }}
              >
                Register
              </button>
            </p>
          ) : (
            <button
              type="button"
              className="btn mt-5 p-0 align-baseline font-semibold text-primary btn-link no-underline"
              onClick={() => {
                setRoute('login')
              }}
            >
              Back
            </button>
          )}
        </div>
      </div>
    </dialog>
  )
}

export { SignIn }
