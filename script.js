const $ = (id) => document.getElementById(id);
const searchInput = $("searchInput"),
  searchBtn = $("searchBtn"),
  resultsGrid = $("resultsGrid"),
  resultsList = $("resultsList"),
  queueEl = $("queue"),
  barCover = $("barCover"),
  barTitle = $("barTitle"),
  barArtist = $("barArtist"),
  playBtn = $("playBtn"),
  prevBtn = $("prevBtn"),
  nextBtn = $("nextBtn"),
  progressFill = $("progressFill"),
  curTime = $("curTime"),
  durTime = $("durTime"),
  vol = $("vol"),
  shuffleBtn = $("shuffleBtn"),
  favBtn = $("favBtn"),
  trendingBtn = $("trendingBtn"),
  clearQueueBtn = $("clearQueueBtn"),
  savePlaylistBtn = $("savePlaylistBtn"),
  loadPlaylistBtn = $("loadPlaylistBtn"),
  createPlaylistBtn = $("createPlaylistBtn"),
  newPlaylistName = $("newPlaylistName"),
  savedLists = $("savedLists"),
  homeHeading = $("homeHeading"),
  audio = $("audio");
let queue = [],
  currentIndex = -1,
  shuffle = false;
let favoritesIds = JSON.parse(localStorage.getItem("pw_favs") || "[]").map(
    String,
  ),
  favMap = JSON.parse(localStorage.getItem("pw_fav_map") || "{}");
const formatTime = (s) =>
  isNaN(s) || s === Infinity
    ? "0:00"
    : Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
const escapeHtml = (s) =>
  String(s || "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function normalize(item) {
  return {
    id: String(item.trackId || item.id || Math.random().toString(36).slice(2)),
    trackName: item.trackName || item.title || item.name || "Unknown",
    artistName:
      item.artistName || item.artist?.name || item.artist || "Unknown",
    previewUrl: item.previewUrl || item.preview || item.url || "",
    artworkUrl100:
      item.artworkUrl100 || item.album?.cover_medium || item.art || "",
  };
}

const navHome = $("navHome"),
  navSearch = $("navSearch"),
  navLibrary = $("navLibrary");
const homeSection = $("homeSection"),
  searchSection = $("searchSection"),
  librarySection = $("librarySection");
function setActiveNav(btn) {
  document
    .querySelectorAll("#mainNav button")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  homeSection.style.display = btn === navHome ? "block" : "none";
  searchSection.style.display = btn === navSearch ? "block" : "none";
  librarySection.style.display = btn === navLibrary ? "block" : "none";
  if (btn === navLibrary) renderSavedLists();
}
navHome.addEventListener("click", () => {
  setActiveNav(navHome);
  renderTrending(true);
});
navSearch.addEventListener("click", () => setActiveNav(navSearch));
navLibrary.addEventListener("click", () => setActiveNav(navLibrary));

document.querySelectorAll(".playlist-list button").forEach((btn) =>
  btn.addEventListener("click", async (e) => {
    const key = e.currentTarget.dataset.playlist;
    if (key === "liked") {
      const likedCount = Object.keys(favMap).length;
      if (!likedCount) {
        homeHeading.textContent = "✨ Liked Songs";
        resultsGrid.innerHTML = `<div style="color:var(--muted);padding:18px;text-align:center">No liked songs yet.</div>`;
        resultsList.innerHTML = "";
        setActiveNav(navHome);
        return;
      }
      const likedItems = Object.values(favMap);
      homeHeading.textContent = "✨ Liked Songs";
      renderGrid(likedItems);
      renderResultsList(likedItems);
      setActiveNav(navHome);
    } else if (key === "tophits") {
      homeHeading.textContent = "🔥 Top Hits";
      await loadMultiQuery([
        "pop",
        "bollywood",
        "indian",
        "top hits",
        "rock",
        "hip hop",
      ]);
      setActiveNav(navHome);
    } else if (key === "chill") {
      homeHeading.textContent = "🌙 Chill Vibes";
      await loadMultiQuery([
        "chill",
        "acoustic",
        "ambient",
        "lofi",
        "classical",
        "indian classical",
      ]);
      setActiveNav(navHome);
    }
  }),
);

