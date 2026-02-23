# Changelog

All notable changes to na-design-system will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
