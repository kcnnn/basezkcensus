# Base ZK Census

A simple website that verifies user identity using ZKPassport (age 18+ and nationality) and Base wallet address ownership, then displays a census of all participants by country.

## Features

1. **ZKPassport Verification**: Users scan a QR code with the ZKPassport app to verify they are 18+ years old and share their nationality
2. **Base Wallet Verification**: Users sign a typed data message to prove they own a Base address
3. **Census Display**: Shows a list of all countries with counts of participants who completed both verifications

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The server will run on `http://localhost:3000`

## How It Works

### Step 1: ZKPassport Verification
- The website generates a QR code using the ZKPassport SDK
- Users scan the QR code with their ZKPassport mobile app
- The app verifies the user is 18+ years old and discloses their nationality
- The verification result is sent back to the website

### Step 2: Base Wallet Verification
- After ZKPassport verification, a new QR code is displayed
- Users can either:
  - Scan the QR code with their Base mobile wallet app
  - Click the button to sign with a web wallet (MetaMask, Coinbase Wallet, etc.)
- Users sign an EIP-712 typed data message to prove Base address ownership
- The signature is verified and the address is recorded

### Step 3: Census Display
- Once both verifications are complete, the user's nationality is added to the census
- The census section displays all countries with participant counts
- Data is stored in-memory (in production, use a database)

## Technology Stack

- **Backend**: Node.js with Express
- **Frontend**: Vanilla JavaScript (ES6 modules)
- **ZKPassport SDK**: `@zkpassport/sdk` for identity verification
- **QR Code**: `qrcode` library for QR code generation
- **Base Network**: EIP-712 typed data signing for address verification

## API Endpoints

- `POST /api/submit` - Submit census data (address, nationality)
- `GET /api/census` - Get census statistics (countries and counts)

## Notes

- The census data is stored in-memory and will be lost when the server restarts
- For production use, replace the in-memory storage with a database
- The Base wallet QR code contains the message data; mobile wallet apps need to support scanning and signing these messages
- Web wallets (MetaMask, etc.) can sign directly through the browser

## License

MIT

