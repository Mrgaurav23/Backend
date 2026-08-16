import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

// Public routes

router.route("/").get(getAllVideos);
router.route("/:videoId").get(getVideoById);

//Private routes

router.route("/").post(
    verifyJWT,
    upload.fields([
        {name : "videoFile" , maxCount : 1},
        { name: "thumbnail", maxCount: 1 },
    ]),
    publishAVideo
)

// Video delete and update
router.route("/:videoId")
.delete(verifyJWT,deleteVideo)
.patch(verifyJWT,upload.single("thumbnail"), updateVideo)

//changing public status
router.route("/toggle/publish/:videoId")
.patch(verifyJWT,togglePublishStatus)

export default router