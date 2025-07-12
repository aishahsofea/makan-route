This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, make sure you are using the correct node version:

```bash
nvm use
```

Copy the `env.example` file to `.env` and set your environment variables:

```bash
cp env.example .env
```

1. For places search, we are using TomTom API. You can get your API key by signing up for free at https://developer.tomtom.com/
2. Replace `TOMTOM_API_KEY` in the `.env` file with your TomTom API key.
3. For Redis, we are using Upstash dashboard. You can get your Redis URL and token by signing up for free at https://upstash.com/
4. Replace `UPSTASH_REDIS_REST_TOKEN` and `UPSTASH_REDIS_REST_URL` in the `.env` file with yours, and make sure to omit the `https://` part of the URL.

Install the dependencies:

```bash
yarn
```

Run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
