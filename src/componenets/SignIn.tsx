import * as React from 'react'

const SignIn = (): React.JSX.Element => {
  const dialogRef = React.useRef<HTMLDialogElement>(null)

  return (
    <>
      <button className="btn" onClick={() => document.getElementById('my_modal_3').showModal()}>
        open modal
      </button>
      <dialog id="my_modal_3" className="modal" ref={dialogRef}>
        <div className="modal-box">
          <form method="dialog">
            <button className="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm">✕</button>
          </form>
          <h3 className="text-lg font-bold">Hello!</h3>
          <p className="py-4">Press ESC key or click on ✕ button to close</p>
        </div>
      </dialog>
    </>
  )
}

export { SignIn }
