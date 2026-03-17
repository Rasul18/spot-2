import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export function createToken(user) {
    return jwt.sign(
        { userId: user._id.toString(), login: user.login },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}
