import { useState } from "react"
import { loginUser } from "../utils/auth"
import styles from '../pages/Auth.module.css'
import logo from '../logo.png'

export default function Login({ onSuccess, onRegister }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  function submit(e) {
    e.preventDefault()

    const result = loginUser(email, password)

    if (!result.success) {
      setError("Invalid email or password")
      return
    }

    onSuccess()
  }

  return (
    <div className={styles.wrapper}>
      <form className={styles.card} onSubmit={submit}>
        
        <img src={logo} alt="MR" className={styles.authLogo} />

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

        <button>Login</button>

        <span onClick={onRegister}>
          Create account
        </span>
      </form>
    </div>
  )
}