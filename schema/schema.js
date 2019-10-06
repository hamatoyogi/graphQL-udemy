const graphql = require('graphql');
const axios = require('axios');
const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema, GraphQLList,
  GraphQLNonNull} = graphql;

const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      async resolve(parentValue, args) {
        try {
          const res = await axios.get(`http://localhost:3000/companies/${ parentValue.id }/users`);
          return res.data;
        }
        catch (e) {
          console.log(e)
        }
      }
    }
  })
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      async resolve(parentValue, args) {
        try {
          const res = await axios.get(`http://localhost:3000/companies/${ parentValue.companyId }`);
          return res.data;
        }
        catch (e) {
          console.log(e)
        }
      }
    }
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      // get the real data
      async resolve(parentValue, args) {
        try {
          const res = await axios.get(`http://localhost:3000/users/${ args.id }`);
          return res.data;
        }
        catch (e) {
          console.log(e);
        }
      }
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      async resolve(parentValue, args) {
        try {
          const res = await axios.get(`http://localhost:3000/companies/${ args.id }`);
          return res.data;
        }
        catch (e) {
          console.log(e);
        }
      }
    }
  }
});

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString },
      },
      async resolve(parentValue, { firstName, age }) {
        try {
          const res = await axios.post(`http://localhost:3000/users/`, { firstName, age });
          return res.data;
        }
        catch (e) {
          console.log(e);
        }
      }
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parentValue, { id }) {
        try {
          const res = await axios.delete(`http://localhost:3000/users/${ id }`);
          return res.data;
        }
        catch (e) {
          console.log(e);
        }
      }
    },
    editUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString },
      },
      async resolve(parentValue, args) {
        try {
          const res = await axios.patch(`http://localhost:3000/users/${ args.id }`, args);
          return res.data;
        }
        catch (e) {
          console.log(e);
        }
      }
    },
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation
});
