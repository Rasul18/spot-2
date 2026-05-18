import { verifyToken } from "./auth.js";

export default function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const payload = verifyToken(token);

    if (!payload?.userId) {
        return res.status(401).json({ message: "Неавторизован" });
    }

    req.user = {
        id: payload.userId,
        login: payload.login
    };

    next();
}