async function loadMultiQuery(queries) {
  resultsList.innerHTML = `<div style="color:var(--muted);padding:18px;text-align:center">Loading...</div>`;
  const accum = {};
  for (const q of queries) {
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=20`;
      const r = await fetch(url).then((res) => res.json());
      (r.results || []).forEach((item) => {
        const id =
          item.trackId ||
          item.id ||
          item.title + "::" + (item.artistName || item.artist || "");
        if (!accum[id]) accum[id] = item;
      });
    } catch (_) {}
  }
  const list = Object.values(accum);
  renderGrid(list);
  renderResultsList(list);
}

function renderCard(item) {
  const el = document.createElement("div");
  el.className = "card";
  const art = escapeHtml(item.artworkUrl100 || "");
  el.innerHTML = `<img src="${art}" alt="cover"/><div style="margin-top:10px;font-weight:700">${escapeHtml(item.trackName)}</div><div style="color:var(--muted);margin-top:6px">${escapeHtml(item.artistName)}</div>`;
  el.addEventListener("click", () => addTopAndPlay(item));
  return el;
}
function renderGrid(list) {
  resultsGrid.innerHTML = "";
  (list || [])
    .slice(0, 12)
    .forEach((i) => resultsGrid.appendChild(renderCard(i)));
}

function renderResultsList(list) {
  resultsList.innerHTML = "";
  if (!list || !list.length) {
    resultsList.innerHTML = `<div style="color:var(--muted);padding:18px;text-align:center">No results</div>`;
    return;
  }
  list.forEach((item) => {
    const row = document.createElement("div");
    row.className = "song";
    const art = escapeHtml(item.artworkUrl100 || ""),
      title = escapeHtml(item.trackName || "Unknown"),
      artist = escapeHtml(item.artistName || "Unknown");
    row.innerHTML = `<div class="art"><img src="${art}" alt="art"/></div><div class="meta"><div style="font-weight:700">${title}</div><div style="color:var(--muted);font-size:13px">${artist}</div></div><div><button class="btn">Add</button></div>`;
    row.addEventListener("click", (e) => {
      if (e.target.tagName.toLowerCase() === "button") return;
      addTopAndPlay(item);
    });
    row.querySelector("button").addEventListener("click", (ev) => {
      ev.stopPropagation();
      addToQueue(item);
    });
    resultsList.appendChild(row);
  });
}

function renderQueue() {
  queueEl.innerHTML = "";
  queue.forEach((t, i) => {
    const q = document.createElement("div");
    q.className = "q-item";
    const art = escapeHtml(t.artworkUrl100 || ""),
      isPlaying = i === currentIndex;
    q.innerHTML = `<img src="${art}" alt="cover"/><div style="flex:1"><div style="font-weight:700">${escapeHtml(t.trackName)}</div><div style="color:var(--muted);font-size:13px">${escapeHtml(t.artistName)}</div></div><div style="display:flex;gap:8px"><button class="btn">${isPlaying ? "⏵" : "▶"}</button><button class="btn">✖</button></div>`;
    q.querySelectorAll("button")[0].addEventListener("click", () =>
      playIndex(i),
    );
    q.querySelectorAll("button")[1].addEventListener("click", () => {
      queue.splice(i, 1);
      if (i < currentIndex) currentIndex--;
      else if (i === currentIndex) {
        if (!queue.length) clearPlayer();
        else playIndex(Math.min(i, queue.length - 1));
      }
      renderQueue();
    });
    queueEl.appendChild(q);
  });
}

function addToQueue(item) {
  queue.push(normalize(item));
  renderQueue();
}
function addTopAndPlay(item) {
  queue.unshift(normalize(item));
  playIndex(0);
  renderQueue();
}

async function setNowPlaying(track) {
  if (!track) {
    clearPlayer();
    return;
  }
  barTitle.textContent = track.trackName;
  barArtist.textContent = track.artistName;
  if (track.artworkUrl100) {
    barCover.style.opacity = 1;
    barCover.src = track.artworkUrl100;
  } else {
    barCover.src = "";
    barCover.style.opacity = 0;
  }
  audio.src = track.previewUrl || "";
  audio.currentTime = 0;
  try {
    await audio.play();
    playBtn.textContent = "⏸";
  } catch (_) {
    playBtn.textContent = "▶";
  }
  updateFavButton(track.id);
}

audio.addEventListener("ended", () => {
  if (!queue.length) return clearPlayer();
  if (currentIndex >= 0 && currentIndex < queue.length)
    queue.splice(currentIndex, 1);
  if (!queue.length) {
    clearPlayer();
    renderQueue();
    return;
  }
  if (shuffle) {
    playIndex(Math.floor(Math.random() * queue.length));
  } else {
    const next = Math.min(currentIndex, queue.length - 1);
    playIndex(next);
  }
  renderQueue();
});
audio.addEventListener("loadedmetadata", () => {
  durTime.textContent = formatTime(audio.duration);
});
audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  $("progressFill").style.width =
    (audio.currentTime / audio.duration) * 100 + "%";
  curTime.textContent = formatTime(audio.currentTime);
});

function playIndex(i) {
  if (!queue.length) return;
  if (i < 0 || i >= queue.length) return;
  currentIndex = i;
  setNowPlaying(queue[i]);
  renderQueue();
}

playBtn.addEventListener("click", async () => {
  if (!audio.src) {
    if (queue.length) playIndex(0);
    return;
  }
  if (audio.paused) {
    try {
      await audio.play();
      playBtn.textContent = "⏸";
    } catch (_) {}
  } else {
    audio.pause();
    playBtn.textContent = "▶";
  }
});
prevBtn.addEventListener("click", () => {
  if (!queue.length) return;
  if (audio.currentTime > 3) audio.currentTime = 0;
  else playIndex(Math.max(0, currentIndex - 1));
});
nextBtn.addEventListener("click", () => {
  if (!queue.length) return;
  playIndex((currentIndex + 1) % queue.length);
});
vol.addEventListener("input", () => (audio.volume = Number(vol.value)));
$("progressBar").addEventListener("click", (e) => {
  if (!audio.duration) return;
  const r = e.currentTarget.getBoundingClientRect(),
    x = e.clientX - r.left,
    w = r.width || 1;
  audio.currentTime = (x / w) * audio.duration;
});

function updateFavButton(id) {
  const s = String(id || "");
  if (!s) {
    favBtn.textContent = "🤍";
    favBtn.classList.remove("active");
    return;
  }
  const fav = favoritesIds.includes(s);
  favBtn.textContent = fav ? "❤️" : "🤍";
  favBtn.classList.toggle("active", fav);
}
favBtn.addEventListener("click", () => {
  if (currentIndex < 0 || !queue[currentIndex]) return;
  const item = queue[currentIndex],
    id = String(item.id),
    idx = favoritesIds.indexOf(id);
  if (idx === -1) {
    favoritesIds.push(id);
    favMap[id] = item;
  } else {
    favoritesIds.splice(idx, 1);
    delete favMap[id];
  }
  localStorage.setItem("pw_favs", JSON.stringify(favoritesIds));
  localStorage.setItem("pw_fav_map", JSON.stringify(favMap));
  updateFavButton(id);
});

function getSavedPlaylists() {
  try {
    return JSON.parse(localStorage.getItem("pw_playlists") || "{}");
  } catch (e) {
    return {};
  }
}
function saveNamedPlaylists(obj) {
  localStorage.setItem("pw_playlists", JSON.stringify(obj));
}

savePlaylistBtn.addEventListener("click", () => {
  const name = prompt("Enter playlist name to save current queue:");
  if (!name) return;
  const obj = getSavedPlaylists();
  obj[name] = queue.slice();
  saveNamedPlaylists(obj);
  alert("Saved as " + name);
  renderSavedLists();
});
loadPlaylistBtn.addEventListener("click", () => {
  const obj = getSavedPlaylists(),
    names = Object.keys(obj);
  if (!names.length) return alert("No saved playlists");
  const name = prompt("Enter playlist name to load:\n" + names.join("\n"));
  if (!name) return;
  if (!obj[name]) return alert("No playlist with that name");
  queue = obj[name].map(normalize);
  renderQueue();
  if (queue.length) playIndex(0);
});

createPlaylistBtn.addEventListener("click", () => {
  const name = newPlaylistName.value && newPlaylistName.value.trim();
  if (!name) return alert("Provide a name");
  const obj = getSavedPlaylists();
  obj[name] = queue.slice();
  saveNamedPlaylists(obj);
  newPlaylistName.value = "";
  alert("Saved " + name);
  renderSavedLists();
});

function renderSavedLists() {
  const container = savedLists;
  container.innerHTML = "";
  const obj = getSavedPlaylists(),
    names = Object.keys(obj);
  if (!names.length) {
    container.textContent = "No saved playlists yet.";
    return;
  }
  names.forEach((n) => {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";
    div.style.marginBottom = "8px";
    const left = document.createElement("div");
    left.style.flex = "1";
    left.textContent = n + ` (${(obj[n] || []).length})`;
    const right = document.createElement("div");
    right.style.display = "flex";
    right.style.gap = "6px";
    const loadBtn = document.createElement("button");
    loadBtn.className = "btn";
    loadBtn.textContent = "▶";
    const delBtn = document.createElement("button");
    delBtn.className = "btn";
    delBtn.textContent = "✖";
    const renameBtn = document.createElement("button");
    renameBtn.className = "btn";
    renameBtn.textContent = "✎";
    loadBtn.addEventListener("click", () => {
      queue = (obj[n] || []).map(normalize);
      renderQueue();
      if (queue.length) playIndex(0);
    });
    delBtn.addEventListener("click", () => {
      if (confirm('Delete playlist "' + n + '"?')) {
        delete obj[n];
        saveNamedPlaylists(obj);
        renderSavedLists();
      }
    });
    renameBtn.addEventListener("click", () => {
      const nn = prompt("New name for playlist", n);
      if (nn) {
        obj[nn] = obj[n];
        delete obj[n];
        saveNamedPlaylists(obj);
        renderSavedLists();
      }
    });
    right.appendChild(loadBtn);
    right.appendChild(renameBtn);
    right.appendChild(delBtn);
    div.appendChild(left);
    div.appendChild(right);
    container.appendChild(div);
  });
}

clearQueueBtn.addEventListener("click", () => {
  queue = [];
  renderQueue();
  clearPlayer();
  renderTrending(true);
});

function clearPlayer() {
  currentIndex = -1;
  audio.pause();
  audio.src = "";
  barTitle.textContent = "Not playing";
  barArtist.textContent = "—";
  barCover.src = "";
  barCover.style.opacity = 0;
  $("progressFill").style.width = "0%";
  curTime.textContent = "0:00";
  durTime.textContent = "0:00";
  playBtn.textContent = "▶";
}

async function doSearch(q) {
  if (!q) return;
  setActiveNav(navSearch);
  resultsList.innerHTML = `<div style="color:var(--muted);padding:18px;text-align:center">Searching for "${escapeHtml(q)}"...</div>`;
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=30`;
    const res = await fetch(url);
    const data = await res.json();
    const list = data.results || [];
    renderGrid(list);
    renderResultsList(list);
    return list;
  } catch (e) {
    resultsList.innerHTML = `<div style="color:var(--muted);padding:18px;text-align:center">Search failed</div>`;
    return [];
  }
}
searchBtn.addEventListener("click", () => doSearch(searchInput.value.trim()));
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") doSearch(searchInput.value.trim());
});

