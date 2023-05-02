import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { authOptions } from '@/pages/api/auth/[...nextauth]';


import prisma from "@/libs/prismadb";
import { getServerSession } from "next-auth";

const serverAuth = async (req: NextApiRequest, res: NextApiResponse) => {
    
    const session = await getServerSession(req, res, authOptions);

    
    // const session = {
    //  user: { name: 'Mustafa Şenel', email: 'senel1806@gmail.com', image: null },   
    //     expires: '2023-05-30T07:16:06.588Z'
    //   }
    if (!session?.user?.email) {
        throw new Error("Not signed in session")
    }

    const currentUser = await prisma.user.findUnique({
        where: {
            email: session.user.email
        }
    });

    if (!currentUser) {
        throw new Error("Not signed in")
    }

    return { currentUser };
};

export default serverAuth;