# SCIoT SS22 Group 30 Dashboard Web App

## Setup

### Environment Properties

Make sure that a `.env` file exists in the main directory of this project that contains an entry `DATABASE_URL` for the SQL database connection string.

### Prisma + Prettier

see (Tutorial)[https://github.com/prisma/prisma/issues/1761#issuecomment-741951775]

## Development

### Prisma Schema Migration

After making the changes in the `schema.prisma` file, run the following command to run the corresponding migration in the database:

```bash
npx prisma migrate dev
```

## Run Dev Server

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
