# Schedulender - sciaga z projektu

## 1. Co to jest za projekt?

Schedulender to aplikacja kalendarza napisana w Next.js, React i TypeScript.
Umozliwia:

- rejestracje i logowanie uzytkownika,
- wyswietlanie kalendarzy i wydarzen,
- dodawanie, edycje i usuwanie wydarzen,
- wyswietlanie agendy na dzis,
- wysylanie zaproszen do kalendarza po nicku,
- wylogowanie.

Projekt uzywa jednej aplikacji Next.js, czyli frontend i backend znajduja sie w tym samym repozytorium.

## 2. Struktura katalogow

```text
calender/
|-- app/
|   |-- page.tsx                 # glowny frontend aplikacji
|   |-- layout.tsx               # glowny layout i metadane strony
|   |-- globals.css              # style calej aplikacji
|   `-- api/
|       |-- auth/
|       |   |-- login/route.ts   # logowanie
|       |   |-- register/route.ts# rejestracja
|       |   |-- me/route.ts      # sprawdzenie zalogowanego uzytkownika
|       |   `-- logout/route.ts  # wylogowanie
|       |-- calendars/route.ts   # kalendarze: GET i POST
|       |-- events/route.ts      # wydarzenia: GET, POST, PATCH, DELETE
|       |-- users/route.ts       # wyszukiwanie uzytkownikow po nicku
|       `-- invitations/route.ts # zaproszenia: GET, POST i PATCH
|-- lib/
|   |-- store.ts                 # zapis danych i operacje na danych
|   |-- auth.ts                  # sesje i cookie sesyjne
|   |-- logger.ts                # logowanie akcji backendu
|   |-- prisma.ts                # obecnie pusty plik
|   `-- utils.ts                 # obecnie pusty plik
|-- prisma/
|   `-- schema.prisma            # docelowy model bazy danych Prisma
|-- components/                  # obecnie pusty katalog
|-- package.json                 # zaleznosci i komendy npm
|-- next.config.ts               # konfiguracja Next.js
|-- tsconfig.json                # konfiguracja TypeScript
`-- eslint.config.mjs           # konfiguracja ESLint
```

## 3. Jak uruchomic projekt?

```bash
npm install
npm run dev
```

Po uruchomieniu aplikacja jest dostepna zwykle pod adresem `http://localhost:3000`.

Przydatne komendy:

```bash
npm run lint       # sprawdzenie kodu przez ESLint
npm run build      # produkcyjny build
npm start          # uruchomienie gotowego buildu
```

## 4. Frontend - gdzie co jest?

### `app/page.tsx`

To glowny ekran aplikacji i komponent React oznaczony jako `"use client"`.
Trzyma stan interfejsu oraz komunikuje sie z API.

Najwazniejsze typy:

- `User` - zalogowany uzytkownik: `id`, `name`, `email`.
- `Calendar` - kalendarz: `id`, `name`, `color`.
- `EventItem` - wydarzenie z tytulem, opisem, priorytetem, datami i kalendarzem.
- `AuthMode` - tryb `login` albo `register`.

Najwazniejszy stan React:

- `user` - informacja, czy uzytkownik jest zalogowany.
- `calendars` - lista kalendarzy uzytkownika.
- `events` - lista jego wydarzen.
- `month` - aktualnie wyswietlany miesiac.
- `selected` - wydarzenie wybrane do edycji albo usuniecia.
- `modal` - otwarte okno: wydarzenie albo zaproszenie.
- `toast` - krotki komunikat po wykonaniu akcji.
- `loading` - stan poczatkowego ladowania.

Najwazniejsze funkcje frontendu:

- `api()` - wspolny wrapper na `fetch`; ustawia JSON, odczytuje odpowiedz i rzuca blad dla statusu HTTP innego niz 2xx.
- `dateValue()` - formatuje date do postaci `YYYY-MM-DD`.
- `refresh()` - pobiera jednoczesnie kalendarze i wydarzenia przez `Promise.all`.
- `submitAuth()` - wysyla formularz logowania lub rejestracji.
- `submitEvent()` - tworzy wydarzenie przez `POST` albo aktualizuje je przez `PATCH`.
- `removeEvent()` - pyta o potwierdzenie i usuwa wydarzenie przez `DELETE`.
- `showToast()` - pokazuje komunikat na dole ekranu i usuwa go po chwili.

### Elementy widoku

`page.tsx` wyswietla kilka stanow:

1. Ekran ladowania, gdy aplikacja sprawdza sesje.
2. Ekran logowania lub rejestracji, gdy nie ma uzytkownika.
3. Glowny panel kalendarza po zalogowaniu.

