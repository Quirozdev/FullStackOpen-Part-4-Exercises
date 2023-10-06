const express = require('express');
const blogsRouter = express.Router();
const Blog = require('../models/blog');
const { userExtractor } = require('../utils/middleware');

blogsRouter.get('/', async (req, res, next) => {
  try {
    const blogs = await Blog.find({}).populate('user', {
      username: 1,
      name: 1,
    });
    res.json(blogs);
  } catch (error) {
    next(error);
  }
});

blogsRouter.post('/', userExtractor, async (req, res, next) => {
  try {
    const { title, author, likes, url } = req.body;
    if (!title || !url) {
      return res.status(400).send({ error: 'title and url must be provided' });
    }

    const blog = new Blog({
      title,
      author,
      likes: likes || 0,
      url,
      user: req.user._id.toString(),
    });

    const savedBlog = await blog.save();
    req.user.blogs = req.user.blogs.concat(savedBlog._id);
    await req.user.save();

    res.status(201).json(savedBlog);
  } catch (error) {
    next(error);
  }
});

blogsRouter.delete('/:id', userExtractor, async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id });

    if (blog.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: 'you are not the owner of that blog!' });
    }

    await blog.deleteOne();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

blogsRouter.put('/:id', userExtractor, async (req, res, next) => {
  try {
    const savedBlog = await Blog.findById(req.params.id);

    if (!savedBlog) {
      return res.status(404).send({ error: 'blog not found' });
    }

    if (savedBlog.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: 'you are not the owner of that blog!' });
    }

    const { title, author, likes, url } = req.body;

    const blogUpdate = {
      title,
      author,
      likes,
      url,
    };

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      blogUpdate,
      {
        new: true,
      }
    );
    res.json(updatedBlog);
  } catch (error) {
    next(error);
  }
});

module.exports = blogsRouter;
