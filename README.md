# Nexus Health - Platforma do Zarządzania Migreną

## Opis projektu

Nexus Health to nowoczesna, responsywna strona marketingowa dla aplikacji do zarządzania migreną. Strona prezentuje główne funkcje aplikacji, proces korzystania z niej oraz zawiera sekcje CTA (Call to Action).

## Struktura projektu

Projekt został zorganizowany zgodnie z zasadami separacji odpowiedzialności (separation of concerns), co ułatwia utrzymanie kodu, jego rozbudowę oraz współpracę w zespole.

```
├── index.html              # Główny plik HTML z strukturą strony
├── css/                    # Katalog ze stylami CSS
│   └── style.css           # Główny plik CSS
├── js/                     # Katalog ze skryptami JavaScript
│   └── script.js           # Główny plik JavaScript
├── assets/                 # Katalog z zasobami statycznymi
│   └── images/             # Katalog z obrazami
│       ├── model 2D.png    # Obraz mapy bólu 2D
│       ├── obraz zrodlowy.png # Obraz główny aplikacji
│       └── raport.png      # Obraz raportu dla lekarzy
└── README.md               # Dokumentacja projektu
```

## Uzasadnienie struktury

### Separacja odpowiedzialności

1. **HTML (index.html)** - Zawiera strukturę i treść strony, bez stylów i logiki.
2. **CSS (css/style.css)** - Zawiera wszystkie style i formatowanie wizualne.
3. **JavaScript (js/script.js)** - Zawiera logikę interaktywnych elementów strony.

### Organizacja zasobów

1. **assets/images/** - Dedykowany katalog dla obrazów, co ułatwia zarządzanie zasobami wizualnymi.

## Korzyści z przyjętej struktury

1. **Lepsza organizacja** - Każdy typ pliku ma swoje dedykowane miejsce.
2. **Łatwiejsza konserwacja** - Zmiany w stylach lub logice nie wymagają modyfikacji głównego pliku HTML.
3. **Szybsze ładowanie** - Przeglądarki mogą buforować oddzielne pliki CSS i JavaScript.
4. **Skalowalność** - Struktura pozwala na łatwe dodawanie nowych funkcji i zasobów.
5. **Współpraca w zespole** - Różni członkowie zespołu mogą pracować nad różnymi aspektami strony jednocześnie.

## Efekty wizualne i interakcje

Strona zawiera kilka zaawansowanych efektów wizualnych:

1. **Cursor Glow** - Efekt poświaty podążającej za kursorem.
2. **Scroll Reveal** - Animacje elementów pojawiających się podczas przewijania strony.
3. **Tilt Effect** - Efekt 3D dla obrazów reagujący na ruch kursora.

Wszystkie te efekty są zaimplementowane w pliku JavaScript, co pozwala na łatwe zarządzanie interakcjami bez zaśmiecania głównego kodu HTML.