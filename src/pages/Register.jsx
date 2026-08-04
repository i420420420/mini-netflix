import { useState } from "react"
import { registerUser } from "../utils/auth"
import styles from "./Auth.module.css"
import logo from '../logo.png'

export default function Register({ onSuccess, onLogin }) {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  function submit(e) {
    e.preventDefault()

    const result = registerUser(
      username,
      email,
      password
    )

    if (!result.success) {
      setError(result.message)
      return
    }

    onSuccess()
  }

  return (
    <div className={styles.wrapper}>
      <form className={styles.card} onSubmit={submit}>

        <img src={logo} alt="MR" className={styles.authLogo} />

        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        {error && <p className={styles.error}>{error}</p>}

        <button>Create account</button>

        <span onClick={onLogin}>
          Already have an account?
        </span>
      </form>
    </div>
  )
}