# Changelog

All notable changes to na-design-system will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.4] - 2026-02-24

### RichTextEditor

#### Added

- **Link preview on hover** – Optional prop `fetchLinkPreview?: (url: string) => Promise<{ title: string | null }>`. Bila disediakan consumer, saat hover link di editor akan tampil tooltip: judul (dari response), URL, dan tombol Open / Edit / Copy / Hapus. Bila tidak disediakan atau fetch gagal, tampil fallback tooltip sederhana (label "Link preview" + URL).
- **In-memory cache** – Hasil preview per URL di-cache; hover berulang ke URL yang sama tidak memicu fetch baru.
- **Preview card tetap saat mouse ke card** – Mouse out dari link tidak langsung menghilangkan tooltip; delay 200ms. Bila dalam waktu itu mouse masuk ke area card preview, hide dibatalkan. Card hilang saat mouse keluar dari card (atau dari link bila tidak masuk ke card).
- **Tombol aksi di card** – **Edit**: buka LinkEditorModal dengan default teks + URL link yang di-hover, lalu terapkan edit ke range yang benar. **Salin**: salin URL ke clipboard (tanpa trigger submit/publish). **Hapus**: hapus format link dari range teks yang bersangkutan.

#### Changed

- **Decoupled API** – Tidak lagi memakai `process.env.NEXT_PUBLIC_API_URL` di dalam komponen; consumer (mis. na-portal) yang menyediakan `fetchLinkPreview` dan base URL.

---

## [1.3.1] - 2026-02-23

### RichTextEditor

#### Added

- **Slash command menu** – Ketik **`/`** di awal baris untuk membuka menu perintah. Menampilkan: Insert Image, Create Link, Collapsible, Numbered List, Pull Quote, Block Quote. Bisa ketik lagi setelah `/` untuk memfilter (mis. `coll` untuk Collapsible). Pilih dengan klik atau Enter. Menu menutup dengan Escape atau klik di luar.

#### Changed

- **Collapsible block** – Satu blot Block (`details-summary` → `div.ql-collapsible-header`) + body sebagai paragraf biasa. Insert via dua `insertText`; toggle dengan class `.is-open` pada header dan sibling berikutnya; tampilkan/sembunyikan body lewat CSS sibling. Tombol Backspace di baris kosong collapsible menghapus blok header + body.

#### Fixed

- (None this release)

---

## [1.3.0] - 2026-02-18

### Changed

- (See na-profile / na-portal changelogs for ecosystem updates that consume this package.)