Glowny panel zawiera:

- sidebar z nazwa aplikacji, nawigacja, lista kalendarzy, wylogowanie i profilem,
- topbar z sciezka `Workspace / My calendar` i avatarem,
- przycisk `Add event`,
- kalendarz miesieczny z nawigacja poprzedni/nastepny miesiac,
- wydarzenia wyswietlane w odpowiednich dniach,
- sekcje agendy na dzis,
- panel postepu i listy czlonkow,
- modal formularza wydarzenia,
- modal zaproszenia,
- toast z komunikatem po akcji.

### `app/globals.css`

Zawiera style calego interfejsu:

- zmienne kolorow w `:root`,
- layout sidebaru i glownego contentu,
- kalendarz i siatke dni,
- wydarzenia z kolorami wedlug priorytetu,
- formularze, przyciski i modale,
- ekran autoryzacji,
- responsywne breakpointy dla tabletow i telefonow.

### `app/layout.tsx`

To layout Next.js obejmujacy cala aplikacje. Importuje `globals.css` i ustawia:

- tytul strony: `schedulender - plan with clarity`,
- opis strony,
- jezyk dokumentu `en`.

## 5. Backend - jak dziala?

Backend korzysta z mechanizmu Route Handlers Next.js. Kazdy plik `route.ts` eksportuje
funkcje HTTP, na przyklad `GET`, `POST`, `PATCH` lub `DELETE`.

Typowy przeplyw requestu:

```text
React w page.tsx
    |
    | fetch('/api/...')
    v
route.ts
    |
    | requireUser() - sprawdzenie sesji
    v
lib/store.ts
    |
    | odczyt/zapis
    v
data/store.json
```

### Uwierzytelnianie

#### `app/api/auth/register/route.ts`

1. Odczytuje `name`, `email` i `password` z JSON.
2. Sprawdza wymagane pola i minimalna dlugosc hasla 8 znakow.
3. Wywoluje `createUser()`.
4. Tworzy sesje przez `createSession()`.
5. Zwraca dane uzytkownika bez hasla.

#### `app/api/auth/login/route.ts`

1. Pobiera email i haslo.
2. Wywoluje `findUser()`.
3. Porownuje hash hasla.
4. Tworzy cookie sesyjne.
5. Zwraca podstawowe dane uzytkownika.

#### `app/api/auth/me/route.ts`

Wywoluje `requireUser()`. Zwraca uzytkownika albo status `401`, gdy sesja nie istnieje.

#### `app/api/auth/logout/route.ts`

Wywoluje `destroySession()`, usuwa cookie i sesje z pamieci procesu.

### Sesje - `lib/auth.ts`

- `createSession(userId)` generuje token przez `randomUUID()`.
- Token jest zapisywany w mapie `sessions` w pamieci procesu.
- Token trafia do httpOnly cookie `schedulender_session`.
- Sesja wygasa po 30 dniach.
- `requireUser()` odczytuje cookie, szuka tokenu i pobiera uzytkownika.
- `destroySession()` usuwa token i cookie.

Uwaga: mapa sesji jest pamieciowa. Po restarcie serwera sesje znikaja. Przy wielu instancjach
aplikacji potrzebny bylby wspolny magazyn sesji, na przyklad Redis albo baza danych.

## 6. Endpointy API

### Kalendarze - `/api/calendars`

| Metoda | Dzialanie | Dostep |
|---|---|---|
| `GET` | Pobiera kalendarze aktualnego uzytkownika | zalogowany |
| `POST` | Tworzy kalendarz na podstawie `name` i opcjonalnego `color` | zalogowany |

`createUser()` automatycznie tworzy nowemu uzytkownikowi kalendarz `Personal`.

### Wydarzenia - `/api/events`

| Metoda | Dzialanie |
|---|---|
| `GET` | Pobiera wydarzenia nalezace do kalendarzy uzytkownika |
| `POST` | Tworzy wydarzenie |
| `PATCH` | Aktualizuje dozwolone pola wydarzenia po `id` |
| `DELETE` | Usuwa wydarzenie po `id` z query stringa |

Przy tworzeniu wydarzenia wymagane sa: `title`, `calendarId`, `startDate` i `endDate`.
Dozwolone priorytety to `low`, `medium` i `high`.

### Zaproszenia - `/api/invitations`

`POST` tworzy zaproszenie na podstawie:

- `userId` wybranego istniejacego uzytkownika,
- `calendarId`,
- roli `EDITOR` albo `VIEWER`.

