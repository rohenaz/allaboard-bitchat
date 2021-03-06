# All Aboard: Bitchat [Demo Application](https://bitchat.allaboardbitcoin.com)
Example live Bitcoin chat web application using [BitChat](https://github.com/unwriter/bitchat) funded via the [AllAboard Faucet API](https://allaboardbitcoin.com/docs). This example uses [Firebase](https://firebase.google.com) for the demo [static webpage](https://firebase.google.com/docs/hosting/) and demo serverless [cloud functions](https://firebase.google.com/docs/functions/).

![last commit](https://img.shields.io/github/last-commit/rohenaz/allaboard-bitchat.svg)
[![license](https://img.shields.io/badge/license-Open%20BSV-brightgreen.svg?style=flat)](/LICENSE)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat)](https://github.com/RichardLitt/standard-readme)
[![app health](https://img.shields.io/website-up-down-green-red/https/bitchat.allaboardbitcoin.com.svg?label=status)](https://bitchat.allaboardbitcoin.com)

[![Screenshot](https://bitchat.bitdb.network/screen.png)](https://bitchat.allaboardbitcoin.com)

## Table of Contents
- [Installation](https://github.com/rohenaz/allaboard-bitchat#installation)
- [Documentation](https://github.com/rohenaz/allaboard-bitchat#documentation)
- [Examples](https://github.com/rohenaz/allaboard-bitchat#examples)
- [Code Standards](https://github.com/rohenaz/allaboard-bitchat#code-standards)
- [Usage](https://github.com/rohenaz/allaboard-bitchat#usage)
- [Maintainers](https://github.com/rohenaz/allaboard-bitchat#maintainers)
- [Contributing](https://github.com/rohenaz/allaboard-bitchat#contributing)
- [License](https://github.com/rohenaz/allaboard-bitchat#license)

## Installation

#### Using Firebase (fastest)
Checkout the [quickstart](https://firebase.google.com/docs/hosting/quickstart) for Firebase and if you want to run the serverless functions locally checkout the [Firebase local emulator](https://firebase.google.com/docs/functions/local-emulator).

1) Use your [Google Firebase account](https://console.firebase.google.com/) and **create a new project** in Firebase

2) **Turn on the Blaze plan**, aka "Pay as You Go" in the billing section (required to make external cloud function requests)

3) **Install the [Firebase CLI](https://firebase.google.com/docs/hosting/quickstart#install_the_firebase_cli)**

4) **Login to Firebase** (opens a web browser to login to Google)
```bash
$ firebase login

 ? Allow Firebase to collect anonymous CLI usage and error reporting information? No
```

5) **Initialize the project** from inside your project directory.
```bash
$ cd /Users/YourName/projects/my-demo-bitchat
$ firebase init
```

Choose these settings to host a static website with serverless Cloud Functions
```
 * You are initializing in an existing Firebase project directory
  
? Which Firebase CLI features do you want to setup for this folder?
❯ ◉ Functions: Configure and deploy Cloud Functions
❯ ◉ Hosting: Configure and deploy Firebase Hosting sites
 
? What language would you like to use to write Cloud Functions? JavaScript

? Do you want to use ESLint to catch probable bugs and enforce style? Yes

? File functions/package.json already exists. Overwrite? No

? File functions/.eslintrc.json already exists. Overwrite? No

? File functions/index.js already exists. Overwrite? No

? Do you want to install dependencies with npm now? Yes

? What do you want to use as your public directory? public

? Configure as a single-page app (rewrite all urls to /index.html)? Yes

? File public/index.html already exists. Overwrite? No
```

6) Go to All Aboard and **generate a new [Faucet API key](https://allaboardbitcoin.com/docs/#/faucet/post_faucet_create)**.

7) **Set an environment variable** in Cloud Functions for the above Faucet API key
```bash 
$ firebase functions:config:set allaboard.key="YOUR_FAUCET_KEY"
```

8) **Deploy the code** and functions (takes a few minutes the first time)
```bash
$ firebase use Your-Firebase-Project-ID
$ firebase deploy
```

#### Testing Firebase Deployment
- First, test that the website deployed by opening a web browser and navigating to the url:
```
https://Your-Firebase-Project-ID.firebaseapp.com/
```

- Second, test your cloud function to see it returns the desired response (address, balance):
```bash
$ curl -X GET https://us-central1-Your-Firebase-Project-ID.cloudfunctions.net/status

{"address":"14U9TLN3u9ncW2YQQJCMThBoB9XNigBDvN","balance":0}
```

## Documentation
- More information about the AllAboard Faucet API can be [found here](https://allaboardbitcoin.com/docs).
- **[Bitchat](https://github.com/unwriter/bitchat):** Massively Multiplayer Decentralized Realtime chat over Bitcoin.
- **[Bitdb](https://bitdb.network):** For reading OP_RETURN messages from Bitcoin SV
- **[Bitsocket](https://www.bitsocket.org):** For subscribing to OP_RETURN messages from Bitcoin SV

## Examples
- View the [live bitchat demo application](https://bitchat.allaboardbitcoin.com)

## Code Standards
- Always use the language's best practices
- For the serverless cloud functions we follow the [ESLint rules](https://github.com/rohenaz/allaboard-bitchat/blob/master/functions/.eslintrc.json).

## Usage
- Use this [current demo](https://bitchat.allaboardbitcoin.com) to create a cloud based web application in minutes
- Setup your own custom application using the [AllAboard API](https://allaboardbitcoin.com/docs)

## Maintainers
[Satchmo](https://github.com/rohenaz) - [MrZ](https://github.com/mrz1836)

Support the development of this project and the [AllAboard](https://allaboardbitcoin.com) team 🙏

[![Donate](https://img.shields.io/badge/donate-bitcoin%20SV-brightgreen.svg)](https://allaboardbitcoin.com/?af=allaboard-bitchat)

## Contributing
Feel free to dive in! [Open an issue](https://github.com/rohenaz/allaboard-bitchat/issues/new) or submit PRs.

## License
[![License](https://img.shields.io/badge/license-Open%20BSV-brightgreen.svg?style=flat)](/LICENSE)