async function fetchMultiTrending() {
  const queries = [
    "top hits",
    "pop",
    "bollywood",
    "indian",
    "hip hop",
    "rock",
    "edm",
  ];
  const accum = {};
  for (const q of queries)
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=15`;
      const r = await fetch(url).then((res) => res.json());
      (r.results || []).forEach((item) => {
        const key =
          item.trackId || item.trackName + "::" + (item.artistName || "");
        if (!accum[key]) accum[key] = item;
      });
    } catch (_) {}
  return Object.values(accum);
}

async function renderTrending(skipQueueReset = false) {
  homeHeading.textContent = "🔥 Trending Right Now";
  trendingBtn.classList.add("active");
  resultsGrid.innerHTML = `<div style="color:var(--muted);padding:18px;text-align:center">Loading trending...</div>`;
  const mixed = await fetchMultiTrending();
  if (!mixed.length) {
    resultsGrid.innerHTML = `<div style="color:var(--muted);padding:18px;text-align:center">Unable to load trending</div>`;
    return;
  }
  renderGrid(mixed);
  renderResultsList(mixed);
  if (skipQueueReset) {
    if (queue.length === 0) {
      queue = mixed.slice(0, 12).map(normalize);
      renderQueue();
      if (queue.length) playIndex(0);
    }
    return;
  }
  queue = mixed.slice(0, 12).map(normalize);
  renderQueue();
  if (queue.length) playIndex(0);
}
trendingBtn.addEventListener("click", () => renderTrending(false));

(function init() {
  renderTrending(true);
  updateFavButton(null);
})();