Frontend wyszukuje istniejacych uzytkownikow przez `/api/users?query=...` po wpisaniu minimum
dwoch znakow nicku. Uzytkownik wybiera jedna z podpowiedzi, a frontend wysyla jej `userId`.
Endpoint sprawdza, czy aktualny uzytkownik jest wlascicielem kalendarza i czy wybrany uzytkownik
istnieje. Samo zaproszenie jest zapisywane jako `PENDING`.

`GET /api/invitations` pobiera oczekujace zaproszenia zalogowanego uzytkownika. `PATCH` z
`{ id, status: "ACCEPTED" | "DECLINED" }` obsluguje decyzje z podstrony `/invitations`.
Akceptacja dodaje uzytkownika do `calendarMembers`, dzieki czemu widzi kalendarz i jego wydarzenia.
Glowny ekran pokazuje licznik nowych powiadomien w sidebarze i topbarze.

### Uzytkownicy - `/api/users`

`GET /api/users?query=fil` zwraca maksymalnie osmiu pasujacych uzytkownikow. W odpowiedzi sa
tylko `id` i `name`, bez hasel i innych danych uwierzytelniajacych. Aktualnie zalogowany
uzytkownik jest wykluczony z wynikow.

## 7. `lib/store.ts` - glowna warstwa danych

To najwazniejszy plik backendu w aktualnej wersji.

- `load()` czyta `data/store.json`; jesli pliku nie ma, tworzy pusty magazyn.
- `save()` tworzy katalog `data` i zapisuje caly magazyn jako JSON.
- `hashPassword()` tworzy hash hasla przez `scryptSync`.
- `createUser()` dodaje uzytkownika i jego kalendarz Personal.
- `findUser()` wyszukuje uzytkownika i sprawdza haslo.
- `getUser()` pobiera uzytkownika po id.
- `getCalendars()` zwraca kalendarze nalezace do uzytkownika.
- `createCalendar()` dodaje nowy kalendarz.
- `getEvents()` zwraca wydarzenia z kalendarzy uzytkownika.
- `createEvent()` sprawdza wlasciciela kalendarza i dodaje wydarzenie.
- `updateEvent()` aktualizuje tylko dozwolone pola wydarzenia.
- `deleteEvent()` usuwa wydarzenie nalezace do uzytkownika.
- `createInvitation()` sprawdza wlasciciela kalendarza i tworzy zaproszenie.
- `getInvitations()` pobiera oczekujace zaproszenia, takze stare wpisy zapisane po emailu.
- `respondToInvitation()` zmienia status i przy akceptacji tworzy czlonkostwo w kalendarzu.

Typy danych przechowywanych w pliku to `users`, `calendars`, `events`, `invitations` i
`calendarMembers`.

## 8. Prisma - wazna uwaga

`prisma/schema.prisma` opisuje rozbudowany, docelowy model bazy danych: `User`, `Calendar`,
`CalendarMember`, `Event`, `EventParticipant` i `Reminder`, a takze enumy rol, statusow
i priorytetow.

Aktualny kod nie korzysta jednak z Prisma:

- `lib/prisma.ts` jest pusty,
- route handlery importuja funkcje z `lib/store.ts`,
- dane sa zapisywane w `data/store.json`.

Czyli schemat Prisma jest obecnie planem przyszlej bazy danych, a nie aktywna warstwa storage.

## 9. Obsluga bledow i statusy HTTP

- `200` - poprawne pobranie, aktualizacja albo usuniecie.
- `201` - poprawne utworzenie zasobu.
- `400` - brak wymaganych danych lub niepoprawne dane formularza.
- `401` - brak poprawnej sesji albo niepoprawne dane logowania.
- `404` - kalendarz lub wydarzenie nie istnieje.
- `409` - email jest juz zarejestrowany.

Frontend odczytuje pole `error` z JSON i pokazuje komunikat w formularzu albo toast.

## 10. Co warto wiedziec podczas dalszej pracy

- Najwiekszy komponent frontendowy jest w `app/page.tsx`; wydzielenie formularza wydarzenia,
  kalendarza i sidebaru do `components/` poprawiloby czytelnosc.
- Dane JSON sa wygodne do nauki i lokalnego prototypu, ale nie sa odpowiednie jako trwala baza
  dla produkcji lub wielu jednoczesnych uzytkownikow.
- Hasla nie sa zwracane do frontendu, ale staly salt w `hashPassword()` powinien zostac
  zastapiony losowym salt per uzytkownik przy wdrozeniu produkcyjnym.
- Cookie sesyjne jest `httpOnly`, co ogranicza dostep JavaScriptu do tokenu sesji.
- Folder `components/` jest przygotowany na przyszly podzial duzego pliku `page.tsx`.