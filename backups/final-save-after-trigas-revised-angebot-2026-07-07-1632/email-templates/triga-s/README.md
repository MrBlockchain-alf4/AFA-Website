# TRIGA-S E-Mail-Templates

Premium E-Mail-Vorlagen für den TRIGA-S n8n-Workflow (Chatbot, Terminbuchung, Anfragen, Fragen).

> **Alle sichtbaren Texte sind auf Deutsch.**
> **Vorschau:** `preview.html` öffnen — alle 9 Templates auf einen Blick.
> **Für Produktion/n8n:** Den Logo-Pfad `assets/trigas-full-logo-white.png` in jedem Template durch eine öffentliche HTTPS-URL ersetzen (Hinweis steht als HTML-Kommentar direkt beim `<img>`-Tag).
> **n8n Gmail-Nodes** müssen diese Templates als **HTML** versenden (nicht als Plaintext).

---

## Assets

| Datei | Verwendung |
|---|---|
| `assets/trigas-full-logo-white.png` | Weißes TRIGA-S Volllogo (transparenter Hintergrund) — direkt im Navy-Header |
| `assets/trigas-logo-full.png` | Farbiges TRIGA-S Logo — Reserve / helle Bereiche |
| `assets/trigas-lines.png` | TRIGA-S Lineas Markenelement (PNG, weiß-Hintergrund) — nicht direkt auf Dunkel verwendbar |

> `trigas-lines.png` wird als `<img>` mit `display:inline-block`, `opacity:0.30` und `text-align:right` auf dem übergeordneten `<td>` eingebunden. Der weiße Hintergrund der PNG wird durch die niedrige Deckkraft auf Navy unsichtbar (fein getönt). Die Lineas erscheinen von oben rechts über den gesamten Header.

---

## Design-System

Alle 9 Templates sind nach demselben Schema aufgebaut:

```
[#F4F7FB Hintergrund]
  [Karte — 680px, border-radius:14px, box-shadow]
    [UNIFIED NAVY HEADER — #003B70]
      links: trigas-full-logo-white.png (max-width 172px, direkt auf Navy)
      links: Kategorie-Badge (gelbe Umrandung)
      links: H1 (weiß, 23px, 800 weight)
      links: Subtitle (rgba(255,255,255,0.60))
      [Intern] Metazeile (erstellt_am · quelle) + Priorität/Status-Badges
      rechts: trigas-lines.png (320px inline-block, opacity 0.30, auf Mobil ausgeblendet)
    [AKZENTLINIE — 3px #FFD84A]
    [INHALT — weiß]
      Abschnittsbezeichner: 10px, uppercase, gelber Linker Rand
      Datenkarten: #F8FAFE, Border-Top 2px #003B70, border-radius:8px
      KI-Zusammenfassung: #EEF5FF, linker blauer Rand
      Dunkle Action-Box (intern): #002B54, gelber Text
    [FOOTER — #003B70 Navy]
      TRIGA-S GmbH · Mühltal 5, 82392 Habach · Studies. Services. Solutions.
```

**Farben:**
- Navy: `#003B70` · Brand-Blau: `#005BAA` · Gelb: `#FFD84A`
- Hintergrund: `#F4F7FB` · Datenkarten-BG: `#F8FAFE` · Rahmen: `#D9E3EF`
- Text: `#1F2933` · Gedämpft: `#667085`

**Lineas-Bild (rechte Header-Spalte):**
```html
<td class="hm" width="230" style="padding:0;vertical-align:top;overflow:hidden;text-align:right;">
  <img src="assets/trigas-lines.png" alt="" style="display:inline-block;width:320px;max-width:none;height:auto;opacity:0.30;border:0;vertical-align:top;">
</td>
```

---

## Signatur

