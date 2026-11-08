# Schedulender

Prosty workspace do planowania dnia: kilka kalendarzy, priorytety wydarzeń oraz
udostępnianie kalendarza z rolą `EDITOR` lub `VIEWER`.

## Uruchomienie

```bash
npm install
npm run dev
```

W aplikacji działa demonstracyjny dashboard z lokalnym stanem interfejsu.
Endpointy backendowe są dostępne pod:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/calendars`
- `POST /api/events`
- `POST /api/invitations`

Każda operacja zapisywana jest przez `lib/logger.ts`. Endpointy mają prostą
walidację wejścia i są przygotowane do podpięcia do istniejącego modelu Prisma.

## Skrypty

`npm run lint` sprawdza kod, a `npm run build` tworzy produkcyjny build Next.js.
