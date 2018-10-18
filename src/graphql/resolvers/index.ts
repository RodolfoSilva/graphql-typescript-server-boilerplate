import { fileLoader } from 'merge-graphql-schemas';
import path from 'path';

const resolvers = fileLoader(path.join(__dirname, './**/*.resolvers.*'));

export default resolvers;
