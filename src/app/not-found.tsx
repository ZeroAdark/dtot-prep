import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
      <span className="text-5xl font-bold text-primary">404</span>
      <p className="text-muted-foreground">
        We couldn&apos;t find that page. It may have been removed or the link is
        incorrect.
      </p>
      <Link href="/">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  );
}
