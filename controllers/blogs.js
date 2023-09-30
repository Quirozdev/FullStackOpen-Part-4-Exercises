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

module.exports = blogsRouter;
