import React, { useState, useEffect, useRef } from 'react'
import {
  api,
  tvEmbedUrl,
  formatRating,
  getYear
} from '../lib/api.js'

import MediaGrid from '../components/MediaGrid.jsx'
import Player from '../components/Player.jsx'
import SeasonPicker from '../components/SeasonPicker.jsx'

import {
  addToHistory,
  addContinueWatching
} from '../utils/auth.js'

import styles from './TV.module.css'

function persist(key, val) {
  try {
    sessionStorage.setItem(key, JSON.stringify(val))
  } catch {}
}

function hydrate(key) {
  try {
    const v = sessionStorage.getItem(key)
    return v ? JSON.parse(v) : null
  } catch {
    return null
  }
}

export default function TV({ libraryItem }) {

  const [query, setQuery] = useState(
    () => hydrate('tv_query') || ''
  )

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  const [selected, setSelected] = useState(
    () => hydrate('tv_selected')
  )

  const [player, setPlayer] = useState(null)
  const [showPicker, setShowPicker] = useState(false)

  const playerAnchorRef = useRef(null)
  const didRestore = useRef(false)

  useEffect(() => {

    const savedQuery = hydrate('tv_query') || ''

    if (savedQuery) {

      api.searchTV(savedQuery)
        .then(d => setResults(d.results || []))
        .finally(() => setLoading(false))

    } else {

      api.trendingTV()
        .then(d => setResults(d.results || []))
        .finally(() => setLoading(false))

    }

  }, [])

  useEffect(() => {

    if (didRestore.current) return

    const savedPlayer = hydrate('tv_player')

    if (savedPlayer) {

      setPlayer(savedPlayer)
      setShowPicker(false)

      didRestore.current = true

    }

  }, [])

  /*
  |--------------------------------------------------------------------------
  | OPEN FROM CONTINUE WATCHING
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (!libraryItem) return

    if (libraryItem.type !== 'tv') return

    openFromLibrary(libraryItem)

  }, [libraryItem])

  async function openFromLibrary(item) {

    try {

      const show = await api.tvDetails(item.id)

      setSelected(show)

      persist('tv_selected', show)

      setShowPicker(true)

      await handlePlay(
        item.season || 1,
        item.episode || 1,
        show
      )

    } catch (e) {

      console.error(e)

      alert('Ошибка открытия сериала')

    }

  }

  async function search(e) {

    e.preventDefault()

    const q = query.trim()

    if (!q) return

    setLoading(true)
    setResults([])

    persist('tv_query', q)

    const d = await api.searchTV(q)

    setResults(d.results || [])
    setLoading(false)

  }

  function selectShow(item) {

    setSelected(item)

    persist('tv_selected', item)

    setShowPicker(true)
    setPlayer(null)

    setTimeout(() => {

      document
        .getElementById('season-picker-anchor')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })

    }, 80)

  }

  async function handlePlay(
    season,
    episode,
    customShow = null
  ) {

    const show = customShow || selected

    if (!show) return

    try {

      const src = await tvEmbedUrl(
        show.id,
        season,
        episode
      )

      if (!src) {

        alert('Kodik не нашёл сериал')

        return

      }

      const p = {

        src,

        title: show.name,

        year: getYear(
          show.first_air_date
        ),

        rating: formatRating(
          show.vote_average
        ),

        overview: show
          .overview
          ?.slice(0, 220),

        badge: `S${season} · E${episode}`,

        selectedId: show.id

      }

      setPlayer(p)

      persist('tv_player', p)

      const historyItem = {

        id: show.id,

        type: 'tv',

        title: show.name,

        poster: show.poster_path,

        year: getYear(
          show.first_air_date
        ),

        rating: formatRating(
          show.vote_average
        ),

        season,
        episode

      }

      addToHistory(historyItem)
      addContinueWatching(historyItem)

      setTimeout(() => {

        playerAnchorRef.current
          ?.scrollIntoView({

            behavior: 'smooth',
            block: 'start'

          })

      }, 80)

    } catch (e) {

      console.error(e)

      alert('Ошибка загрузки сериала')

    }

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
            setQuery(e.target.value)
          }
          placeholder="Search TV series..."
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

        <div ref={playerAnchorRef}>

          <Player
            {...player}
            onClose={() => {

              setPlayer(null)

              persist(
                'tv_player',
                null
              )

            }}
          />

        </div>

      )}

      {selected && showPicker && (

        <div id="season-picker-anchor">

          <SeasonPicker
            show={selected}
            onPlay={handlePlay}
          />

        </div>

      )}

      <p className={styles.sectionLabel}>

        {hydrate('tv_query')
          ? 'Results'
          : 'Trending Now'}

      </p>

      <MediaGrid
        items={results}
        type="tv"
        loading={loading}
        onSelect={selectShow}
        selectedId={selected?.id}
      />

    </div>

  )

}