# My Portfolio

Vue 3 + Vite + Vue Router + GSAP.

## Menjalankan

```bash
npm install
npm run dev      # development
npm run build    # production build ke folder dist/
npm run preview  # cek hasil build
```

## Yang perlu diganti

| Apa | Di mana |
| --- | --- |
| Nama, email, jam lokal, sosial media, link showreel | `src/data/site.js` |
| Project (judul, deskripsi, role, launch, recognition, warna) | `src/data/projects.js` |
| Gambar project | taruh di `public/projects/` lalu isi `image: '/projects/nama.jpg'` |
| Warna dasar dan font | `src/styles/global.css` (`:root`) dan `index.html` (link Google Fonts) |
| Logo | `src/components/SiteHeader.vue` (kotak `.logo`) |

## Struktur

- `src/views/WorkView.vue` — halaman utama (daftar project, kartu 3D, counter)
- `src/composables/useWorkScroll.js` — scroll virtual (mouse, keyboard, touch) + snap per project
- `src/components/CardStack.vue` — posisi dan kemiringan kartu 3D
- `src/components/ProjectList.vue` — daftar project di kanan
- `src/components/ProjectMeta.vue` — Role / Launch / Recognition
- `src/components/ProjectCounter.vue` — angka besar "01 /06"
