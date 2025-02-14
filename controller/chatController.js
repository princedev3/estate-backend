import prisma from "../config/prisma-config.js";
import { pusherServer } from "../config/pusher.js";

export const createChat = async (req, res) => {
  try {
    const body = await req.body;
    if (body.senderId === body.recieverId) {
      return res.status(500).json({ message: "u can  not message yourself" });
    }
    const existingChat = await prisma.chat.findFirst({
      where: {
        userIDs: {
          hasEvery: [body.senderId, body.recieverId],
        },
      },
    });
    if (existingChat) {
      return res.status(200).json({ message: "existing chat" });
    }
    const createdChat = await prisma.chat.create({
      data: {
        userIDs: [body.senderId, body.recieverId],
      },
    });

    return res.status(200).json({ message: "created chat" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "can not create chat" });
  }
};

export const getAllChats = async (req, res) => {
  try {
    const userDetails = req.userDetails;

    const allChats = await prisma.chat.findMany({
      where: {
        userIDs: {
          hasSome: [userDetails.userId],
        },
      },
    });
    const modifield = await Promise.all(
      allChats.map(async (item) => {
        const OtherUserId = item.userIDs.filter(
          (id) => id !== userDetails.userId
        )[0];
        const fetchOtherUserDetails = await prisma.user.findUnique({
          where: {
            id: OtherUserId,
          },
          select: {
            avatar: true,
            id: true,
            username: true,
          },
        });
        return {
          ...item,
          otherUser: fetchOtherUserDetails,
        };
      })
    );

    return res.status(200).json(modifield);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "can not create chat" });
  }
};

export const singleChat = async (req, res) => {
  try {
    const userDetails = req.userDetails;
    const id = await req.params.id;
    const singleData = await prisma.chat.findUnique({
      where: {
        id,
      },
      include: {
        message: true,
      },
    });

    const otherUserDetails = await prisma.user.findUnique({
      where: {
        id: singleData?.userIDs.filter((id) => id !== userDetails.userId)[0],
      },
      select: {
        username: true,
        avatar: true,
      },
    });
    await prisma.chat.update({
      where: {
        id,
      },
      data: {
        seenBy: {
          push: [userDetails.userId],
        },
      },
    });
    return res.status(200).json({ ...singleData, otherUserDetails });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "can not get single chat" });
  }
};

export const addMessage = async (req, res) => {
  try {
    const userDetails = await req.userDetails;
    const body = await req.body;
    const existingChat = await prisma.chat.findUnique({
      where: {
        id: body.chatId,
        userIDs: {
          hasSome: [userDetails.userId],
        },
      },
    });
    if (!existingChat) {
      return res.status(500).json({ message: "chat does not exist" });
    }
    const createdMessage = await prisma.message.create({
      data: {
        userId: userDetails.userId,
        text: body.text,
        chatId: body.chatId,
      },
    });
    await prisma.chat.update({
      where: {
        id: existingChat.id,
      },
      data: {
        lastmessage: body.text,
        seenBy: [userDetails.userId],
      },
    });
    pusherServer.trigger("listen-message", "update-message", {
      ...createdMessage,
    });
    return res.status(200).json(createdMessage);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "can not create message" });
  }
};

export const getAllMessage = async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.userDetails.userId;
    const messages = await prisma.message.findMany({
      where: {
        chatId,
        // userId,
      },
    });
    return res.status(200).json(messages);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "can not get all message" });
  }
};
