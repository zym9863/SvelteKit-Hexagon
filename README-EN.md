[中文](README.md)

# SvelteKit-Hexagon

This is a hexagon visualization project based on SvelteKit, built with TypeScript and Vite.

## Project Structure

- `src/lib/hexagon.ts` - Hexagon related logic
- `src/lib/physics.ts` - Physics simulation
- `src/routes/+page.svelte` - Main page

## Install Dependencies

Install dependencies using pnpm:

```sh
pnpm install
```

## Development

Start the development server:

```sh
pnpm dev
```

Or start the server and open the app in a new browser tab:

```sh
pnpm dev -- --open
```

## Build

Build the app for production:

```sh
pnpm build
```

## Preview

Preview the production build:

```sh
pnpm preview
```

## Check

Run type checking:

```sh
pnpm check
```

## Deployment

To deploy the app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.