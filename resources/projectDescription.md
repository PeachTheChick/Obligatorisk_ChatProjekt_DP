# DP Chat Projekt

I dette projekt skal I anvende alle dele af fagets teknologier. I skal bygge en chat server og
tilhørende klient.

En chat server har en eller flere almindelige HTML sider med beskrivelse - og mulighed for
oprettelse af chats.

En klient skal med RESTFUL api kunne tilgå chat-serverens data og præsentere disse for
brugeren. Brugeren skal have adgang baseret på adgangssystem bestående af tre niveauer.

1. På niveau 1 kan en bruger se chats.
2. På niveau 2 kan en bruger udover niveau 1 også slette/rette chats, men kun chats der er oprettet af brugeren selv.
3. På niveau 3 kan brugeren udover niveau 1 og 2 også slette/rette chats oprettet af andre brugere.

## Chat

En chat består af et id, et navn, en oprettelsesdato, en ejer og et array af beskeder.

## Besked

En besked består af et id, en besked, en oprettelsesdato, en ejer og et chat-tilhørsforhold

## Ejer

En ejer består af et id, et brugernavn og et kodeord samt en oprettelsesdato og brugerniveau
(1-3)

## Chat-server

Chat serveren bygges med express, pug og session. Derudover skal der anvendes node:fs til
arkivering af data på disk.

Forsiden viser en liste af chats med navn og mulighed for at logge ind.

Såfremt brugeren allerede er logget ind og har niveau 3, vises der udover chatlisten også en
liste over brugere. Alt efter brugerens brugerniveau kan der vises mulighed for redigering,
sletning og oprettelse af chats.

Denne side laves som et samarbejde mellem pug og DOM manipulation som benyttes efter et
RESTFUL kald til serveren når der laves CRUD operationer på chats.

Alle messages skal gemmes i en fil på serveren i JSON format og denne fil skal læses ind når
serveren startes.

Der skal som minimum være følgende RESTFUL endpoints til:

```
/chats
```

Returnerer en liste af alle chats.

```
/chats/:id
```

Returnerer en specifik chat.

```
/chats/:id/messages
```

Returnerer en liste af alle beskeder i en specifik chat.

```
/chats/:id/messages/:id
```

Returnerer en specifik besked.

```
/users
```

Returnerer en liste af brugere.

```
/users/:id
```

Returnerer en specifik bruger.

```
/users/:id/messages
```

Returnerer en liste af alle beskeder fra en specifik bruger.

Der lægges i opgaven vægt på, om der i løsningen anvendes de korrekte http kommandoer
