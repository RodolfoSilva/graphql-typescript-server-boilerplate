import * as bcrypt from 'bcryptjs';
import isEmpty from 'lodash/isEmpty';
import { Document, model, Model, Schema, SchemaOptions } from 'mongoose';
import * as vars from '../config/vars';

const ADMIN_ROLE = 'admin';
const USER_ROLE = 'user';

const generatePasswordHash = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, vars.saltRounds);
};

const schemaOptions: SchemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
};

const UserSchema: Schema = new Schema(
  {
    email: {
      lowercase: true,
      match: /^\S+@\S+\.\S+$/,
      required: true,
      type: String,
      unique: true,
    },
    name: {
      index: true,
      maxlength: 200,
      trim: true,
      type: String,
    },
    password: {
      maxlength: 128,
      minlength: 6,
      required: true,
      select: false,
      trim: true,
      type: String,
    },
    roles: {
      default: [],
      enum: [USER_ROLE, ADMIN_ROLE],
      required: true,
      type: [String],
    },
  },
  schemaOptions,
);

export interface IUserDocument extends Document {
  email: string;
  name: string;
  password: string;
  roles: string[];
  comparePassword: (password: string) => boolean;
}

export interface IUserModel extends Model<IUserDocument> {
  isAdmin: (user: IUserDocument) => boolean;
  getByEmail: (email: string) => Promise<IUserDocument | null>;
  getByEmailAndPassword: (
    email: string,
    password: string,
  ) => Promise<IUserDocument | null>;
  generatePasswordHash: (password: string) => Promise<string>;
}

UserSchema.methods.comparePassword = function comparePassword(
  password: string,
): boolean {
  return bcrypt.compareSync(password, this.password);
};

UserSchema.statics.getByEmail = async function getByEmail(
  email: string,
): Promise<IUserDocument | null> {
  if (isEmpty(email)) {
    return null;
  }

  return await this.findOne(
    {
      email: new RegExp(`^${email}$`, 'i'),
    },
    '+password',
  );
};

UserSchema.statics.isAdmin = (user: IUserDocument): boolean =>
  user.roles.includes(ADMIN_ROLE);

UserSchema.statics.getByEmailAndPassword = async function getByEmailAndPassword(
  email: string,
  password: string,
): Promise<IUserDocument | null> {
  if (isEmpty(email) || isEmpty(password)) {
    return null;
  }

  const user: IUserDocument | null = await this.getByEmail(email);

  if (!user || !user.comparePassword(password)) {
    return null;
  }

  return user;
};

UserSchema.statics.generatePasswordHash = generatePasswordHash;

const UserModel: IUserModel = model<IUserDocument, IUserModel>(
  'User',
  UserSchema,
);

export default UserModel;
