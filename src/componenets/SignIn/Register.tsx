import * as React from 'react'

const Register = (): React.JSX.Element => {
  return (
    <fieldset className="fieldset space-y-6">
      <div>
        <label className="label text-sm/6 font-medium">Name</label>
        <input type="name" className="input input-lg mt-2 w-full" placeholder="Name" />
      </div>

      <div>
        <label className="label text-sm/6 font-medium">Email</label>
        <input type="email" className="input input-lg mt-2 w-full" placeholder="Email" />
      </div>

      <div>
        <label className="label text-sm/6 font-medium">Password</label>
        <input type="password" className="input input-lg mt-2 w-full" placeholder="Password" />
      </div>

      <button
        className="btn text-sm/6 font-semibold btn-primary"
        type="submit"
        onClick={(event) => event.preventDefault()}
      >
        Register
      </button>
    </fieldset>
  )
}

export { Register }
