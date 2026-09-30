# Reddit Clone

A full-stack community discussion app built with Next.js 14, TypeScript, and PostgreSQL. Users can sign in through Kinde, create communities, publish rich-text or image posts, comment, and toggle upvotes or downvotes. Prisma-backed server actions persist these interactions, while paginated feeds and Tailwind CSS components provide the browsing interface.

The project brings authentication, relational data modeling, image uploads through UploadThing, and server-rendered pages together in one application.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

See [the audit and revival guide](AUDIT.md) for the deployment diagnosis, changes, and remaining feature backlog. Use Node 22.x, run `npm ci`, and copy `.env.example` to `.env.local` with your own Supabase, Kinde, and UploadThing settings. Run `npm run db:check` to verify database access before starting the app. Never commit `.env.local`.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
