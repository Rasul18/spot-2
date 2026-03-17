import User from "./User.js";
import bcrypt from "bcryptjs";
import { createToken, verifyToken } from "./auth.js";

class AuthController {
    async register(req, res) {
        try {
            const login = req.body.login?.trim();
            const password = req.body.password?.trim();

            if (!login || !password) {
                return res.status(400).json({ message: "Логин и пароль обязательны" });
            }

            if (login.length < 3) {
                return res.status(400).json({ message: "Логин должен быть минимум 3 символа" });
            }

            if (password.length < 6) {
                return res.status(400).json({ message: "Пароль должен быть минимум 6 символов" });
            }

            const existingUser = await User.findOne({ login });
            if (existingUser) {
                return res.status(409).json({ message: "Пользователь с таким логином уже существует" });
            }

            const passwordHash = await bcrypt.hash(password, 5);

            const user = await User.create({
                login,
                passwordHash
            });

            const token = createToken(user);
            return res.status(201).json({
                token,
                user: { id: user._id, login: user.login }
            });
        } catch (e) {
            console.log("REGISTER ERROR:", e);
            return res.status(500).json({ message: e.message || "Ошибка регистрации" });
        }
    }

    async login(req, res) {
        try {
            const login = req.body.login?.trim();
            const password = req.body.password?.trim();

            if (!login || !password) {
                return res.status(400).json({ message: "Логин и пароль обязательны" });
            }

            const user = await User.findOne({ login });
            const isPasswordValid = user
                ? await bcrypt.compare(password, user.passwordHash)
                : false;

            if (!user || !isPasswordValid) {
                return res.status(401).json({ message: "Неверный логин или пароль" });
            }

            const token = createToken(user);
            return res.json({
                token,
                user: { id: user._id, login: user.login }
            });
        } catch (e) {
            console.log("LOGIN ERROR:", e);
            return res.status(500).json({ message: "Ошибка входа" });
        }
    }

    async me(req, res) {
        try {
            const authHeader = req.headers.authorization || "";
            const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
            const payload = verifyToken(token);

            if (!payload) {
                return res.status(401).json({ message: "Неавторизован" });
            }

            const user = await User.findById(payload.userId).select("_id login");
            if (!user) {
                return res.status(404).json({ message: "Пользователь не найден" });
            }

            return res.json({ user: { id: user._id, login: user.login } });
        } catch (e) {
            console.log("ME ERROR:", e);
            return res.status(500).json({ message: "Ошибка получения профиля" });
        }
    }
}

export default new AuthController();
