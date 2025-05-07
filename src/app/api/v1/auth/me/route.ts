import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { UserPayload } from "@/types/user";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic'

export async function GET() {
    const user = await getCurrentUser()
    if(!user){
        return NextResponse.json(null, {status: 401})
    }
    
    // Obtener el usuario completo con todos sus campos desde Prisma
    const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
            document: true,
            phonenumber: true,
            role: true
        }
    });
    
    //console.log('user fetched from API:', fullUser);
    return NextResponse.json(fullUser as UserPayload);
}