import React, { useState } from 'react'

import Movies from './pages/Movies'
import TV from './pages/TV'
import History from './pages/History'

import Login from './pages/Login'
import Register from './pages/Register'

import logo from './logo.png'

import {
  currentUser,
  logoutUser
} from './utils/auth'

import styles from './App.module.css'

export default function App() {

  const [user, setUser] = useState(currentUser())
  const [authPage, setAuthPage] = useState('login')

  const [tab, setTab] = useState('movies')

  const [libraryItem, setLibraryItem] = useState(null)

  function handleLibraryClick(item) {

    setLibraryItem(item)

    if (item.type === 'movie') {
      setTab('movies')
    }

    if (item.type === 'tv') {
      setTab('tv')
    }

  }

  if (!user) {

    return authPage === 'login'

      ? (

        <Login
          onSuccess={() => setUser(currentUser())}
          onRegister={() => setAuthPage('register')}
        />

      )

      : (

        <Register
          onSuccess={() => setUser(currentUser())}
          onLogin={() => setAuthPage('login')}
        />

      )

  }

  return (

    <div className={styles.app}>

      <header className={styles.header}>

        <button className={styles.logo}>

          <img
            src={logo}
            alt="MR"
            className={styles.logoImg}
          />

        </button>

        <nav className={styles.tabs}>

          <button
            className={`${styles.tab} ${
              tab === 'movies'
                ? styles.active
                : ''
            }`}
            onClick={() => setTab('movies')}
          >
            Movies
          </button>

          <button
            className={`${styles.tab} ${
              tab === 'tv'
                ? styles.active
                : ''
            }`}
            onClick={() => setTab('tv')}
          >
            TV
          </button>

          <button
            className={`${styles.tab} ${
              tab === 'library'
                ? styles.active
                : ''
            }`}
            onClick={() => setTab('library')}
          >
            Library
          </button>

        </nav>

        <div className={styles.userBox}>

          <span>
            {user.username}
          </span>

          <button
            className={styles.logout}
            onClick={() => {

              logoutUser()
              setUser(null)

            }}
          >
            Logout
          </button>

        </div>

      </header>

      <main className={styles.main}>

        {tab === 'movies' && (

          <Movies
            libraryItem={libraryItem}
          />

        )}

        {tab === 'tv' && (

          <TV
            libraryItem={libraryItem}
          />

        )}

        {tab === 'library' && (

          <History
            onMovieClick={handleLibraryClick}
          />

        )}

      </main>

    </div>

  )

}