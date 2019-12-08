const graphql = require('graphql');
const axios = require('axios');
const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema, GraphQLList,
  GraphQLNonNull, GraphQLBoolean,} = graphql;

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

const CollectionDataType = new GraphQLObjectType({
  name: 'CollectionDataType',
  fields: () => ({
    category: { type: GraphQLString },
    categorySlug: { type: GraphQLString },
    image: { type: GraphQLString },
    isVideo: { type: GraphQLBoolean },
    locationName: { type: GraphQLString },
    postId: { type: GraphQLInt },
    title: { type: GraphQLString },
    url: { type: GraphQLString },
    description: { type: GraphQLString },
    imageSrc: { type: GraphQLString },
    imageId: { type: GraphQLString },
    kgId: { type: GraphQLString },
    locationType: { type: GraphQLString }
  })
});

const AricleResourceDataType = new GraphQLObjectType({
  name: 'FeaturedArticleData',
  fields: () => ({
    category: { type: GraphQLString },
    categorySlug: { type: GraphQLString },
    image: { type: GraphQLString },
    isVideo: { type: GraphQLBoolean },
    locationName: { type: GraphQLString },
    postId: { type: GraphQLInt },
    title: { type: GraphQLString },
    url: { type: GraphQLString },
    description: { type: GraphQLString },
    imageSrc: { type: GraphQLString },
    imageId: { type: GraphQLString },
    kgId: { type: GraphQLString },
    locationType: { type: GraphQLString }
  })
});

const CollectionType = new GraphQLObjectType({
  name: 'Collection',
  fields: () => ({
    id: { type: GraphQLString },
    collectionType: { type: GraphQLString },
    "collectionTitle": { type: GraphQLString },
    "collectionSubtitle": { type: GraphQLString },
    "collectionSlug": { type: GraphQLString },
    "collectionDataType": { type: GraphQLString },
    "showAll": { type: GraphQLBoolean },
    data: {
      type: new GraphQLList(CollectionDataType)
    },
  })
});

const FeaturedArticlesType = new GraphQLObjectType({
  name: 'FeaturedArticles',
  fields: () => ({
    count: { type: GraphQLInt },
    // data: { type: GraphQLList },
    sectionSubtitle: { type: GraphQLString },
    sectionTitle: { type: GraphQLString }
  })
});

const HomePageImageType = new GraphQLObjectType({
  name: 'HomePageImage',
  fields: () => ({
    url: { type: GraphQLString },
  })
});

const HomePageType = new GraphQLObjectType({
  name: 'HomePage',
  fields: () => ({
    featuredArticles: { type: FeaturedArticlesType },
    homePageImage: { type: HomePageImageType },
    collections: { type: new GraphQLList(CollectionType) }
  })
});


const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: () => ({
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
    },
    collection: {
      type: CollectionType,
      // args: { id: { type: GraphQLString } },
      args: { collectionType: { type: GraphQLString } },
      async resolve(parentValue, args) {
        try {
          // apiCalls++;
          const res = await axios.get(`https://app.theculturetrip.com/cultureTrip-api/v1/collections/27049991861287248179?pageType=homepage&newSlug=true`);
          const allCollections = res.data.data;
          // console.log('%c this is allCollections ========>', 'background: black; color: red;', allCollections);
          const filtered = allCollections.filter((collection) => collection.collectionType === args.collectionType);
          // console.log('%c this is filtered ========>', 'background: black; color: red;', filtered);
          // console.log('this is apiCalls ========>', apiCalls);
          return filtered[0]
          // return res.data;
        }
        catch (e) {
          console.log(e);
        }
      }
    },
    homePage: {
      type: HomePageType,
      args: { pageType: { type: GraphQLString } },
      async resolve(parentValue, args) {
        try {
          const feturedRes = axios.get(`https://app.theculturetrip.com/cultureTrip-api/v2/articles/featured`);
          const imageres = axios.get(`https://app.theculturetrip.com/cultureTrip-api/v1/misc/random_homepage_image`);
          const collectionRes = axios.get(`https://app.theculturetrip.com/cultureTrip-api/v1/collections/27049991861287248179?pageType=homepage&newSlug=true`);
          const response = await Promise.all([feturedRes, imageres, collectionRes] );
          // console.log('%c this is response ========>', 'background: black; color: red;', response);
          const resObj = {
            featuredArticles: response[0].data,
            homePageImage: response[1].data,
            collections: response[2].data.data,
          }
          console.log('this is resObj.image ========>', resObj.collections);
          return resObj;

        }
        catch (e) {
          console.log(e)
        }
      }
    }
  }),
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
