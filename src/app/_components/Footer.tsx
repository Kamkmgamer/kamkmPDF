export default function Footer() {
  return (
    <footer className="mt-12 border-t border-[--color-border] bg-[--color-surface] p-6 text-sm text-[--color-text-muted]">
      <div className="container mx-auto px-4 text-center">
        <div>
          © {new Date().getFullYear()} Prompt-to-PDF — All rights reserved.
        </div>
        <div className="mt-2 flex items-center justify-center gap-4">
          <a href="/terms" className="hover:text-[--color-text-primary]">
            Terms
          </a>
          <a href="/privacy" className="hover:text-[--color-text-primary]">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}
