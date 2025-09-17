export default function Footer() {
  return (
    <footer className="mt-12 border-t bg-muted p-6 text-sm">
      <div className="container mx-auto px-4 text-center">
        <div>© {new Date().getFullYear()} Prompt-to-PDF — All rights reserved.</div>
        <div className="mt-2 flex items-center justify-center gap-4">
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
        </div>
      </div>
    </footer>
  );
}
