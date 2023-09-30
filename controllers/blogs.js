const express = require('express');
const blogsRouter = express.Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (req, res, next) => {
  try {
    const blogs = await Blog.find({});
    res.json(blogs);
  } catch (error) {
    next(error);
  }
});

blogsRouter.post('/', async (req, res, next) => {
  try {
    const { title, author, likes, url } = req.body;
    if (!title || !url) {
      return res.status(400).end();
    }
    const blog = new Blog({
      title,
      author,
      likes: likes || 0,
      url,
    });
    const savedBlog = await blog.save();
    res.status(201).json(savedBlog);
  } catch (error) {
    next(error);
  }
});

blogsRouter.delete('/:id', async (req, res, next) => {
  try {
    await Blog.findByIdAndRemove(req.params.id);
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
