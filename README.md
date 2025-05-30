# MyApp - Location Tracking Made Simple

![MyApp Logo](public/logo.png)

A modern Next.js application with user authentication and location tracking capabilities. This project is built with the latest web technologies to provide a seamless user experience.

## Features

- **User Authentication**: Secure login and registration system
- **Location Tracking**: Track and manage location data
- **Responsive Design**: Works on all devices from mobile to desktop
- **Dark/Light Mode**: Automatically adapts to user preferences
- **Real-time Updates**: Get instant notifications about important events
- **Data Analytics**: View detailed reports about your usage
- **Cross-platform**: Access your account from any device, anywhere

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS 4
- **Authentication**: JWT with secure HTTP-only cookies
- **Database**: Prisma ORM with your choice of database
- **Styling**: TailwindCSS with custom theming
- **Deployment**: Ready for deployment on Vercel

## Getting Started

First, clone the repository:

```bash
git clone https://github.com/yourusername/myapp.git
cd myapp
```

Install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Set up your environment variables:

```bash
cp .env.example .env.local
```

Edit the `.env.local` file with your configuration.

Run the development server:

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

## Project Structure

```
├── public/             # Static assets
├── src/
│   ├── app/            # App router pages and layouts
│   ├── components/     # Reusable UI components
│   │   ├── home/       # Homepage-specific components
│   │   └── layout/     # Layout components (navbar, footer, etc.)
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions and libraries
│   └── styles/         # Global styles
├── prisma/             # Database schema and migrations
└── next.config.mjs     # Next.js configuration
```

## Customization

### Styling

This project uses TailwindCSS for styling. You can customize the theme in the `tailwind.config.js` file.

### Authentication

The authentication system is built with JWT tokens and secure HTTP-only cookies. You can customize the authentication flow in the `src/hooks/useAuth.js` file.

### Database

This project uses Prisma ORM. You can customize the database schema in the `prisma/schema.prisma` file.

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Static Export

If you prefer to deploy to static hosting, you can generate a static export:

1. Update `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
};

export default nextConfig;
```

2. Build the project:

```bash
npm run build
```

This will generate a static export in the `out` directory, which you can deploy to any static hosting service.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
