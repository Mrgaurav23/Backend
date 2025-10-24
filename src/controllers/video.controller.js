import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const pipeline = []

    // filtering public videos
    pipeline.push({ $match : { isPublished: true } })

    // search based on query
    if (query) {
        pipeline.push({
            $match: {
                $or: [
                    // i operation for case insensitive search
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } },
                ]
            }
        })
    }

    // filter based on userId
    if (userId && isValidObjectId(userId)) {
        pipeline.push({
            $match: { owner: new mongoose.Types.ObjectId(userId) }
        })
    }

    // // Sorting Order: asc = 1 , desc = -1 
    const sortTypeValue = sortType === "asc" ? 1 : -1
    const sortByField = sortBy || "createdAt"

    pipeline.push({
        // [sortByField] uses ('views' and 'createdAt') as a key
        $sort : {
            [sortByField] : sortTypeValue
        }
    })

    // Join with User collection to get owner details
    pipeline.push({
        $lookup: {
            from: "users", // user collection
            localField: "owner", // video model field
            foreignField: "_id", // user model field
            as: "owner",
            pipeline : [
                // select only specific fields from owner object
                {
                    $project : {
                        username : 1,
                        fullName : 1,
                        avatar : 1
                    }
                }
            ]
        }
    });

    // Unwind the owner array to get a single object ($lookup returns an array)
    pipeline.push({
        $addFields: {
            owner : {$first : "$owner"}
        }
    });

    // important feilds for final output
    pipeline.push({
        $project: {
            videoFile: 1,
            thumbnail: 1,
            title: 1,
            description: 1,
            views : 1,
            duration : 1,
            createdAt : 1,
            owner: 1,
        }
    })

    // Ready aggregation pipeline for mongoose
    const videoAggregate = Video.aggregate(pipeline)

    const options = {
        page : parseInt(page),
        limit : parseInt(limit),
        customLabels : {
            docs : "videos",
        }
    }

    // using aggregatePaginate to handle pagination
    const result = await Video.aggregatePaginate(videoAggregate,options)

    // returning response if successful
    return res.
    status(200)
    .json(new ApiResponse(
        200,
        result,
        "Videos fetched successfully")
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if(!videoLocalPath){
        throw new ApiError(400,"Videofile is required")
    }

    if(!thumbnailLocalPath){
        throw new ApiError(400,"Thumbnailfile is required")
    }

    const video = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!video){
        throw new ApiError(400,"Videofile is required")
    }

    if(!thumbnail){
        throw new ApiError(400,"thumbnail is required")
    }
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}