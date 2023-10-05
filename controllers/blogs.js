const express = require('express');
const blogsRouter = express.Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

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

blogsRouter.post('/', async (req, res, next) => {
  try {
    const decodedToken = jwt.verify(req.token, process.env.SECRET);
    if (!decodedToken.id) {
      return res.status(401).json({ error: 'token invalid' });
    }
    const { title, author, likes, url } = req.body;
    if (!title || !url) {
      return res.status(400).send({ error: 'title and url must be provided' });
    }

    const user = await User.findById(decodedToken.id);

    const blog = new Blog({
      title,
      author,
      likes: likes || 0,
      url,
      user: user.id,
    });

    const savedBlog = await blog.save();
    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();

    res.status(201).json(savedBlog);
  } catch (error) {
    next(error);
  }
});

blogsRouter.delete('/:id', async (req, res, next) => {
  try {
    const decodedToken = jwt.verify(req.token, process.env.SECRET);
    if (!decodedToken.id) {
      return res.status(401).json({ error: 'token invalid' });
    }

    const blog = await Blog.findOne({ _id: req.params.id });

    if (blog.user.toString() !== decodedToken.id.toString()) {
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

blogsRouter.put('/:id', async (req, res, next) => {
  try {
    const { title, author, likes, url } = req.body;

    const blog = {
      title,
      author,
      likes,
      url,
    };
    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, blog, {
      new: true,
    });
    res.json(updatedBlog);
  } catch (error) {
    next(error);
  }
});

module.exports = blogsRouter;
