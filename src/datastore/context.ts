import { DatastoreLoader } from './loader';
import * as Datastore from '@google-cloud/datastore';
import { createParamDecorator } from '@nestjs/common';

const ContextType = Symbol();

export interface IUserInput {
  id?: string;
  email: string;
  name: string;
  roles?: ReadonlyArray<string>;
}

export interface IUser extends IUserInput {
  id: string;
}

export const Ctxt = createParamDecorator((data, req) => req.context);

export interface Context<User = IUser> {
  datastore: DatastoreLoader;
  user?: User;
  [ContextType]: true;
}

export function isContext(value: object): value is Context {
  return !!(value as any)[ContextType];
}

export const newContext = (datastore: Datastore): Context => {
  const context: any = { [ContextType]: true };
  context.datastore = new DatastoreLoader(datastore, context);
  return context;
};

export const transaction = async <T>(
  context: Context,
  callback: (context: Context) => Promise<T>,
): Promise<T> => {
  return await callback(context);
};
