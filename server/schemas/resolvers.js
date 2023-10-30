const { User, Book } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
  Query: {
    users: async () => {
      return User.find();
    },
    user: async (parent, { username }) => {
      return User.findOne({ username });
    },
    // `context` is where we find the information 
    // from the authentication token (e.g. user ID)
    me: async (parent, args, context) => {
      return User.findById(context.user._id);
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw AuthenticationError;
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw AuthenticationError;
      }

      const token = signToken(user);

      return { token, user };
    },
    saveBook: async (parent, {authors, description, title, bookId, image, link}, context) => {
      // Book is a subdocument
      // it's used for the savedBooks array inside a User document

      const user = await User.findOneAndUpdate(
        { _id: context.user._id },
        { 
          $addToSet: { 
            savedBooks: {
              authors, description, title, bookId, image, link
            } 
          } 
        },
        { new: true }
      );
      return user;
    },
    removeBook: async (parent, {bookId}, context) => {
      const user = await User.findOneAndUpdate(
        { _id: context.user._id },
        { 
          $pull: { 
            savedBooks: {
              bookId
            } 
          } 
        },
        { new: true }
      );
      return user;
    }
  },
};

module.exports = resolvers;
