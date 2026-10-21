import React, { useState, useEffect } from 'react'
import { api, posterUrl, movieEmbedUrl, tvEmbedUrl } from '../lib/api.js'
import ActorDetails from './ActorDetails.jsx'
import styles from './MediaCenter.module.css'

export default function MediaCenter() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(null)
  const [details, setDetails] = useState(null)
  const [cast, setCast] = useState([])
  const [query, setQuery] = useState('')
  const [type, setType] = useState('movie')
  const [showPlayer, setShowPlayer] = useState(false)
  const [hdBanner, setHdBanner] = useState(null)
  const [hdPoster, setHdPoster] = useState(null)
  const [activeActor, setActiveActor] = useState(null)

  const enrichWithGalleryPosters = async (results, currentType) => {
    return Promise.all(
      results.map(async (item) => {
        try {
          // ИСПРАВЛЕНО: Указан корректный эндпоинт официального API TMDB с косой чертой
          const res = await fetch(`https://themoviedb.org{currentType}/${item.id}/images?api_key=c11ba9b88c992211a2266d8e1283fe18`)
          if (res.ok) {
            const imgData = await res.json()
            if (imgData?.posters?.length > 0) return { ...item, galleryPoster: imgData.posters[0].file_path }
          }
        } catch (e) { console.error(e) }
        return item
      })
    )
  }

  useEffect(() => {
    setLoading(true)
    const currentType = type
    const fetchFunc = query.trim()
      ? () => (currentType === 'movie' ? api.searchMovies(query) : api.searchTV(query))
      : (currentType === 'movie' ? api.trendingMovies : api.trendingTV)

    const delayDebounce = setTimeout(() => {
      fetchFunc()
        .then(async (d) => {
          const rawResults = d?.results || d || []
          const enriched = await enrichWithGalleryPosters(rawResults, currentType)
          setItems(enriched)
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }, query.trim() ? 500 : 0)

    return () => clearTimeout(delayDebounce)
  }, [type, query])

  const handleSelect = async (item) => {
    setActive(item)
    setDetails(null)
    setCast([])
    setHdBanner(null)
    setHdPoster(null)
    setShowPlayer(false)
    setActiveActor(null)
    const isTV = type === 'tv' || !!item.name

    try {
      const detData = await (isTV ? api.tvDetails(item.id) : api.movieDetails(item.id))
      setDetails(detData)
      const castData = await (isTV ? api.tvCredits(item.id) : api.movieCredits(item.id))
      setCast(castData?.cast?.slice(0, 5) || [])

      // ИСПРАВЛЕНО: Указан корректный эндпоинт официального API TMDB с косой чертой
      const imgRes = await fetch(`https://themoviedb.org{isTV ? 'tv' : 'movie'}/${item.id}/images?api_key=c11ba9b88c992211a2266d8e1283fe18`)
      if (imgRes.ok) {
        const imgData = await imgRes.json()
        if (imgData?.backdrops?.length > 0) setHdBanner(imgData.backdrops[0].file_path)
        if (imgData?.posters?.length > 0) setHdPoster(imgData.posters[0].file_path)
      }
    } catch (err) { console.error(err) }
  }

  if (activeActor) {
    return <ActorDetails actor={activeActor} activeMedia={active} onBack={() => setActiveActor(null)} />
  }

  if (active) {
    const isTV = type === 'tv' || !!active.name
    const runtime = details?.runtime || (details?.episode_run_time && details.episode_run_time[0]) || 0
    const embedSrc = isTV ? tvEmbedUrl(active.id, 1, 1) : movieEmbedUrl(active.id)
    const eliteBannerPath = hdBanner || active.backdrop_path || active.galleryPoster || active.poster_path
    const elitePosterPath = hdPoster || active.galleryPoster || active.poster_path || details?.poster_path

    return (
      <div className={styles.assetPage}>
        {eliteBannerPath && <img src={posterUrl(eliteBannerPath, 'original')} alt="" className={styles.blurredBackground} referrerPolicy="no-referrer" />}
        
        {/* Кнопка теперь лежит на самом верху страницы, строго по структуре CSS */}
        <button className={styles.backBtn} onClick={() => setActive(null)}>← Back</button>
        
        <div className={styles.articleContainer}>
          <div className={styles.leftColumn}>
            <h1 className={styles.assetTitleFull}>{active.title || active.name}</h1>
            {showPlayer && (
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', marginBottom: '25px', background: '#000', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
                {embedSrc ? (
                  <iframe src={embedSrc} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen scrolling="no" title="Player" />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                    Плеер временно недоступен
                  </div>
                )}
              </div>
            )}
            <div className={styles.synopsisBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '20px', flexWrap: 'wrap' }}>
                <h3 className={styles.boxLabel} style={{ margin: 0 }}>Synopsis</h3>
                {!showPlayer && <button onClick={() => setShowPlayer(true)} style={{ background: '#e50914', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '4px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(229,9,20,0.3)' }}>▶ Watch Now</button>}
              </div>
              <p className={styles.synopsisText}>{active.overview || "Coming soon."}</p>
              <div className={styles.metaRow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div><strong>Format:</strong> {isTV ? 'TV Series' : 'Feature Film'}</div>
                <div><strong>Duration:</strong> {runtime ? `${Math.floor(runtime / 60)}h ${runtime % 60}m` : 'TBD'}</div>
                {isTV ? (
                  <>
                    <div><strong>Seasons:</strong> {details?.number_of_seasons || '-'}</div>
                    <div><strong>Episodes:</strong> {details?.number_of_episodes || '-'}</div>
                  </>
                ) : (
                  <>
                    <div><strong>Budget:</strong> {details?.budget ? `$${details.budget.toLocaleString()}` : 'Pending'}</div>
                    <div><strong>Revenue:</strong> {details?.revenue ? `$${details.revenue.toLocaleString()}` : 'Pending'}</div>
                  </>
                )}
              </div>
              <div className={styles.castSection}>
                <h3 className={styles.boxLabel}>Starring Cast</h3>
                <div className={styles.castList}>
                  {cast.map((actor, idx) => (
                    <div key={idx} className={styles.actorCard} onClick={() => setActiveActor(actor)} style={{ cursor: 'pointer' }}>
                      <div className={styles.avatarWrapper}><img src={actor.profile_path ? posterUrl(actor.profile_path) : 'https://placehold.co'} alt="" className={styles.actorAvatar} referrerPolicy="no-referrer" /></div>
                      <div className={styles.actorName}>{actor.name}</div>
                      <div className={styles.characterName}>{actor.character}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.rightColumn}>
            <div className={styles.posterWrapper}><img src={elitePosterPath ? posterUrl(elitePosterPath, 'large') : 'https://placehold.co'} alt="" className={styles.mainAssetImg} referrerPolicy="no-referrer" /></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <section className={styles.heroSection}>
        <div className={styles.colorGlowOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.mainTitle}>Discover stories and experiences.</h1>
          <input type="text" placeholder="Search for titles..." className={styles.centerSearch} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </section>
      
      <section className={styles.contentSection}>
        {/* ИСПРАВЛЕНО: Полностью дописан и закрыт блок табов (переключателей страниц) */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
          <button 
            onClick={() => setType('movie')} 
            style={{
              background: type === 'movie' ? '#e50914' : 'rgba(255,255,255,0.06)',
              color: '#fff',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '4px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            Movies
          </button>
          <button 
            onClick={() => setType('tv')} 
            style={{
              background: type === 'tv' ? '#e50914' : 'rgba(255,255,255,0.06)',
              color: '#fff',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '4px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            TV Series
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading catalog...</div>
        ) : (
          <div className={styles.mediaGrid}>
            {items.map((item, idx) => {
              const currentPoster = item.galleryPoster || item.poster_path || item.backdrop_path
              return (
                <div key={idx} className={styles.mediaCard} onClick={() => handleSelect(item)}>
                  <img src={currentPoster ? posterUrl(currentPoster) : 'https://placehold.co'} alt="" referrerPolicy="no-referrer" />
                  <h4>{item.title || item.name}</h4>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
