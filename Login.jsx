import { useState } from "react"
import { loginUser, getKnownProfiles, forgetProfile } from "../utils/auth"
import styles from '../pages/Auth.module.css'
import logo from '../logo.png'

export default function Login({ onSuccess, onRegister }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  
  // Состояние переключения экрана: 'profile' (выбор аватарки) или 'form' (ввод пароля)
  const [viewMode, setViewMode] = useState("profile")

  const [loading, setLoading] = useState(false)

  // Профили, которыми уже входили на этом устройстве
  const [profiles, setProfiles] = useState(() => getKnownProfiles())
  const [selected, setSelected] = useState(null)

  function openProfile(p) {
    setSelected(p)
    setEmail(p.email)
    setPassword("")
    setError("")
    setViewMode("form")
  }

  function openGuest() {
    setSelected(null)
    setEmail("")
    setPassword("")
    setError("")
    setViewMode("form")
  }

  function removeProfile(e, p) {
    e.stopPropagation()
    forgetProfile(p.id)
    setProfiles(getKnownProfiles())
  }

  async function submit(e) {
    e.preventDefault()
    if (loading) return

    setLoading(true)
    const result = await loginUser(email, password)
    setLoading(false)

    if (!result.success) {
      setError(result.message || "Invalid email or password")
      return
    }

    onSuccess()
  }

  return (
    <div className={styles.wrapper}>
      {/* Мягкая виньетка поверх фонового коллажа для читаемости */}
      <div className={styles.vignetteOverlay} />

      {viewMode === "profile" ? (
        /* ЭКРАН ПРИВЕТСТВИЯ NETFLIX: "WHO'S WATCHING?" */
        <div className={styles.profileContainer}>
          <img src={logo} alt="MR" className={styles.authLogoTop} />
          <h1 className={styles.profileTitle}>Who's watching?</h1>
          
          <div className={styles.avatarGrid}>

            {profiles.map(p => (
              <div key={p.id} className={styles.avatarWrapper} onClick={() => openProfile(p)}>
                <div className={`${styles.squareAvatar} ${styles.profileTile}`}>
                  <span>{(p.username || "?")[0].toUpperCase()}</span>

                  {p.avatar && (
                    <img
                      src={p.avatar}
                      alt={p.username}
                      className={`${styles.squareImg} ${styles.tileImg}`}
                      onError={(e) => { e.target.style.display = "none" }}
                    />
                  )}

                  <button
                    type="button"
                    className={styles.removeProfile}
                    title="Remove from this device"
                    aria-label={`Remove ${p.username} from this device`}
                    onClick={(e) => removeProfile(e, p)}
                  >
                    ✕
                  </button>
                </div>
                <span className={styles.avatarName}>{p.username}</span>
              </div>
            ))}

            <div className={styles.avatarWrapper} onClick={openGuest}>
              <div className={styles.squareAvatar}>
                G
              </div>
              <span className={styles.avatarName}>Guest</span>
            </div>
          </div>
        </div>
      ) : (
        /* ЭКРАН ВВОДА ПАРОЛЯ И ЕМАЙЛА */
        <form className={styles.card} onSubmit={submit}>
          <img src={logo} alt="MR" className={styles.authLogo} />

          {selected && (
            <div className={styles.selectedProfile}>
              <div className={styles.miniAvatar}>
                <span>{(selected.username || "?")[0].toUpperCase()}</span>
                {selected.avatar && (
                  <img
                    src={selected.avatar}
                    alt=""
                    className={styles.tileImg}
                    onError={(e) => { e.target.style.display = "none" }}
                  />
                )}
              </div>
              <span className={styles.selectedName}>{selected.username}</span>
            </div>
          )}

          <input
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus={!!selected}
            required
          />

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" disabled={loading}>{loading ? "..." : "Login"}</button>

          <div className={styles.authLinks}>
            <span onClick={() => setViewMode("profile")} className={styles.backBtn}>
              ← Back
            </span>
            <span onClick={onRegister}>
              Create account
            </span>
          </div>
        </form>
      )}
    </div>
  )
}
