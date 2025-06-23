import * as React from 'react'
import { type RegisterResponse, useAuth } from '@/contexts'

/**
 * Props for the Register component
 * @param onSuccess - Callback function to execute when registration is successful
 */
export type RegisterProps = {
  onSuccess: () => void
}

/**
 * Component that provides a registration form for new user accounts
 * Handles form submission, validation, and displays error messages
 * @returns React component with registration form interface
 */
const Register = ({ onSuccess }: RegisterProps): React.JSX.Element => {
  const [formState, formAction, isPending] = React.useActionState<RegisterResponse | null, FormData>(
    handleRegister,
    null,
  )
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const { register } = useAuth()

  /**
   * Handles the registration form submission
   * Extracts user details from form data and attempts to create a new account
   * @param _prevState - Previous form state (unused)
   * @param formData - Form data containing name, email and password
   * @returns Promise resolving to registration response with success status and optional error
   */
  async function handleRegister(_prevState: RegisterResponse | null, formData: FormData): Promise<RegisterResponse> {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const response = await register({ name, email, password })
    if (response.success) {
      onSuccess()
    }

    return response
  }

  return (
    <>
      {formState && formState.error && <div className="mb-2 alert alert-error">{formState.error}</div>}
      <form action={formAction}>
        <fieldset className="fieldset space-y-1">
          <div>
            <label className="label text-sm/6 font-medium">Name</label>
            <input
              type="name"
              name="name"
              className="validator input input-lg mt-2 w-full"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <p className="validator-hint">Enter your name</p>
          </div>

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
                Registering...
              </>
            ) : (
              'Register'
            )}
          </button>
        </fieldset>
      </form>
    </>
  )
}

export { Register }
