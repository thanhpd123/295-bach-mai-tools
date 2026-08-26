import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
    const tables = await prisma.$queryRawUnsafe<{ tablename: string }[]>(
        "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
    );
    console.log("Bảng:", tables.map((t) => t.tablename).join(", "));

    const [rooms, users, settings, tenants, leases, invoices] = await Promise.all([
        prisma.room.count(),
        prisma.user.count(),
        prisma.setting.count(),
        prisma.tenant.count(),
        prisma.lease.count(),
        prisma.invoice.count(),
    ]);
    console.log(
        `Room: ${rooms} | User: ${users} | Setting: ${settings} | Tenant: ${tenants} | Lease: ${leases} | Invoice: ${invoices}`
    );
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
