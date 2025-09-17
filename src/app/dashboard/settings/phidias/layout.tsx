import { ContentLayout } from "@/components/admin-panel/content-layout";

export default function PhidiasSettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ContentLayout title="Configuración de Phidias">
            {children}
        </ContentLayout>
    );
}
