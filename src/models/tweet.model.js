import mongoose,{Schema} from "mongoose";

const tweetsSchema = mongoose.Schema({
    content : {
        type : String,
        required : true,
    },
    owner : {
        type : Schema.Types.ObjectId,
        required : true,
    }
},{timestamps : true})

export const Tweets = mongoose.model("Tweets",tweetsSchema)