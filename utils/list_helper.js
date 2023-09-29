function dummy(blogs) {
  return 1;
}

function totalLikes(blogs) {
  return blogs.reduce((acc, current) => {
    return acc + current.likes;
  }, 0);
}

function favoriteBlog(blogs) {
  const favorite = blogs.reduce((previousBlog, currentBlog) => {
    return previousBlog.likes < currentBlog.likes ? currentBlog : previousBlog;
  });

  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes,
  };
}

function mostBlogs(blogs) {
  const authorBlogsCounterObj = {};
  for (let i = 0; i < blogs.length; i++) {
    const blog = blogs[i];
    if (authorBlogsCounterObj[blog.author]) {
      authorBlogsCounterObj[blog.author] += 1;
    } else {
      authorBlogsCounterObj[blog.author] = 1;
    }
  }

  const authorNameWithMostBlogs = Object.keys(authorBlogsCounterObj).reduce(
    (previousAuthor, currentAuthor) => {
      const previousAuthorBlogsCounter = authorBlogsCounterObj[previousAuthor];
      const currentAuthorBlogsCounter = authorBlogsCounterObj[currentAuthor];
      return previousAuthorBlogsCounter < currentAuthorBlogsCounter
        ? currentAuthor
        : previousAuthor;
    }
  );

  return {
    author: authorNameWithMostBlogs,
    blogs: authorBlogsCounterObj[authorNameWithMostBlogs],
  };
}

function mostLikes(blogs) {
  const authorLikesCounterObj = {};
  for (let i = 0; i < blogs.length; i++) {
    const blog = blogs[i];
    if (authorLikesCounterObj[blog.author]) {
      authorLikesCounterObj[blog.author] += blog.likes;
    } else {
      authorLikesCounterObj[blog.author] = blog.likes;
    }
  }

  const authorNameWithMostLikes = Object.keys(authorLikesCounterObj).reduce(
    (previousAuthor, currentAuthor) => {
      const previousAuthorLikesCounter = authorLikesCounterObj[previousAuthor];
      const currentAuthorLikesCounter = authorLikesCounterObj[currentAuthor];
      return previousAuthorLikesCounter < currentAuthorLikesCounter
        ? currentAuthor
        : previousAuthor;
    }
  );

  return {
    author: authorNameWithMostLikes,
    likes: authorLikesCounterObj[authorNameWithMostLikes],
  };
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
