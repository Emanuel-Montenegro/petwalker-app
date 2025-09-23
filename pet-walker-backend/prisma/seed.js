"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const existingAdmin = await prisma.usuario.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
        const hashedPassword = await bcrypt_1.default.hash(process.env.ADMIN_PASSWORD || 'adminpassword', 10);
        await prisma.usuario.create({
            data: {
                nombre: 'Administrador',
                email: adminEmail,
                contraseña: hashedPassword,
                rol: 'ADMIN',
            },
        });
    }
}
main()
    .catch((e) => {
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
