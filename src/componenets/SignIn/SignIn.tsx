import * as React from 'react'
import SvgBrain from '@/assets/img/Brain.tsx'
import { Login } from '@/componenets/SignIn/Login.tsx'
import { Register } from '@/componenets/SignIn/Register.tsx'

type SignInProps = {
  ref: React.RefObject<HTMLDialogElement>
}

const SignIn = ({ ref }: SignInProps): React.JSX.Element => {
  const [route, setRoute] = React.useState('login')

  const isLoginRoute = route === 'login'

  return (
    <dialog id="my_modal" className="modal" ref={ref}>
      <div className="modal-box sm:p-10">
        <SvgBrain className="hidden size-8 w-full justify-center fill-current sm:flex" />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight">
          Sign {isLoginRoute ? 'In to your account' : 'Up'}
        </h2>

        <div className="mt-10">
          <form method="dialog">
            <button className="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm">✕</button>
            {isLoginRoute ? <Login /> : <Register />}
          </form>

          {isLoginRoute ? (
            <p className="mt-5 text-center text-sm/6 text-base-content/50">
              Don't have an account?{' '}
              <button
                className="btn p-0 align-baseline font-semibold text-primary btn-link no-underline"
                onClick={() => setRoute('register')}
              >
                Register
              </button>
            </p>
          ) : (
            <button
              className="btn mt-5 p-0 align-baseline font-semibold text-primary btn-link no-underline"
              onClick={() => setRoute('login')}
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
