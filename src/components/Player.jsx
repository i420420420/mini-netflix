import React, { useMemo } from 'react'
import styles from './Player.module.css'

export default function Player({
  src,
  title,
  year,
  rating,
  overview,
  badge,
  onClose
}) {

  const safeSrc = useMemo(() => {

    if (!src) return ''

    // Если Kodik вернёт ссылку без https
    if (src.startsWith('//')) {
      return `https:${src}`
    }

    return src

  }, [src])

  return (
    <div className={styles.wrap}>

      <div className={styles.meta}>

        <div className={styles.metaTop}>

          <div className={styles.title}>
            {title}
          </div>

          <button
            className={styles.closeBtn}
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        <div className={styles.pills}>

          {rating && (
            <span className={`${styles.pill} ${styles.gold}`}>
              ★ {rating}
            </span>
          )}

          {year && (
            <span className={styles.pill}>
              {year}
            </span>
          )}

          {badge && (
            <span className={`${styles.pill} ${styles.badge}`}>
              {badge}
            </span>
          )}

        </div>

        {overview && (
          <div className={styles.overview}>
            {overview}
          </div>
        )}

      </div>

      <div className={styles.playerBox}>

        {safeSrc ? (

          <iframe
            src={safeSrc}
            title={title}
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen
            referrerPolicy="origin"
          />

        ) : (

          <div
            style={{
              height: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9488a6',
              fontSize: '14px'
            }}
          >
            Видео не найдено
          </div>

        )}

      </div>

    </div>
  )
}