import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  const pipeline = [];

  // filtering public videos
  pipeline.push({ $match: { isPublished: true } });

  // search based on query
  if (query) {
    pipeline.push({
      $match: {
        $or: [
          // i operation for case insensitive search
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      },
    });
  }

  // filter based on userId
  if (userId && isValidObjectId(userId)) {
    pipeline.push({
      $match: { owner: new mongoose.Types.ObjectId(userId) },
    });
  }

  // // Sorting Order: asc = 1 , desc = -1
  const sortTypeValue = sortType === "asc" ? 1 : -1;
  const sortByField = sortBy || "createdAt";

  pipeline.push({
    // [sortByField] uses ('views' and 'createdAt') as a key
    $sort: {
      [sortByField]: sortTypeValue,
    },
  });

  // Join with User collection to get owner details
  pipeline.push({
    $lookup: {
      from: "users", // user collection
      localField: "owner", // video model field
      foreignField: "_id", // user model field
      as: "owner",
      pipeline: [
        // select only specific fields from owner object
        {
          $project: {
            username: 1,
            fullName: 1,
            avatar: 1,
          },
        },
      ],
    },
  });

  // Unwind the owner array to get a single object ($lookup returns an array)
  pipeline.push({
    $addFields: {
      owner: { $first: "$owner" },
    },
  });

  // important feilds for final output
  pipeline.push({
    $project: {
      videoFile: 1,
      thumbnail: 1,
      title: 1,
      description: 1,
      views: 1,
      duration: 1,
      createdAt: 1,
      owner: 1,
    },
  });

  // Ready aggregation pipeline for mongoose
  const videoAggregate = Video.aggregate(pipeline);

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    customLabels: {
      docs: "videos",
    },
  };

  // using aggregatePaginate to handle pagination
  const result = await Video.aggregatePaginate(videoAggregate, options);

  // returning response if successful
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  if (!(title && description)) {
    throw new ApiError(401, "title & description in required");
  }

  const videoLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!(videoLocalPath && thumbnailLocalPath)) {
    throw new ApiError(400, "Videofile & thumbnail is required");
  }

  const video = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!(video && thumbnail)) {
    throw new ApiError(400, "Videofile & thumbnail is required");
  }

  const newVideo = await Video.create({
    title,
    description,
    videoFile: video.secure_url,
    thumbnail: thumbnail.secure_url,
    duration: video.duration,
    owner: req.user._id,
  });

  if (!newVideo) {
    throw new ApiError(402, "Unable to create a new video at this moment");
  }

  return res
    .status(201)
    .json(new ApiResponse(400, newVideo, "Video Published Successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  // validate videoId
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid VideoId");
  }

  console.log(videoId);

  // Aggregation pipeline to fetch video and owner details efficiently
  const video = await Video.aggregate([
    {
      // 1. Match the video by its ID and ensure it is published
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
        isPublished: true,
      },
    },
    {
      // 2. Join with the User collection to get the owner's details
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            // Select only specific fields from the owner object
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
              _id: 1,
            },
          },
        ],
      },
    },
    // 3. Unwind the owner array to get a single object (since $lookup returns an array)
    {
      $addFields: {
        owner: { $first: "$owner" },
      },
    },
    {
      // 4. Project the final output fields
      $project: {
        videoFile: 1,
        thumbnail: 1,
        title: 1,
        description: 1,
        views: 1,
        duration: 1,
        createdAt: 1,
        owner: 1,
        isPublished: 1,
      },
    },
  ]);

  // Check if video was found
  if (!video.length) {
    throw new ApiError(404, "Video not found or is not published");
  }

  // Increase view count (optional, can be done asynchronously)
  // You might want to implement a separate, dedicated endpoint for view tracking
  // For simplicity, we are not adding view increment logic here.

  // Return the response
  return res.status(200).json(
    new ApiResponse(
      200,
      video[0], // Send the first element of the result array
      "Video fetched successfully"
    )
  );
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;

  // Minimum Requirement Check: At least one field (title, description, OR thumbnail) is required for update
  if (!(title || description || thumbnailLocalPath)) {
    throw new ApiError(
      403,
      "At least one field (title, description, or thumbnail) is required for update"
    );
  }

  // Validate videoId
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  // Find the video
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(405, "Video is missing");
  }

  // Authorization Check
  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  // Object to hold only the fields that are actually being updated
  const updatedFields = {};

  // Add title and description only if they are provided
  if (title) {
    updatedFields.title = title;
  }

  if (description) {
    updatedFields.description = description;
  }

  if (thumbnailLocalPath) {
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!(thumbnail || thumbnail.url)) {
      throw new ApiError(400, "Error while uploading new thumbnail");
    }

    updatedFields.thumbnail = thumbnail.url;
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: updatedFields,
    },
    {
      new: true,
    }
  );

  if (!updatedVideo) {
    throw new ApiError(500, "Error while updating the video");
  }

  return res
    .status(200)
    .json(new ApiResponse(201, updatedVideo, "Video is updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  const deleteVideo = await Video.findByIdAndDelete(videoId);

  if (!deleteVideo) {
    throw new ApiError(403, "Unable to delete the video at this moment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deleteVideo, "Delete Video Successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if(!isValidObjectId(videoId)){
    throw new ApiError(400,"Invalid videoId")
  }

  const video =  await Video.findById(videoId);

  if(!video){
    throw new ApiError(404,"Video not found")
  }

    if(video.owner.toString() !== req.user?._id.toString()){
    throw new ApiError(403,"You are not authorized to update this video")
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { isPublished: !video.isPublished },
        { new: true }
    )

    if(!updatedVideo){
        throw new ApiError(500,"Error while toggling publish status")
    }

    res.status(200)
    .json(
        new ApiResponse(200,
            updatedVideo,
            "Video publish status toggled successfully"
        )
    )
    
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
