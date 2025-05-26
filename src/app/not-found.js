export const metadata = {
  title: 'Page Not Found - MyApp',
  description: 'The page you are looking for does not exist',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-xl">Page Not Found</p>
      <a href="/" className="mt-4 text-blue-600 hover:underline">
        Return Home
      </a>
    </div>
  );
}