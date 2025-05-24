import * as React from 'react'

type SignInProps = {
  ref: React.RefObject<HTMLDialogElement>
}

const SignIn = ({ ref }: SignInProps): React.JSX.Element => {
  return (
    <dialog id="my_modal" className="modal" ref={ref}>
      <div className="modal-box">
        <form method="dialog">
          <button className="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm">✕</button>
        </form>
        <h3 className="text-lg font-bold">Hello!</h3>
        <p className="py-4">Press ESC key or click on ✕ button to close</p>
      </div>
    </dialog>
  )
}

export { SignIn }
