import React, { useEffect, useState } from 'react'
import {
  isFavorite,
  toggleFavorite
} from '../utils/auth'

export default function FavoriteButton({
  item,
  type
}) {

  const [favorite, setFavorite] = useState(false)

  useEffect(() => {

    setFavorite(
      isFavorite(item.id, type)
    )

  }, [item.id, type])

  function handleClick(e) {

    e.stopPropagation()

    toggleFavorite({

      id: item.id,

      type,

      title:
        type === 'movie'
          ? item.title
          : item.name,

      poster:
        item.poster_path,

      year:
        type === 'movie'
          ? item.release_date?.slice(0, 4)
          : item.first_air_date?.slice(0, 4)

    })

    setFavorite(v => !v)

  }

  return (

    <button
      onClick={handleClick}
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        width: 38,
        height: 38,
        borderRadius: '50%',
        border: 'none',
        background: 'rgba(0,0,0,.75)',
        cursor: 'pointer',
        zIndex: 5,
        fontSize: 18
      }}
    >
      {favorite ? '❤️' : '🤍'}
    </button>

  )

}