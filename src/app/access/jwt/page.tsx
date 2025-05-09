"use client";

import { Suspense } from "react";
import { SpiralLoader } from "@/components/ui/spiral-loader";
import AccessPageContent from "@/components/access/AccessSSO";

export default function AccessPage() {
    return (
        <div className="relative flex flex-col items-center justify-center h-screen">
            <Suspense
                fallback={
                    <div className="flex flex-col gap-4 items-center justify-center z-50">
                        <SpiralLoader />
                        <p className="mt-48 text-lg">Cargando...</p>
                    </div>
                }
            >
                <AccessPageContent />
            </Suspense>
        </div>
    );
}
