import { cookies } from "next/headers";
import { WelcomeScreen } from "@/components/tenant/welcome-screen";
import { TenantPortal } from "@/components/tenant/tenant-portal";

export const dynamic = "force-dynamic";

export default async function TenantHomePage() {
    const cookieStore = await cookies();
    if (cookieStore.get("chu-tro-onboarded")?.value !== "1") {
        return <WelcomeScreen />;
    }

    return <TenantPortal initialTab="home" />;
}
