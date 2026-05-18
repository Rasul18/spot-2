import SongG from "./Song.js";
import UserInteraction from "./UserInteraction.js";
import mongoose from "mongoose";
import { fetchJamendoSongs } from "./jamendoService.js";

const SCORE_WEIGHTS = {
    plays: 1,
    fullListens: 2,
    likes: 3
};

async function getSongForInteraction({ songId, source = "local", genre }) {
    if (source === "jamendo") {
        if (!songId) {
            return null;
        }

        return {
            _id: null,
            genre: genre || "Jamendo",
            externalId: String(songId),
            source: "jamendo"
        };
    }

    if (!songId) {
        return null;
    }

    return SongG.findById(songId).select("_id genre");
}

async function upsertInteraction({ userId, songId, source = "local", genre, update }) {
    const song = await getSongForInteraction({ songId, source, genre });

    if (!song) {
        return { error: "Песня не найдена", status: 404 };
    }

    const filter = source === "jamendo"
        ? { user: userId, source: "jamendo", songExternalId: String(songId) }
        : { user: userId, song: song._id };

    const interaction = await UserInteraction.findOneAndUpdate(
        filter,
        {
            $setOnInsert: {
                source,
                songExternalId: source === "jamendo" ? String(songId) : null,
                song: source === "jamendo" ? null : song._id,
                genre: song.genre || "Pop"
            },
            ...update
        },
        {
            new: true,
            upsert: true
        }
    );

    return { interaction };
}

class RecommendationController {
    async registerPlay(req, res) {
        try {
            const { songId, source, genre } = req.body;
            const result = await upsertInteraction({
                userId: req.user.id,
                songId,
                source,
                genre,
                update: { $inc: { plays: 1 } }
            });

            if (result.error) {
                return res.status(result.status).json({ message: result.error });
            }

            return res.json({ ok: true, interaction: result.interaction });
        } catch (e) {
            console.log("REGISTER PLAY ERROR:", e);
            return res.status(500).json({ message: "Ошибка сохранения прослушивания" });
        }
    }

    async registerFullListen(req, res) {
        try {
            const { songId, source, genre } = req.body;
            const result = await upsertInteraction({
                userId: req.user.id,
                songId,
                source,
                genre,
                update: { $inc: { fullListens: 1 } }
            });

            if (result.error) {
                return res.status(result.status).json({ message: result.error });
            }

            return res.json({ ok: true, interaction: result.interaction });
        } catch (e) {
            console.log("REGISTER FULL LISTEN ERROR:", e);
            return res.status(500).json({ message: "Ошибка сохранения полного прослушивания" });
        }
    }

    async setLike(req, res) {
        try {
            const { songId, source, genre, liked = true } = req.body;
            const result = await upsertInteraction({
                userId: req.user.id,
                songId,
                source,
                genre,
                update: { $set: { liked: Boolean(liked) } }
            });

            if (result.error) {
                return res.status(result.status).json({ message: result.error });
            }

            return res.json({
                ok: true,
                interaction: result.interaction,
                liked: result.interaction.liked
            });
        } catch (e) {
            console.log("SET LIKE ERROR:", e);
            return res.status(500).json({ message: "Ошибка сохранения лайка" });
        }
    }

    async getRecommendations(req, res) {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
                return res.status(400).json({ message: "Некорректный пользователь" });
            }

            const userObjectId = new mongoose.Types.ObjectId(req.user.id);

            const interactions = await UserInteraction.aggregate([
                {
                    $match: {
                        user: userObjectId
                    }
                },
                {
                    $group: {
                        _id: "$genre",
                        plays: { $sum: "$plays" },
                        fullListens: { $sum: "$fullListens" },
                        likes: {
                            $sum: {
                                $cond: ["$liked", 1, 0]
                            }
                        }
                    }
                },
                {
                    $addFields: {
                        score: {
                            $add: [
                                { $multiply: ["$plays", SCORE_WEIGHTS.plays] },
                                { $multiply: ["$fullListens", SCORE_WEIGHTS.fullListens] },
                                { $multiply: ["$likes", SCORE_WEIGHTS.likes] }
                            ]
                        }
                    }
                },
                {
                    $sort: { score: -1, plays: -1, likes: -1, _id: 1 }
                }
            ]);

            const topGenres = interactions.map((item) => item._id).filter(Boolean);
            let recommendedSongs = [];

            if (topGenres.length > 0) {
                const [localSongs, jamendoResult] = await Promise.all([
                    SongG.find({ genre: { $in: topGenres } }).lean(),
                    fetchJamendoSongs({ limit: 24, genres: topGenres })
                ]);
                const scoreByGenre = new Map(interactions.map((item) => [item._id, item.score]));

                const localFormatted = localSongs.map((song) => ({
                    ...song,
                    source: "local"
                }));

                recommendedSongs = [...localFormatted, ...jamendoResult.songs]
                    .sort((a, b) => {
                        const scoreDiff = (scoreByGenre.get(b.genre) || 0) - (scoreByGenre.get(a.genre) || 0);
                        if (scoreDiff !== 0) return scoreDiff;
                        return String(a.name).localeCompare(String(b.name), "ru");
                    })
                    .slice(0, 12);
            } else {
                const [localSongs, jamendoResult] = await Promise.all([
                    SongG.find().limit(12).lean(),
                    fetchJamendoSongs({ limit: 12 })
                ]);

                recommendedSongs = [
                    ...localSongs.map((song) => ({ ...song, source: "local" })),
                    ...jamendoResult.songs
                ].slice(0, 12);
            }

            const likedInteractions = await UserInteraction.find({
                user: userObjectId,
                liked: true
            }).select("song songExternalId source");

            return res.json({
                formula: "score(genre) = plays * 1 + full_listens * 2 + likes * 3",
                stats: interactions.map((item) => ({
                    genre: item._id,
                    plays: item.plays,
                    fullListens: item.fullListens,
                    likes: item.likes,
                    score: item.score
                })),
                likedSongIds: likedInteractions.map((item) =>
                    item.source === "jamendo" ? String(item.songExternalId) : String(item.song)
                ),
                songs: recommendedSongs
            });
        } catch (e) {
            console.log("GET RECOMMENDATIONS ERROR:", e);
            return res.status(500).json({ message: "Ошибка получения рекомендаций" });
        }
    }
}

export default new RecommendationController();
