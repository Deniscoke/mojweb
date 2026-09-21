# Pripravenosť na spustenie

Stav zmeraný **21. 9. 2026** na produkcii (`mojweb2.vercel.app`) a na builde `0216dee`.
Každá položka nižšie vychádza z merania, nie zo všeobecného zoznamu. Čo je
v sekcii „Už hotové", netreba riešiť znova.

Legenda: **Ja** = spravím sám · **Ty** = potrebujem od teba informáciu alebo
rozhodnutie · **Spolu** = ty dodáš údaj, ja to zapojím.

---

## Už hotové (overené meraním)

| Oblasť | Výsledok |
|---|---|
| Lighthouse, mobil (4 kľúčové stránky) | výkon **98–99**, prístupnosť **100**, best practices **100**, SEO **100** |
| Váha stránky | 207–259 KB, LCP 1,9–2,2 s, CLS ≈ 0 |
| Všetkých 151 stránok na produkcii | 151× HTTP 200, **0 chýb v konzole, 0 zlyhaných requestov** |
| Odkazy | 186 interných, 0 rozbitých; externé (pravo365.cz, splatoo.com, Splatoo scéna) vracajú 200 |
| Obrázky | 48 z 48 má `alt` |
| Jazyky | správny `lang` na každej lokalizácii (vrátane `sr-Latn`), hreflang pre všetkých 6 + `x-default`, canonical |
| Sitemap | 151 URL vrátane Splatoo |
| Zdieľanie | vlastná OG karta pre každý projekt, lokalizovaný `og:image:alt` |
| Doprava a cache | HSTS s preload, assety `immutable` na rok |
| Mobil | 0 pretečení na 360 px (celý web), tap targety ≥ 44 px |
| Súkromie | fonty sú hostované lokálne, žiadna analytika, Splatoo sa načíta až po kliknutí |

---

## A. Pred spustením — blokery

### A1. Doména · Spolu
Web je dnes na `mojweb2.vercel.app` a canonical, sitemap aj OG odkazy ukazujú
tam. **Ty:** kúpiť doménu (odporúčanie z predošla: `denismitrovic.cz`).
**Ja:** pridať ju ako produkčnú doménu vo Verceli, presmerovať
`mojweb2.vercel.app` → nová doména (inak Google indexuje dve kópie), overiť, že
canonical/sitemap/OG sa prepli. Kód netreba meniť — produkčnú URL si build berie
z Vercelu sám.

### A2. Vlastná 404 stránka · ✅ hotové (21. 9.)
Jedna stránka pre všetky jazyky, jazyk podľa adresy (`/sk/…` → slovensky), bez
JavaScriptu angličtina a odkazy na všetkých 6 jazykov. Status 404, `noindex`,
bez canonical a hreflang.

### A3. Popis pre Google · ✅ hotové (21. 9.)
Nový meta description v 6 jazykoch (142–156 znakov) podľa toho, čo web
naozaj ukazuje, a s tým istým názvom projektových labov, aký používa zvyšok
každého jazyka.

