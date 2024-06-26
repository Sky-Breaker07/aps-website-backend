const Gallery = require('../models/Gallery');
const {StatusCodes} = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');

//receive dummy request from frontend
const dummyRequest = async (req, res) => {
    try {
        // Send a success response
        res.status(StatusCodes.OK).json({ message: 'Dummy request received successfully' });
    } catch (error) {
        // Handle any errors and send an appropriate response
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong' });
    }
}

// Create a new image
const createImage = async (req, res) => {
    try {
        const { title, imageUrl, description, tags, features } = req.body;

        // Create a new image using the Gallery model
        const image = await Gallery.create({ title, imageUrl, description, tags, features });

        // Send a success response
        res.status(StatusCodes.OK).json({ message: 'Image created successfully' });
    } catch (error) {
        // Handle any errors and send an appropriate response
        if (error.name === 'ValidationError') {
            res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong' });
        }
    }
};

const getImages = async (req, res) => {
    try {
        // Fetch all images from the Gallery model
        const images = await Gallery.find();
        // Send the images as a response
        res.status(StatusCodes.OK).json({ images });
    } catch (error) {
        // Handle any errors and send an appropriate response
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong' });
    }
}

// Fetch a single image by its ID, imageUrl or title
const getImage = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch the image from the Gallery model
        const image = await Gallery.findOne({ $or: [{ _id: id }, { imageUrl: id }, { title: id }] });

        // If the image doesn't exist, send a 404 response
        if (!image) {
            throw new NotFoundError('Image not found');
        }

        // Send the image as a response
        res.status(StatusCodes.OK).json({ image });
    } catch (error) {
        // Handle any errors and send an appropriate response
        if (error.name === 'CastError') {
            res.status(StatusCodes.NOT_FOUND).json({ message: 'Image not found' });
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Something went wrong' });
        }
    }
};

module.exports = { createImage, getImages, getImage, dummyRequest };