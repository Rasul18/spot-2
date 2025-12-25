import PostT from "./Post.js";

class PostController {
    async createPost(req, res) {
        try {
            const { author, text, content, picture } = req.body;
            const post = await PostT.create({ author, text, content, picture });
            console.log(req.body);
            res.json(post);
        } catch (e) {
            res.status(500).json(e);
        }
    }

    async getAllPosts(req, res) {
        try {
            const posts = await PostT.find();
            return res.json(posts);
        } catch (e) {
            res.status(500).json(e);
        }
    }
    async getOne(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'ID не вказано' });
            }
            const post = await PostT.findById(id);
            return res.json(post);
        } catch (e) {
            res.status(500).json(e);
        }
    }
    async update(req, res) {
        try {
            const post = req.body;
            if (!post._id) {
                return res.status(400).json({ message: 'ID не вказано' });
            }
            const updatedPost = await PostT.findByIdAndUpdate(post._id, post, { new: true });
            return res.json(updatedPost);
        } catch (e) {
            res.status(500).json(e);
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'ID не вказано' });
            }
            const post = await PostT.findByIdAndDelete(id);
            return res.json(post);
        } catch (e) {
            res.status(500).json(e);
        }
    }
}

export default new PostController();