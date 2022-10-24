# Fihub

Onboarding white glove, safe and gamified experience for new crypto users in the DeFi space.

## Local Development

Install all dependencies through `npm i`.

Use `npm run dev` to host the app locally.

## Adding New Tracks

In order to add new tracks to the app, ensure the contracts being used are available in the smart contract list (`src/static/lists/scList.json`).

Add your new interactions list in `src/static/lists` as `<TOKEN_NAME>.json`.

Typings for both the smart contract list and interactions list are available in `src/lib/types.ts` if you need them.

Add the token's name to the list of available tracks in `src/lib/tracks.ts`.

Check that your lists are valid by running the app locally (setup above) and heading to the `/checkLists` route.