import * as React from 'react'
import { type LoginResponse, useAuth } from '@/contexts/AuthContext.tsx'

type SignInProps = {
  onSuccess: () => void
}

const Login = ({ onSuccess }: SignInProps): React.JSX.Element => {
  const [_formState, formAction, isPending] = React.useActionState<LoginResponse | null, FormData>(handleLogin, null)
  const { login } = useAuth()

  async function handleLogin(_prevState: LoginResponse | null, formData: FormData): Promise<LoginResponse> {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const response = await login({ email, password })
    if (response.success) {
      onSuccess()
    }

    console.log(response)
    return response
  }

  return (
    <form action={formAction}>
      <fieldset className="fieldset space-y-1">
        <div>
          <label className="label text-sm/6 font-medium">Email</label>
          <input
            type="email"
            name="email"
            className="validator input input-lg mt-2 w-full"
            placeholder="Email"
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
  )
}

export { Login }
