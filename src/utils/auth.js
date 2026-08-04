export function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]")
}

export function registerUser(username, email, password) {
  const users = getUsers()

  if (users.find(u => u.email === email)) {
    return {
      success: false,
      message: "Email already exists"
    }
  }

  const user = {
    id: Date.now().toString(),
    username,
    email,
    password
  }

  users.push(user)

  localStorage.setItem(
    "users",
    JSON.stringify(users)
  )

  localStorage.setItem(
    "currentUser",
    JSON.stringify(user)
  )

  return { success: true }
}

export function loginUser(email, password) {
  const users = getUsers()

  const user = users.find(
    u =>
      u.email === email &&
      u.password === password
  )

  if (!user) {
    return { success: false }
  }

  localStorage.setItem(
    "currentUser",
    JSON.stringify(user)
  )

  return { success: true }
}

export function logoutUser() {
  localStorage.removeItem("currentUser")
}

export function currentUser() {
  return JSON.parse(
    localStorage.getItem("currentUser") || "null"
  )
}

function libraryKey() {
  const user = currentUser()

  if (!user) return null

  return `library_${user.id}`
}

function defaultLibrary() {
  return {
    favorites: [],
    continueWatching: [],
    history: []
  }
}

export function getLibrary() {
  const key = libraryKey()

  if (!key) {
    return defaultLibrary()
  }

  return JSON.parse(
    localStorage.getItem(key) ||
    JSON.stringify(defaultLibrary())
  )
}

export function saveLibrary(data) {
  const key = libraryKey()

  if (!key) return

  localStorage.setItem(
    key,
    JSON.stringify(data)
  )
}

export function addToHistory(item) {
  const lib = getLibrary()

  lib.history = lib.history.filter(
    x => !(
      x.id === item.id &&
      x.type === item.type
    )
  )

  lib.history.unshift({
    ...item,
    viewedAt: Date.now()
  })

  lib.history = lib.history.slice(0, 50)

  saveLibrary(lib)
}

export function addContinueWatching(item) {
  const lib = getLibrary()

  const index = lib.continueWatching.findIndex(
    x =>
      x.id === item.id &&
      x.type === item.type
  )

  const watchData = {
    id: item.id,
    title: item.title,
    poster: item.poster,
    type: item.type,
    year: item.year,
    rating: item.rating,

    // Для сериалов
    season: item.season || null,
    episode: item.episode || null,

    updatedAt: Date.now()
  }

  if (index !== -1) {

    // Удаляем старую запись
    lib.continueWatching.splice(index, 1)

  }

  // Добавляем новую в начало
  lib.continueWatching.unshift(watchData)

  // Максимум 20 элементов
  lib.continueWatching =
    lib.continueWatching.slice(0, 20)

  saveLibrary(lib)
}

export function toggleFavorite(item) {
  const lib = getLibrary()

  const exists = lib.favorites.find(
    x =>
      x.id === item.id &&
      x.type === item.type
  )

  if (exists) {

    lib.favorites =
      lib.favorites.filter(
        x => !(
          x.id === item.id &&
          x.type === item.type
        )
      )

  } else {

    lib.favorites.unshift(item)

  }

  saveLibrary(lib)
}

export function isFavorite(id, type) {
  return getLibrary()
    .favorites
    .some(
      x =>
        x.id === id &&
        x.type === type
    )
}