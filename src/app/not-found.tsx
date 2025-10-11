export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h2 className="text-2xl font-bold mb-2">404 - Page Not Found</h2>
      <p className="text-muted-foreground mb-4">
        The page you're looking for doesn't exist.
      </p>
      <a href="/" className="text-primary hover:underline">
        Go back home
      </a>
    </div>
  );
}