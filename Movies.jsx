import React, {
  useState,
  useEffect,
  useRef
} from 'react'

import {
  api,
  movieEmbedUrl,
  PLAYER_ENABLED,
  posterUrl,
  formatRating,
  getYear
} from '../lib/api.js'

import MediaGrid from '../components/MediaGrid.jsx'
import MyListButton from '../components/MyListButton.jsx'
import Player from '../components/Player.jsx'
import Top10Row from '../components/Top10Row.jsx'

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

    const v =
      sessionStorage.getItem(key)

    return v
      ? JSON.parse(v)
      : null

  } catch {

    return null

  }

}


export default function Movies({
  libraryItem,
  search = ''
}) {

  const savedPlayer =
    hydrate('mv_player')

  const [results, setResults] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [player, setPlayer] =
    useState(savedPlayer)

  const [heroIndex, setHeroIndex] =
    useState(0)

  const playerAnchorRef =
    useRef(null)


  /*
  |--------------------------------------------------------------------------
  | LOAD MOVIES
  |--------------------------------------------------------------------------
  */

  // Loads trending movies, or search results when the header search box has text
  useEffect(() => {

    const q = (search || '').trim()
    let cancelled = false

    const timer = setTimeout(async () => {

      setLoading(true)
      setHeroIndex(0)

      try {

        const d = q
          ? await api.searchMovies(q)
          : await api.trendingMovies()

        if (!cancelled) {
          setResults(d.results || [])
        }

      } catch (e) {

        console.error(e)

        if (!cancelled) {
          setResults([])
        }

      } finally {

        if (!cancelled) {
          setLoading(false)
        }

      }

    }, q ? 350 : 0)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }

  }, [search])


  /*
  |--------------------------------------------------------------------------
  | HERO ROTATION
  |--------------------------------------------------------------------------
  */

  const heroMovies =
    results
      .filter(item =>
        item.backdrop_path
      )
      .slice(0, 5)


  useEffect(() => {

    if (heroMovies.length <= 1) {
      return
    }

    const interval =
      setInterval(() => {

        setHeroIndex(prev =>
          (prev + 1) %
          heroMovies.length
        )

      }, 8000)

    return () =>
      clearInterval(interval)

  }, [heroMovies.length])


  useEffect(() => {

    if (
      heroIndex >= heroMovies.length
    ) {

      setHeroIndex(0)

    }

  }, [
    heroIndex,
    heroMovies.length
  ])


  /*
  |--------------------------------------------------------------------------
  | OPEN FROM LIBRARY
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (!libraryItem) {
      return
    }

    if (
      libraryItem.type !== 'movie'
    ) {
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


  /*
  |--------------------------------------------------------------------------
  | SELECT MOVIE
  |--------------------------------------------------------------------------
  */

  async function select(item) {

    try {

      const src =
        await movieEmbedUrl(
          item.id
        )

      if (PLAYER_ENABLED && !src) {

        alert(
          'Видео для этого фильма не найдено'
        )

        return

      }


      const p = {

        src,

        title:
          item.title,

        year:
          getYear(
            item.release_date
          ),

        rating:
          formatRating(
            item.vote_average
          ),

        overview:
          item.overview
            ?.slice(0, 220),

        /*
         * High-resolution backdrop.
         * api.js now supports the "xl" size.
         */
        backdrop:
          posterUrl(
            item.backdrop_path,
            'xl'
          ),

        selectedId:
          item.id

      }


      setPlayer(p)

      persist(
        'mv_player',
        p
      )


      const historyItem = {

        id:
          item.id,

        type:
          'movie',

        title:
          item.title,

        poster:
          item.poster_path,

        year:
          getYear(
            item.release_date
          ),

        rating:
          formatRating(
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

        playerAnchorRef
          .current
          ?.scrollIntoView({

            behavior:
              'smooth',

            block:
              'start'

          })

      }, 80)

    } catch (e) {

      console.error(e)

      alert(
        'Ошибка загрузки фильма'
      )

    }

  }


  /*
  |--------------------------------------------------------------------------
  | CLOSE PLAYER
  |--------------------------------------------------------------------------
  */

  function closePlayer() {

    setPlayer(null)

    persist(
      'mv_player',
      null
    )

  }


  const currentHero =
    heroMovies[heroIndex]


  return (

    <div
      className={
        styles.moviesContainer
      }
    >

      {player ? (

        <div
          ref={
            playerAnchorRef
          }
          className={
            styles.playerWrapper
          }
        >

          <Player
            {...player}
            type="movie"
            selectedId={
              player?.selectedId
            }
            onClose={
              closePlayer
            }
          />

        </div>

      ) : (

        !search &&
        currentHero && (

          <section
            key={
              currentHero.id
            }
            className={
              styles.heroBanner
            }

            style={{
              backgroundImage:
                `url(${posterUrl(
                  currentHero.backdrop_path,
                  'xl'
                )})`
            }}
          >

            <div
              className={
                styles.heroOverlay
              }
            />

            <div
              className={
                styles.heroContent
              }
            >

              <span
                className={
                  styles.brandBadge
                }
              >
                MR S E R I E S
              </span>


              <h1
                className={
                  styles.heroTitle
                }
              >
                {currentHero.title}
              </h1>


              <p
                className={
                  styles.heroDescription
                }
              >

                {currentHero.overview &&
                currentHero.overview.length > 180

                  ? currentHero.overview.slice(
                      0,
                      currentHero.overview.lastIndexOf(
                        ' ',
                        180
                      )
                    ) + '...'

                  : currentHero.overview}

              </p>


              <div
                className={
                  styles.heroButtons
                }
              >

                <button
                  className={
                    styles.playBtn
                  }
                  onClick={() =>
                    select(currentHero)
                  }
                >
                  ▶ Watch Now
                </button>


                <button
                  className={
                    styles.infoBtn
                  }
                  onClick={() =>
                    select(currentHero)
                  }
                >
                  ⓘ More Info
                </button>

                <MyListButton
                  media={currentHero}
                  type="movie"
                />

              </div>


              {heroMovies.length > 1 && (

                <div
                  className={
                    styles.heroDots
                  }
                >

                  {heroMovies.map(
                    (_, idx) => (

                      <div
                        key={idx}
                        className={`
                          ${styles.heroDot}
                          ${
                            idx === heroIndex
                              ? styles.activeDot
                              : ''
                          }
                        `}
                        onClick={() =>
                          setHeroIndex(idx)
                        }
                      />

                    )
                  )}

                </div>

              )}

            </div>

          </section>

        )

      )}

      <div
        className={`${styles.contentRows} ${
          search && !player
            ? styles.contentRowsSearch
            : ''
        }`}
      >

        {loading ? (

          <div
            className={
              styles.loading
            }
          >
            Loading movies...
          </div>

        ) : search ? (

          <>

            <h2
              className={
                styles.rowTitle
              }
            >
              Results for "{search}"
            </h2>

            <MediaGrid
              items={results}
              type="movie"
              onSelect={select}
              selectedId={
                player?.selectedId
              }
              loading={loading}
              isSearchActive={true}
            />

          </>

        ) : (

          <>

            <h2
              className={
                styles.rowTitle
              }
            >
              Top 5 Movies Today
            </h2>

            <Top10Row
              items={results}
              type="movie"
              onSelect={select}
            />


            <h2
              className={
                styles.rowTitle
              }
            >
              Trending Now
            </h2>

            <MediaGrid
              items={results}
              type="movie"
              onSelect={select}
              selectedId={
                player?.selectedId
              }
              loading={loading}
              isSearchActive={false}
            />


            <h2
              className={
                styles.rowTitle
              }
            >
              Crowd Pleasers
            </h2>

            <MediaGrid
              items={
                [...results].reverse()
              }
              type="movie"
              onSelect={select}
              selectedId={
                player?.selectedId
              }
              loading={loading}
              isSearchActive={false}
            />


            <h2
              className={
                styles.rowTitle
              }
            >
              Top Rated Action
            </h2>

            <MediaGrid
              items={
                [...results].sort(
                  (a, b) =>
                    b.vote_average -
                    a.vote_average
                )
              }
              type="movie"
              onSelect={select}
              selectedId={
                player?.selectedId
              }
              loading={loading}
              isSearchActive={false}
            />

          </>

        )}

      </div>

    </div>

  )

}