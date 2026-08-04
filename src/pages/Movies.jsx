import React, {
  useState,
  useEffect,
  useRef
} from 'react'

import {
  api,
  movieEmbedUrl,
  formatRating,
  getYear
} from '../lib/api.js'

import MediaGrid from '../components/MediaGrid.jsx'
import Player from '../components/Player.jsx'

import {
  addToHistory,
  addContinueWatching
} from '../utils/auth.js'

import styles from './Movies.module.css'

function persist(key, val) {
  try {
    sessionStorage.setItem(
      key,
      JSON.stringify(val)
    )
  } catch {}
}

function hydrate(key) {
  try {
    const v = sessionStorage.getItem(key)

    return v
      ? JSON.parse(v)
      : null

  } catch {

    return null

  }
}

export default function Movies({
  libraryItem
}) {

  const savedQuery =
    hydrate('mv_query') || ''

  const savedPlayer =
    hydrate('mv_player')

  const [query, setQuery] =
    useState(savedQuery)

  const [results, setResults] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [label, setLabel] =
    useState(
      savedQuery
        ? 'Results'
        : 'Trending Now'
    )

  const [player, setPlayer] =
    useState(savedPlayer)

  const playerAnchorRef =
    useRef(null)

  useEffect(() => {

    if (savedQuery) {

      api
        .searchMovies(savedQuery)
        .then(d =>
          setResults(
            d.results || []
          )
        )
        .finally(() =>
          setLoading(false)
        )

    } else {

      api
        .trendingMovies()
        .then(d =>
          setResults(
            d.results || []
          )
        )
        .finally(() =>
          setLoading(false)
        )

    }

  }, [])

  /*
  |--------------------------------------------------------------------------
  | OPEN FROM CONTINUE WATCHING
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (!libraryItem) return

    if (libraryItem.type !== 'movie') {
      return
    }

    openMovieFromLibrary(
      libraryItem.id
    )

  }, [libraryItem])

  async function openMovieFromLibrary(
    movieId
  ) {

    try {

      const movie =
        await api.movieDetails(
          movieId
        )

      await select(movie)

    } catch (e) {

      console.error(e)

      alert(
        'Ошибка открытия фильма'
      )

    }

  }

  async function search(e) {

    e.preventDefault()

    const q = query.trim()

    if (!q) return

    setLoading(true)

    setLabel('Results')

    setResults([])

    persist(
      'mv_query',
      q
    )

    const d =
      await api.searchMovies(q)

    setResults(
      d.results || []
    )

    setLoading(false)

  }

  async function select(item) {

    try {

      const src =
        await movieEmbedUrl(
          item.id
        )

      if (!src) {

        alert(
          'Kodik не нашёл этот фильм'
        )

        return

      }

      const p = {

        src,

        title: item.title,

        year: getYear(
          item.release_date
        ),

        rating: formatRating(
          item.vote_average
        ),

        overview: item
          .overview
          ?.slice(0, 220),

        selectedId: item.id

      }

      setPlayer(p)

      persist(
        'mv_player',
        p
      )

      const historyItem = {

        id: item.id,

        type: 'movie',

        title: item.title,

        poster: item.poster_path,

        year: getYear(
          item.release_date
        ),

        rating: formatRating(
          item.vote_average
        )

      }

      addToHistory(
        historyItem
      )

      addContinueWatching(
        historyItem
      )

      setTimeout(() => {

        playerAnchorRef.current
          ?.scrollIntoView({

            behavior: 'smooth',

            block: 'start'

          })

      }, 80)

    } catch (e) {

      console.error(e)

      alert(
        'Ошибка загрузки фильма'
      )

    }

  }

  function closePlayer() {

    setPlayer(null)

    persist(
      'mv_player',
      null
    )

  }

  return (

    <div>

      <form
        className={styles.searchRow}
        onSubmit={search}
      >

        <input
          value={query}
          onChange={e =>
            setQuery(
              e.target.value
            )
          }
          placeholder="Search movies..."
          className={styles.input}
        />

        <button
          type="submit"
          className={styles.btn}
        >
          Search
        </button>

      </form>

      {player && (

        <div
          ref={playerAnchorRef}
        >

          <Player
            {...player}
            onClose={
              closePlayer
            }
          />

        </div>

      )}

      <p
        className={
          styles.sectionLabel
        }
      >
        {label}
      </p>

      <MediaGrid
        items={results}
        type="movie"
        loading={loading}
        onSelect={select}
        selectedId={
          player?.selectedId
        }
      />

    </div>

  )

}