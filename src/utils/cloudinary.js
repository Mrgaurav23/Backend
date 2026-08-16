import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    if(!localFilePath) return null

    let uploadedResponse = null;
    try {
        uploadedResponse = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        //File has been uploaded successfully
        console.log("File is uploaded on cloudinary",uploadedResponse.url)
        return uploadedResponse
    } catch (error) {
        fs.unlinkSync(localFilePath); // Remove the locally saved temporary file as the upload operation got failed.
        console.error("Cloudinary upload failed for path:", localFilePath, error);
        return null
    }
    finally{
        try {
           if(fs.existsSync(localFilePath)){
            fs.unlinkSync(localFilePath);
           } 
        } catch (unlinkError) {
            console.error("Failed to remove local temporary file:", unlinkError.message);
        }
    }
}

export {uploadOnCloudinary}