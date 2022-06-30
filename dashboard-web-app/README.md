# SCIoT SS22 Group 30 DWA (Dashboard Web App)

## Setup

### VS Code

Add the following extensions in your VS Code:

- [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)
- [Prisma](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

### Prisma + Prettier

see [Tutorial](https://github.com/prisma/prisma/issues/1761#issuecomment-741951775)

### Environment Properties

Extract the contents of the encrypted archive `.env.zip`. Make sure that you extract the contents inplace, i.e. the `.env` file is placed in the main directory of this project (and not in a new folder).

## Development

### Dependencies

Install the required dependencies by running `npm install`.

### Prisma Schema Migration

After making changes in the `schema.prisma` file, run the following command to run the corresponding migration in the database:

```bash
npx prisma migrate dev
```

### Building the Prisma Client

Before the first start of the dev server and after each schema migration, you must regenerate the Prisma Client by running the following command

```bash
npx prisma generate
```

### Run Dev Server

To start a development server, run the following command:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

### Explore Data

To explore the data stored in our database, you can use the following Prisma command to open an interactive web application as follows:

```bash
npx prisma studio
```

## Building

To create a production version of the app, run:

```bash
npm run build
```

You can preview the production build by running `npm run preview`.

## Run in Production

To run the production version of the app, run:

```bash
npm start
```
