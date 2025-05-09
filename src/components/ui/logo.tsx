import Image from "next/image";
import logo from "@/assets/img/logo.png";

interface LogoProps {
    className?: string
}

export function Logo({ className }: LogoProps) {
    return (
        <div className={`flex items-center gap-2 ${className || ''}`}>
            <Image src={logo} alt="Logo" width={80} height={80} />
        </div>
    );
}