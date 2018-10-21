import * as bcrypt from 'bcryptjs';
import isEmpty from 'lodash/isEmpty';
import { Document, model, Model, Schema, SchemaOptions } from 'mongoose';

const generatePasswordHash = async (password: string): Promise<string> => {
  const rounds: number = process.env.NODE_ENV === 'test' ? 1 : 10;
  return await bcrypt.hash(password, rounds);
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
      enum: ['user', 'admin'],
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
  getByEmail: (email: string) => Promise<IUserDocument | undefined | null>;
  getByEmailAndPassword: (
    email: string,
    password: string,
  ) => Promise<IUserDocument | undefined>;
  generatePasswordHash: (password: string) => Promise<string>;
}

UserSchema.methods.comparePassword = function comparePassword(
  password: string,
): boolean {
  return bcrypt.compareSync(password, this.password);
};

UserSchema.statics.getByEmail = async function getByEmail(
  email: string,
): Promise<IUserDocument | undefined | null> {
  if (isEmpty(email)) {
    return undefined;
  }

  return await this.findOne(
    {
      email: new RegExp(`^${email}$`, 'i'),
    },
    '+password',
  );
};

UserSchema.statics.getByEmailAndPassword = async function getByEmailAndPassword(
  email: string,
  password: string,
): Promise<IUserDocument | undefined> {
  if (isEmpty(email) || isEmpty(password)) {
    return undefined;
  }

  const user: IUserDocument | undefined | null = await this.getByEmail(email);

  if (!user || !user.comparePassword(password)) {
    return undefined;
  }

  return user;
};

UserSchema.statics.generatePasswordHash = generatePasswordHash;

const UserModel: IUserModel = model<IUserDocument, IUserModel>(
  'User',
  UserSchema,
);

export default UserModel;
