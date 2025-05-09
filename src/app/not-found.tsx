// src/app/not-found.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();

  useEffect(() => {
    if (countdown <= 0) {
      router.push('/');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <h1 className="text-4xl font-bold text-foreground mb-4">404 - Página no encontrada</h1>
      <p className="text-lg text-muted-foreground mb-2">
        La página que ingresaste no existe.
      </p>
      <p className="text-md text-muted-foreground mb-8">
        Serás redirigido al inicio en {countdown} segundos...
      </p>
      <Button asChild variant="secondary">
        <Link href="/">Ir a la página principal</Link>
      </Button>
    </div>
  );
}