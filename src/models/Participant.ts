// Must match the name limit enforced in firestore.rules.
export const NAME_LIMIT = 50;

export type Participant = {
  name: string;
};
