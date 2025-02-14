import cloudinary from "../config/cloudinary-config.js";
import prisma from "../config/prisma-config.js";

export const createProduct = async (req, res) => {
  try {
    const body = await req.body;
    const files = req.files;

    const uploadPromises = files.map((file) =>
      cloudinary.uploader.upload(file.path, { folder: "ecommerce" })
    );
    const uploadResults = await Promise.all(uploadPromises);
    const images = uploadResults.map((item) => item.secure_url);
    await prisma.home.create({
      data: {
        ...body,
        price: parseInt(body.price),
        bedroom: parseInt(body.bedroom),
        bathroom: parseInt(body.bathroom),
        latitude: parseInt(body.latitude),
        longitude: parseInt(body.longitude),
        userId: req?.userDetails?.userId,
        images,
      },
    });
    return res.status(200).json({ message: "home created successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "can not create product" });
  }
};

export const getAllProduct = async (req, res) => {
  try {
    const POST_PER_PAGE = 4;
    const query = req.query;
    const searchQuery = {
      price: {
        gte: Number(query?.minPrice) || undefined,
        lte: Number(query?.maxPrice) || undefined,
      },
      type: query?.type || undefined,
      city: query?.city.toLowerCase() || undefined,
      bedroom: Number(query?.bedroom) || undefined,
      bathroom: Number(query?.bathroom) || undefined,
      // property: query?.property.toLowerCase() || undefined,
    };
    const [allHomes, count] = await prisma.$transaction([
      prisma.home.findMany({
        take: POST_PER_PAGE,
        skip: POST_PER_PAGE * (Number(query.page) - 1),
        where: searchQuery,
      }),
      prisma.home.count({
        where: searchQuery,
      }),
    ]);
    return res.status(200).json({ allHomes, count });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "can not get homes" });
  }
};

export const getSingleProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const singleProduct = await prisma.home.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
      },
    });

    return res.status(200).json(singleProduct);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "can not get  single product" });
  }
};

export const savedAPost = async (req, res) => {
  try {
    const body = await req.body;

    const existingSavedPost = await prisma.savedPost.findFirst({
      where: {
        ...body,
      },
    });
    if (existingSavedPost) {
      await prisma.$transaction([
        prisma.savedPost.delete({
          where: {
            id: existingSavedPost.id,
          },
        }),
        prisma.home.update({
          where: {
            id: body.homeId,
          },
          data: {
            isSaved: false,
          },
        }),
      ]);
      return res.status(200).json({ message: "post removed" });
    }

    await prisma.$transaction([
      prisma.savedPost.create({
        data: {
          ...body,
        },
      }),
      prisma.home.update({
        where: {
          id: body.homeId,
        },
        data: {
          isSaved: true,
        },
      }),
    ]);
    return res.status(200).json({ message: "like created" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "can not saved a home" });
  }
};

export const getFavoriteProduct = async (req, res) => {
  try {
    const userDetails = await req.userDetails;
    const favorites = await prisma.home.findMany({
      where: {
        userId: userDetails.userId,
        isSaved: true,
      },
    });
    return res.status(200).json(favorites);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "can not get favorite post" });
  }
};
