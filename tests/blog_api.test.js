const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./blog_api_test_helper');
const app = require('../app');
const Blog = require('../models/blog');
const User = require('../models/user');

const api = supertest(app);

describe('when there is some blogs initially saved', () => {
  beforeAll(async () => {
    await Blog.deleteMany({});
    await User.deleteMany({});

    await helper.insertBlogsWithAuthor();
  });

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

describe('addition, edition or deletion of a new blog', () => {
  let token;

  beforeAll(async () => {
    await api
      .post('/api/login')
      .send({
        username: helper.testUser.username,
        password: helper.testUser.password,
      })
      .then((res) => {
        token = res.body.token;
      });
  });

  describe('addition of a new blog', () => {
    test('without a provided token fails with status code 401', async () => {
      const blogs = await helper.getAllBlogs();
      const newBlog = {
        title: 'waos',
        author: 'unknown',
        url: 'http://cats.com',
        likes: 6,
      };

      await api.post('/api/blogs').send(newBlog).expect(401);

      const blogsAfter = await helper.getAllBlogs();

      expect(blogsAfter).toHaveLength(blogs.length);
    });

    test('a valid blog can be added', async () => {
      const newBlog = {
        title: 'waos',
        author: 'unknown',
        url: 'http://cats.com',
        likes: 6,
      };

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
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

      const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlogWithNoLikes);

      const savedBlog = response.body;

      expect(savedBlog.likes).toBe(0);
    });

    test('if the title or url properties are missing, responds with status code 400', async () => {
      const newBlogWithNoTitleNorUrl = {
        author: 'unknown',
        likes: 3,
      };

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlogWithNoTitleNorUrl)
        .expect(400);
    });
  });

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 when id is valid', async () => {
      const blogs = await helper.getAllBlogs();

      const firstBlog = blogs[0];
      await api
        .delete(`/api/blogs/${firstBlog.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      const blogsAfterDelete = await helper.getAllBlogs();

      expect(blogsAfterDelete).toHaveLength(blogs.length - 1);

      expect(blogsAfterDelete).not.toContainEqual(firstBlog);
    });

    test('fails with status code 400 when id is invalid', async () => {
      await api
        .delete('/api/blogs/zxsddddd1')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });
  });

  describe('update of a blog', () => {
    test('succeeds with status code 200 when id is valid', async () => {
      const blogUpdate = {
        likes: 1034,
        url: undefined,
      };

      const blogs = await helper.getAllBlogs();

      const firstBlog = blogs[0];
      await api
        .put(`/api/blogs/${firstBlog.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(blogUpdate)
        .expect(200);

      const blogsAfterUpdate = await helper.getAllBlogs();

      const updatedBlog = blogsAfterUpdate[0];

      expect(updatedBlog).toEqual({ ...firstBlog, likes: 1034 });
    });

    test('fails with status code 400 when id is invalid', async () => {
      await api
        .put('/api/blogs/zxsddddd1')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });
  });
});

describe('addition of a user', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  test('with valid data', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'add',
      name: 'hello',
      password: 'wao',
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();

    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const lastUser = usersAtEnd[usersAtEnd.length - 1];
    expect(lastUser).toMatchObject({
      username: newUser.username,
      name: newUser.name,
    });
  });

  test('fails with status code 400 when no username is provided', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      name: 'hello',
      password: 'waos1234',
    };

    await api.post('/api/users').send(newUser).expect(400);

    const usersAtEnd = await helper.usersInDb();

    expect(usersAtStart).toHaveLength(usersAtEnd.length);
  });

  test('fails with status code 400 when no password is provided', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'hehe',
      name: 'hello',
    };

    await api.post('/api/users').send(newUser).expect(400);

    const usersAtEnd = await helper.usersInDb();

    expect(usersAtStart).toHaveLength(usersAtEnd.length);
  });

  test('fails with status code 400 when username is not atleast 3 characters long', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'he',
      name: 'hello',
      password: 'wow345',
    };

    await api.post('/api/users').send(newUser).expect(400);

    const usersAtEnd = await helper.usersInDb();

    expect(usersAtStart).toHaveLength(usersAtEnd.length);
  });

  test('fails with status code 400 when password is not atleast 3 characters long', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'hehahe',
      name: 'hello',
      password: 'wo',
    };

    await api.post('/api/users').send(newUser).expect(400);

    const usersAtEnd = await helper.usersInDb();

    expect(usersAtStart).toHaveLength(usersAtEnd.length);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
