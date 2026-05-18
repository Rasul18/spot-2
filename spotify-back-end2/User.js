import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        login: {
            type: String,
            required: true,
            trim: true,
            minlength: 3
        },
        passwordHash: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

userSchema.index(
    { login: 1 },
    {
        unique: true,
        partialFilterExpression: {
            login: { $type: "string" }
        }
    }
);

export default mongoose.model("User", userSchema);