### A4. Právne náležitosti · Spolu
Web ponúka platené služby (sekcia „S čím môžem pomôcť", Web a digitálna práca).
- **Identifikácia podnikateľa.** V ČR ukladá § 435 občianskeho zákonníka
  podnikateľovi uviesť na webe meno, sídlo a IČO (a zápis v registri, ak je).
  Na Slovensku podobné údaje vyžaduje zákon o elektronickom obchode. **Ty:** v
  akom režime podnikáš (OSVČ v ČR / živnosť v SR / zatiaľ nie) a aké údaje
  chceš uviesť. **Ja:** doplním ich do pätičky.
- **Ochrana súkromia.** Krátka stránka: čo sa deje s e-mailom, keď mi niekto
  napíše; že hosting (Vercel) vedie technické logy; že Splatoo scéna je obsah
  tretej strany, ktorý sa načíta až po kliknutí. **Ja** napíšem návrh v 6
  jazykoch, **ty** schváliš.

> Nie som právnik — rozsah si over s účtovníkom alebo advokátom, najmä ak
> podnikáš v inej krajine, než kde máš doménu.

### A5. Tri jazyky majú prípadové štúdie po anglicky · Ty (rozhodnutie)
V **ES, SR, TR** všetkých 6 projektov (18 stránok) zobrazuje oznam „zatiaľ
nepreložené, zobrazené po anglicky". Je to poctivé, ale na spustenie treba
vybrať jedno:
1. **Preložiť** — pripravím preklady, ideálne ich pred zverejnením skontroluje
   rodený hovoriaci. (Odporúčam, ak tieto jazyky reálne potrebuješ.)
2. **Spustiť tak, ako je** — oznam zostane.
3. **Spustiť len EN / CS / SK** a ostatné jazyky pridať neskôr.

### A6. Splatoo: kto a čo · Ty
Stránka dnes hovorí len „spolupracujem na ňom". Na spustenie to stačí, ale
dôveryhodnejšie je:
- celé meno spolupracovníka (Janči) a či chce byť uvedený,
- tvoja konkrétna rola (1–2 vety),
- kto nasnímal Žďár a čo je „Žabiak".

---

## B. Silno odporúčané pred spustením

| # | Čo | Prečo | Kto | Čas |
|---|---|---|---|---|
| B1 | ✅ **Bezpečnostné hlavičky a CSP** | Hotové 21. 9.: CSP s hashmi pre každý inline skript na každej stránke (bez `unsafe-inline` pre skripty), `frame-ancestors`, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`. Overené: 151 stránok bez porušenia, vložený skript sa zablokuje, Splatoo funguje. | Ja | — |
| B3 | ✅ **Ikony a web manifest** | Hotové 21. 9.: `favicon.ico`, `apple-touch-icon.png`, ikony 192/512 a maskable pre Android, `manifest.webmanifest` (`npm run icons`). | Ja | — |
| B4 | **Štruktúrované dáta** (JSON-LD `Person` + `WebSite`) | Dnes 0 stránok. Pomáha Google spojiť meno „Denis Mitrović" s webom a profilmi. **Ty:** ktoré profily prepojiť (LinkedIn, GitHub, Instagram…)? | Spolu | ~20 min |
| B5 | **Záloha CMS databázy** | `cms/data/payload.db` je len na tvojom notebooku (v `.gitignore`). Publikovaný text je v gite cez snapshot, ale koncepty a samotné CMS nie. Stačí automatická kópia do cloudu (OneDrive/Google Drive). | Spolu | ~15 min |
| B6 | **E-mail na vlastnej doméne** | Kontakt je dnes `@gmail.com`. Po kúpe domény pôsobí `denis@…` profesionálnejšie; môže len presmerovať do Gmailu. | Ty (+ ja zmením adresu) | ~20 min |
| B7 | **Preklikateľné doklady** (`sourceUrl`) | Screenshoty esenciaviva.cz a elevatorservis.sk sa nedajú prekliknúť. | Ja (tvoje rozhodnutie) | ~20 min |

> **Oprava auditu:** pôvodná položka B2 („chýba `Sitemap:` v robots.txt") bola
> chybná — pri audite som čítal lokálny build bez produkčnej URL. Produkcia
> riadok `Sitemap:` má.

---

## C. Po spustení

- **Google Search Console + Bing Webmaster Tools** — overiť doménu, odoslať sitemap. *Spolu.*
- **Obnoviť náhľady na sociálnych sieťach** — LinkedIn Post Inspector / Facebook Sharing Debugger pre linky, ktoré si už zdieľal. *Ty.*
- **Aktualizácia Astro 5 → 7 a sharp.** `npm audit` hlási kritickú zraniteľnosť Astro — týka sa ale `define:vars` a server islands, ktoré web nepoužíva (overené: 0 výskytov). Oprava je len v novej hlavnej verzii, preto ju robiť v kľude po spustení, nie tesne pred ním. `sharp` beží len pri generovaní obrázkov z vlastných súborov. *Ja.*
- **Závislosti CMS** (16 hlásení, väčšinou moderate) — CMS beží len lokálne, nie je nasadené, takže riziko je nízke. *Ja.*
- **Analytika** — ak chceš vedieť návštevnosť: Vercel Web Analytics je bez cookies, takže netreba cookie lištu. *Ty (rozhodnutie).*
- **Splatoo `?autoplay`** — ak ho Splatoo pridá, scéna sa spustí jedným kliknutím namiesto dvoch. *Ty (otázka na Jančiho), ja zapojím.*
- **Pravidelná kontrola embedu** — scéna je cudzia aplikácia; ak ju Splatoo presunie, stránka ostane s nefunkčným tlačidlom. Stačí raz mesačne otvoriť.
- **Obsah, ktorý čaká na podklady**: fotky pre Cirkus a Snowboard (pri deťoch so súhlasmi), presný názov kvalifikácie zo snowboardu, názov organizácie v Žďári, ďalšie živé klientske weby.

---

## Odporúčané poradie

1. **Ty:** doména + rozhodnutia A4 (podnikanie), A5 (jazyky), A6 (Splatoo), B4 (profily).
2. ~~**Ja, hneď a bez čakania na teba:** A2, A3, B1, B3.~~ ✅ hotové 21. 9.
3. **Ja, keď dodáš údaje:** A1, A4, A5, A6, B4, B6.
4. **Spustenie** → potom sekcia C.
