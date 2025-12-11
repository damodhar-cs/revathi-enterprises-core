import { BaseGetQuery } from "src/common/interface/base-query.interface";

export interface FindAllVariantsQuery extends BaseGetQuery {
  category?: string;
  branch?: string;
}
