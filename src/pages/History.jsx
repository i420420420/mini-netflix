import React, { useEffect, useState } from 'react'
import {
  getLibrary,
  toggleFavorite
} from '../utils/auth'

import { posterUrl } from '../lib/api'

import styles from './History.module.css'

export default function History({ onMovieClick }) {

  const [library, setLibrary] = useState(
    getLibrary()
  )

  useEffect(() => {

    setLibrary(
      getLibrary()
    )

  }, [])

  function refresh() {

    setLibrary(
      getLibrary()
    )

  }

  function removeFavorite(item) {

    toggleFavorite(item)

    refresh()

  }

  function handleClick(item) {

    if (!onMovieClick) return

    onMovieClick(item)

  }

  function renderCard(item) {

    const isFavorite = library.favorites.some(
      x =>
        x.id === item.id &&
        x.type === item.type
    )

    return (

      <div
        key={`${item.type}-${item.id}-${item.season || 0}-${item.episode || 0}`}
        className={styles.card}
        onClick={() => handleClick(item)}
        style={{ cursor: 'pointer' }}
      >

        <img
          src={posterUrl(item.poster)}
          alt={item.title}
          className={styles.poster}
        />

        <div className={styles.info}>

          <h3>
            {item.title}
          </h3>

          {item.year && (
            <p>
              {item.year}
            </p>
          )}

          {item.rating && (
            <p>
              ⭐ {item.rating}
            </p>
          )}

          {item.season && (
            <p>
              Season {item.season}
              {' '}
              Episode {item.episode}
            </p>
          )}

          {isFavorite && (

            <button
              onClick={(e) => {

                e.stopPropagation()

                removeFavorite(item)

              }}
            >
              Remove Favorite
            </button>

          )}

        </div>

      </div>

    )

  }

  return (

    <div className={styles.page}>

      <section>

        <h2>
          ▶&nbsp;&nbsp;Continue Watching
        </h2>

        <div className={styles.grid}>

          {library.continueWatching.length === 0
            ? (
              <p>
                Nothing yet
              </p>
            )
            : library.continueWatching.map(renderCard)
          }

        </div>

      </section>

      <section>

        <h2>
          ❤️ Favorites
        </h2>

        <div className={styles.grid}>

          {library.favorites.length === 0
            ? (
              <p>
                Nothing yet
              </p>
            )
            : library.favorites.map(renderCard)
          }

        </div>

      </section>

      <section>

        <h2>
          🕒 Watch History
        </h2>

        <div className={styles.grid}>

          {library.history.length === 0
            ? (
              <p>
                Nothing yet
              </p>
            )
            : library.history.map(renderCard)
          }

        </div>

      </section>

    </div>

  )

}