- **Kunden-Templates** (#1, #4, #5, #8, #9) verwenden `Ihr TRIGA-S Team` — professioneller Abschluss für den direkten Kundenkontakt.
- **Interne Templates** (#2, #3, #6, #7) verwenden `TRIGA-S Assistenz` — da es sich um automatische Systembenachrichtigungen an das TRIGA-S Team handelt.

---

## Templates

### 1. `trigas_anfrage_bestaetigung_kunde.html`
**Zweck:** Bestätigung an den Kunden nach Chatbot-Anfrage (keine Terminbuchung).
**Betreff:** `Vielen Dank für Ihre Anfrage`
**Variablen:** `{{vorname}}`, `{{nachname}}`, `{{unternehmen}}`, `{{interesse}}`, `{{nachricht}}`

---

### 2. `trigas_anfrage_intern.html`
**Zweck:** Interne Benachrichtigung bei neuer Chatbot-Anfrage / neuem Lead mit vollem Dashboard.
**Betreff:** `Neue TRIGA-S Chatbot-Anfrage – {{interesse}}`
**Variablen:** `{{erstellt_am}}`, `{{quelle}}`, `{{vorname}}`, `{{nachname}}`, `{{vollstaendiger_name}}`, `{{email}}`, `{{telefon}}`, `{{unternehmen}}`, `{{position_funktion}}`, `{{interesse}}`, `{{projekttyp}}`, `{{diagnostikbereich}}`, `{{probentyp}}`, `{{probenanzahl}}`, `{{zeitplan}}`, `{{zielmarkt}}`, `{{regulatorische_anforderungen}}`, `{{bedarf}}`, `{{studienphase}}`, `{{dringlichkeit}}`, `{{nachricht}}`, `{{ki_zusammenfassung}}`, `{{prioritaet}}`, `{{status}}`, `{{sprache}}`, `{{notizen}}`

---

### 3. `trigas_frage_intern.html`
**Zweck:** Interne Benachrichtigung bei Chatbot-Frage mit menschlicher Prüfung erforderlich.
**Betreff:** `Neue TRIGA-S Chatbot-Frage – Prüfung erforderlich`
**Variablen:** `{{erstellt_am}}`, `{{quelle}}`, `{{vollstaendiger_name}}`, `{{email}}`, `{{telefon}}`, `{{unternehmen}}`, `{{position_funktion}}`, `{{frage}}`, `{{kategorie}}`, `{{interesse}}`, `{{ki_antwort}}`, `{{beantwortet}}`, `{{menschliche_pruefung_erforderlich}}`, `{{weiterleitung_erforderlich}}`, `{{prioritaet}}`, `{{status}}`, `{{sprache}}`, `{{notizen}}`

---

### 4. `trigas_termin_bestaetigung_kunde.html`
**Zweck:** Terminbestätigung an den Kunden nach erfolgreicher Buchung.
**Betreff:** `Ihre Projektberatung mit TRIGA-S wurde bestätigt`
**Variablen:** `{{vorname}}`, `{{nachname}}`, `{{unternehmen}}`, `{{interesse}}`, `{{termin_datum}}`, `{{termin_uhrzeit}}`, `{{zeitzone}}`, `{{terminart}}`, `{{besprechungslink}}`, `{{nachricht}}`

---

### 5. `trigas_termin_erinnerung_24h_kunde.html`
**Zweck:** Erinnerung an den Kunden 24 Stunden vor der Projektberatung.
**Betreff:** `Erinnerung: Ihre Projektberatung mit TRIGA-S findet morgen statt`
**Variablen:** `{{vorname}}`, `{{termin_datum}}`, `{{termin_uhrzeit}}`, `{{zeitzone}}`, `{{terminart}}`, `{{besprechungslink}}`

---

### 6. `trigas_termin_erinnerung_24h_intern.html`
**Zweck:** Interne 24h-Erinnerung für das Team mit Kontakt- und Projektdetails.
**Betreff:** `TRIGA-S Termin morgen – {{vollstaendiger_name}} ({{termin_datum}} {{termin_uhrzeit}})`
**Variablen:** `{{termin_datum}}`, `{{termin_uhrzeit}}`, `{{vollstaendiger_name}}`, `{{email}}`, `{{telefon}}`, `{{unternehmen}}`, `{{position_funktion}}`, `{{interesse}}`, `{{projekttyp}}`, `{{bedarf}}`, `{{nachricht}}`, `{{besprechungslink}}`

---

### 7. `trigas_termin_erinnerung_1h_intern.html`
**Zweck:** Interne 1h-Erinnerung mit prominentem Meeting-Button und JETZT-Badge.
**Betreff:** `TRIGA-S Meeting in 1 Stunde – {{vollstaendiger_name}} ({{termin_uhrzeit}})`
**Variablen:** `{{termin_datum}}`, `{{termin_uhrzeit}}`, `{{vollstaendiger_name}}`, `{{email}}`, `{{telefon}}`, `{{unternehmen}}`, `{{interesse}}`, `{{besprechungslink}}`

---

### 8. `trigas_termin_verschoben_kunde.html`
**Zweck:** Benachrichtigung an den Kunden, dass der Termin verschoben wurde (alter + neuer Termin).
**Betreff:** `Ihr TRIGA-S Termin wurde verschoben – Neue Termindetails`
**Variablen:** `{{vorname}}`, `{{termin_datum_alt}}`, `{{termin_uhrzeit_alt}}`, `{{termin_datum}}`, `{{termin_uhrzeit}}`, `{{zeitzone}}`, `{{besprechungslink}}`

---

### 9. `trigas_termin_storniert_kunde.html`
**Zweck:** Stornierungsbestätigung an den Kunden mit Hinweis zur Neubuchung.
**Betreff:** `Ihr TRIGA-S Termin wurde storniert`
**Variablen:** `{{vorname}}`, `{{termin_datum}}`, `{{termin_uhrzeit}}`, `{{terminart}}`

---

## Produktiv-Checkliste

- [ ] In **allen 9 Templates** den Pfad `assets/trigas-full-logo-white.png` durch eine öffentliche HTTPS-URL ersetzen (HTML-Kommentar beim `<img>`-Tag)
- [ ] n8n Gmail-Nodes auf **HTML-Versand** stellen (nicht Plaintext)
- [ ] Betreff-Zeilen aus den HTML-Kommentaren in die n8n-Nodes übertragen
- [ ] `{{besprechungslink}}` aus Google Calendar / Calendly / Teams befüllen
- [ ] `{{zeitzone}}` auf korrekte Zeitzone setzen (z. B. `Europe/Berlin`)
- [ ] `{{erstellt_am}}`, `{{quelle}}` aus n8n-Triggernode befüllen
- [ ] Test-E-Mails vor Live-Schaltung prüfen
