export function Footer() {
  return (
    <div className="w-full border-t p-3 flex justify-center items-center">
      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} LTSM
      </p>
    </div>
  );
}
