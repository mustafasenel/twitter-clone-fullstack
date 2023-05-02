import serverAuth from "@/libs/serverAuth";
import { NextApiRequest, NextApiResponse } from "next";

import prisma from "@/libs/prismadb"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if(req.method !== 'POST' && req.method !== 'DELETE') {
        return res.status(405).end();
    }

    try {
        
        let postId;

        if (req.body.postId == undefined){
            postId = req.query.postId as string; 
            console.log("QUERY",postId)
        } else {
            postId = req.body.postId as string;
            console.log("BODY",postId)
        }

        const { currentUser } = await serverAuth(req, res);
        
        if (!postId || typeof postId !== 'string') {
            throw new Error('Invlid ID')
        }

        const post = await prisma.post.findUnique({
            where: {
                id: postId
            }
        });

        if (!post) {
            throw new Error('Invalid ID')
        }

        let updatedLikeIds = [...(post.likeIds || [])];

        if (req.method == 'POST') {
            updatedLikeIds.push(currentUser.id);

            try {
                const post = await prisma.post.findUnique({
                    where: {
                        id: postId,
                    }
                })

                if (post?.userId) {
                    await prisma.notification.create({
                        data: {
                            body: "Someone liked your tweet!",
                            userId: post.userId
                        }
                    });

                    await prisma.user.update({
                        where: {
                            id: post.userId
                        },
                        data: {
                            hasNotification: true
                        }
                    })
                }
            } catch (error) {
                console.log(error)
            }
        }
        if (req.method == 'DELETE') {
            updatedLikeIds = updatedLikeIds.filter(
                (likeId) => likeId !== currentUser.id
            )
        }

        const updatedPost = await prisma.post.update({
            where: {
                id: postId
            },
            data: {
                likeIds: updatedLikeIds
            }
        });

        return res.status(200).json(updatedPost);

    } catch (error) {
        console.log(error);
        return res.status(400).end();
    }

}