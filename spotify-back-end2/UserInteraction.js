import mongoose from "mongoose";

const userInteractionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        song: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SongG",
            default: null
        },
        songExternalId: {
            type: String,
            default: null
        },
        source: {
            type: String,
            enum: ["local", "jamendo"],
            default: "local"
        },
        genre: {
            type: String,
            required: true,
            default: "Pop"
        },
        plays: {
            type: Number,
            default: 0,
            min: 0
        },
        fullListens: {
            type: Number,
            default: 0,
            min: 0
        },
        liked: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

userInteractionSchema.index(
    { user: 1, song: 1 },
    { unique: true, partialFilterExpression: { song: { $type: "objectId" } } }
);
userInteractionSchema.index(
    { user: 1, source: 1, songExternalId: 1 },
    { unique: true, partialFilterExpression: { songExternalId: { $type: "string" } } }
);
userInteractionSchema.index({ user: 1, genre: 1 });

export default mongoose.model("UserInteraction", userInteractionSchema);
