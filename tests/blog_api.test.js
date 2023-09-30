const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./blog_api_test_helper');
const app = require('../app');
const Blog = require('../models/blog');

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});

  const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));

  const promiseArray = blogObjects.map((blogObject) => blogObject.save());

  await Promise.all(promiseArray);
});

describe('when there is some blogs initially saved', () => {
  test('blogs are returned as JSON', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs');

    expect(response.body).toHaveLength(helper.initialBlogs.length);
  });

  test('all blogs have the unique identifier property id', async () => {
    const response = await api.get('/api/blogs');

    const blogs = response.body;

    blogs.forEach((blog) => expect(blog.id).toBeDefined());
  });
});

describe('addition of a new blog', () => {
  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'waos',
      author: 'unknown',
      url: 'http://cats.com',
      likes: 6,
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsAfterAdd = await helper.getAllBlogs();

    expect(blogsAfterAdd).toHaveLength(helper.initialBlogs.length + 1);

    const lastBlog = blogsAfterAdd[blogsAfterAdd.length - 1];

    expect(lastBlog).toMatchObject(newBlog);
  });

  test('if the likes property is missing, it will default to 0', async () => {
    const newBlogWithNoLikes = {
      title: 'waos',
      author: 'unknown',
      url: 'http://cats.com',
    };

    const response = await api.post('/api/blogs').send(newBlogWithNoLikes);

    const savedBlog = response.body;

    expect(savedBlog.likes).toBe(0);
  });

  test('if the title or url properties are missing, responds with status code 400', async () => {
    const newBlogWithNoTitleNorUrl = {
      author: 'unknown',
      likes: 3,
    };

    await api.post('/api/blogs').send(newBlogWithNoTitleNorUrl).expect(400);
  });
});

describe('deletion of a note', () => {
  test('succeeds with status code 204 when id is valid', async () => {
    const blogs = await helper.getAllBlogs();

    const firstBlog = blogs[0];
    await api.delete(`/api/blogs/${firstBlog.id}`).expect(204);

    const blogsAfterDelete = await helper.getAllBlogs();

    expect(blogsAfterDelete).toHaveLength(helper.initialBlogs.length - 1);

    expect(blogsAfterDelete).not.toContainEqual(firstBlog);
  });

  test('fails with status code 400 when id is invalid', async () => {
    await api.delete('/api/blogs/zxsddddd1').expect(400);
  });
});

describe('update of a note', () => {
  test('succeeds with status code 200 when id is valid', async () => {
    const blogUpdate = {
      likes: 1034,
      url: undefined,
    };

    const blogs = await helper.getAllBlogs();

    const firstBlog = blogs[0];
    await api.put(`/api/blogs/${firstBlog.id}`).send(blogUpdate).expect(200);

    const blogsAfterUpdate = await helper.getAllBlogs();

    const updatedBlog = blogsAfterUpdate[0];

    expect(updatedBlog).toEqual({ ...firstBlog, likes: 1034 });
  });

  test('fails with status code 400 when id is invalid', async () => {
    await api.put('/api/blogs/zxsddddd1').expect(400);
  });
});

afterAll(async () => {
  mongoose.connection.close();
});
