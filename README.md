# Schedulender

Prosty workspace do planowania dnia: kalendarze, priorytety wydarzeń,
logowanie i udostępnianie kalendarza z rolą `EDITOR` lub `VIEWER`.

## Uruchomienie

```bash
npm install
npm run dev
```

Dashboard jest podłączony do backendu i zapisuje zmiany użytkownika.
Endpointy backendowe są dostępne pod:

- `POST /api/auth/register` i `POST /api/auth/login` — tworzenie konta i logowanie
- `GET /api/auth/me` oraz `POST /api/auth/logout` — sesja użytkownika
- `GET/POST /api/calendars` — lista i tworzenie kalendarzy
- `GET/POST/PATCH/DELETE /api/events` — pełne CRUD wydarzeń
- `POST /api/invitations` — zaproszenia do kalendarza

Dane są przechowywane lokalnie w `data/store.json` (plik jest ignorowany przez
Git), a hasła są hashowane przez `scrypt`. Każda operacja zapisywana jest przez
`lib/logger.ts`. Kliknięcie wydarzenia w kalendarzu otwiera edycję, a przycisk
`Delete` usuwa je z backendu.

## Skrypty

`npm run lint` sprawdza kod, a `npm run build` tworzy produkcyjny build Next.js.
