import * as React from 'react'
import { type LoginResponse, useAuth } from '@/contexts'

/**
 * Props for the Login component
 * @param onSuccess - Callback function to execute when login is successful
 */
export type LoginProps = {
  onSuccess: () => void
}

/**
 * Component that provides a login form for user authentication
 * Handles form submission, validation, and displays error messages
 * @returns React component with login form interface
 */
const Login = ({ onSuccess }: LoginProps): React.JSX.Element => {
  const [formState, formAction, isPending] = React.useActionState<LoginResponse | null, FormData>(handleLogin, null)
  const [email, setEmail] = React.useState('')
  const { login } = useAuth()

  /**
   * Handles the login form submission
   * Extracts credentials from form data and attempts to authenticate the user
   * @param _prevState - Previous form state (unused)
   * @param formData - Form data containing email and password
   * @returns Promise resolving to login response with success status and optional error
   */
  async function handleLogin(_prevState: LoginResponse | null, formData: FormData): Promise<LoginResponse> {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const response = await login({ email, password })
    if (response.success) {
      onSuccess()
    }

    return response
  }

  return (
    <>
      {formState && formState.error && <div className="mb-2 alert alert-error">{formState.error}</div>}
      <div className="alert-soft mb-2 alert w-full max-w-lg alert-info">
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
          Test credentials: <b>admin@email.com</b> / <b>admin</b>
        </span>
      </div>
      <form action={formAction}>
        <fieldset className="fieldset space-y-1">
          <div>
            <label className="label text-sm/6 font-medium">Email</label>
            <input
              type="email"
              name="email"
              className="validator input input-lg mt-2 w-full"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <p className="validator-hint">Enter valid email address</p>
          </div>

          <div>
            <label className="label text-sm/6 font-medium">Password</label>
            <input
              type="password"
              name="password"
              className="validator input input-lg mt-2 w-full"
              placeholder="Password"
              required
              minLength={5}
            />
            <p className="validator-hint">Must be more than 4 characters</p>
          </div>

          <button className="btn text-sm/6 font-semibold btn-primary" type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <span className="loading loading-sm loading-spinner"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </fieldset>
      </form>
    </>
  )
}

export { Login }
