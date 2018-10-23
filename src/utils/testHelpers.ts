import uuid from 'uuid/v4';

export const createFakeEmail = (): string => `${uuid()}@example.com`;

export const createFakePersonName = (): string => `Person ${uuid()}`;
