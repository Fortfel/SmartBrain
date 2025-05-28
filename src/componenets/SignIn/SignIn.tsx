import * as React from 'react'
import SvgBrain from '@/assets/img/Brain.tsx'
import { Login } from '@/componenets/SignIn/Login.tsx'
import { Register } from '@/componenets/SignIn/Register.tsx'

type SignInProps = {
  ref: React.RefObject<HTMLDialogElement>
}

const SignIn = ({ ref }: SignInProps): React.JSX.Element => {

  return (
    <dialog id="my_modal" className="modal" ref={ref}>
      <div className="modal-box sm:p-10">
        <SvgBrain className="hidden size-8 w-full justify-center fill-current sm:flex" />
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight">Sign in to your account</h2>

        <div className="mt-10">
          <form method="dialog">
            <button className="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm">✕</button>
            {isLogin ? <Login /> : <Register />}
          </form>
          <p className="mt-10 text-center text-sm/6 text-base-content/50">
            Don't have an account?{' '}
            <a href="#" className="font-semibold text-primary">
              Register
            </a>
          </p>
        </div>
      </div>
    </dialog>
  )
}

export { SignIn }
