# CryptoBuddy - Quick Start Guide

## Was ist CryptoBuddy?

CryptoBuddy ist eine Web-Applikation zur Berechnung von Krypto-Steuern nach deutschem Recht. Die App hilft dir dabei:

- 📊 **Portfolio zu tracken** - Alle deine Krypto-Holdings an einem Ort
- 💰 **Steuern zu berechnen** - Automatische FIFO-Berechnung nach §23 EStG
- 📈 **Staking zu monitoren** - 256€ Freigrenze nach §22 Nr. 3 EStG
- 📥 **CSV zu importieren** - Support für 6 große Exchanges
- 📤 **Berichte zu exportieren** - CSV-Export für Steuerberater

## Schnellstart (5 Minuten)

### 1. Datenbank Setup

```bash
# PostgreSQL mit Docker starten
docker run --name cryptobud-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=cryptobud \
  -p 5432:5432 -d postgres:14
```

### 2. Projekt Setup

```bash
# Repository klonen
git clone <repository-url>
cd cryptobud

# Dependencies installieren
npm install

# .env Datei erstellen
cp .env.example .env

# NEXTAUTH_SECRET generieren
openssl rand -base64 32
# ^ Diesen Wert in .env eintragen

# Datenbank migrieren
npx prisma migrate dev
npx prisma generate

# Server starten
npm run dev
```

### 3. Erste Schritte

1. Öffne http://localhost:3000
2. Klicke auf "Registrieren"
3. Erstelle ein Konto mit Email und Passwort
4. Du wirst automatisch zum Dashboard weitergeleitet

## Daten importieren

### Option 1: CSV Import

1. Gehe zu **Transaktionen** → **CSV Import**
2. Wähle deine Exchange (z.B. Bitpanda, Binance)
3. Lade deine CSV-Datei hoch
4. Fertig! Portfolio wird automatisch aktualisiert

### Option 2: Manuell

1. Gehe zu **Transaktionen** → **Neue Transaktion**
2. Fülle das Formular aus
3. Speichern

## Steuern berechnen

1. Gehe zu **Steuerrechner**
2. Sieh deine steuerpflichtigen und steuerfreien Gewinne
3. Exportiere den Jahresbericht für deinen Steuerberater

## Wichtige Features

### Dashboard
- Zeigt Portfolio-Gesamtwert
- Aktuelle Staking-Rewards
- Nächste steuerfreie Verkäufe

### Portfolio
- Alle deine Holdings
- Durchschnittspreise
- Prozentuale Verteilung

### Staking Tracker
- Übersicht aller Staking-Rewards
- Fortschritt zur 256€ Freigrenze
- Warnung bei Überschreitung

### Tax Calculator
- FIFO-Berechnung
- §23 EStG: 1-Jahr-Haltefrist
- §22 Nr. 3 EStG: 256€ Staking-Freigrenze
- Detaillierte Transaktionsanalyse

## Unterstützte Exchanges

✅ Bitpanda
✅ 21Bitcoin
✅ Kraken
✅ Binance
✅ Coinbase
✅ Bitstamp

## Support & Dokumentation

Vollständige Dokumentation findest du in der README.md

Bei Problemen:
1. Prüfe die Troubleshooting-Sektion
2. Öffne ein GitHub Issue
3. Kontaktiere den Support

## Sicherheit

- ✅ Passwörter werden mit bcrypt gehasht
- ✅ Sichere Sessions mit NextAuth.js
- ✅ Alle Routen sind geschützt
- ✅ Daten sind user-isoliert
- ✅ Input-Validierung mit Zod

## Deployment

Siehe README.md für detaillierte Deployment-Anweisungen (Vercel, Docker, etc.)

---

**Viel Erfolg mit CryptoBuddy! 🚀**
