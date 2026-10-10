# Arsitektur komponen

- **Common**: elemen UI kecil yang dipakai ulang (`Loader`, `ErrorState`, `ThemeToggle`, `StatusBadge`, `PageHeader`, `EmptyState`).
- **Mixins**: komposisi yang lebih besar (`Navbar`, `Footer`, `Sidebar`, `DashboardShell`, `RoleGuard`).

Komponen halaman yang hanya dipakai satu rute taruh di `_components` dekat `page.jsx`.
