import { api } from "../client";

export const Event = {
  list: api.events.list,
  filter: api.events.filter,
  create: api.events.create,
  update: api.events.update,
  delete: api.events.delete,
};
