import Image from "next/image";
import { useTheme } from "next-themes";
import logoB from "@/assets/img/Artemisa.svg";
import logoW from "@/assets/img/ArtemisaW.svg";

interface LogoProps {
    className?: string;
}

export function APPLogo({ className }: LogoProps) {
    const { theme, resolvedTheme } = useTheme();
    const currentTheme = theme === "system" ? resolvedTheme : theme;
    const isDark = currentTheme === "dark";
    const logo = isDark ? logoW : logoB;

    return (
        <div className={`flex items-center gap-2 ${className || ''}`}>
            <Image src={logo} alt="Logo" width={300} height={200} />
        </div>
    );
}