import React, { useState, useEffect } from 'react'
import { api, formatRating, getYear } from '../lib/api.js'
import MediaGrid from '../components/MediaGrid.jsx'
import Top10Row from '../components/Top10Row.jsx'
import styles from './NewAndPopular.module.css'

export default function NewAndPopular({ onMediaSelect }) {
  const [newShows, setNewShows] = useState([])
  const [topMovies, setTopMovies] = useState([])
  const [topTV, setTopTV] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAllData() {
      setLoading(true)
      try {
        // Загружаем параллельно тренды фильмов и сериалов
        const [moviesData, tvData] = await Promise.all([
          api.trendingMovies(),
          api.trendingTV()
        ])

        const movies = moviesData.results || []
        const tvShows = tvData.results || []

        // 1. Формируем секцию "New on Netflix" (Вычисляем новинки по датам за последние полгода)
        const today = new Date()
        const halfYearAgo = new Date()
        halfYearAgo.setMonth(today.getMonth() - 6)

        const filteredNew = tvShows.map(show => {
          if (show.first_air_date) {
            const airDate = new Date(show.first_air_date)
            if (airDate >= halfYearAgo && airDate <= today) {
              return { ...show, badgeText: 'New Season' }
            }
          }
          if (show.last_air_date) {
            const lastAir = new Date(show.last_air_date)
            if (lastAir >= halfYearAgo && lastAir <= today) {
              return { ...show, badgeText: 'New Episode' }
            }
          }
          return { ...show, badgeText: 'Recently Added' } // Дефолтная плашка, как на скриншоте
        })

        setNewShows(filteredNew)
        setTopMovies(movies)
        setTopTV(tvShows)
      } catch (e) {
        console.error("Ошибка загрузки раздела New & Popular:", e)
      } finally {
        setLoading(false)
      }
    }

    loadAllData()
  }, [])

  if (loading) {
    return <div className={styles.loading}>Loading New & Popular...</div>
  }

  return (
    <div className={styles.container}>
      
      {/* ЛЕНТА 1: NEW ON NETFLIX (ФОРМАТ КАРУСЕЛИ 16:9) */}
      <div className={styles.sectionRow}>
        <h2 className={styles.rowTitle}>New on Murflix</h2>
        <MediaGrid
          items={newShows}
          type="tv"
          onSelect={onMediaSelect}
          loading={loading}
          isSearchActive={false}
        />
      </div>

      {/* ЛЕНТА 2: TOP 5 TV SHOWS (ГИГАНТСКИЕ ЦИФРЫ) */}
      <div className={styles.sectionRow}>
        <h2 className={styles.rowTitle}>Top 5 TV Programmes Today</h2>
        <Top10Row
          items={topTV}
          type="tv"
          onSelect={onMediaSelect}
        />
      </div>

      {/* ЛЕНТА 3: TOP 5 FILMS (ГИГАНТСКИЕ ЦИФРЫ) */}
      <div className={styles.sectionRow}>
        <h2 className={styles.rowTitle}>Top 5 Films Today</h2>
        <Top10Row
          items={topMovies}
          type="movie"
          onSelect={onMediaSelect}
        />
      </div>

    </div>
  )
}
