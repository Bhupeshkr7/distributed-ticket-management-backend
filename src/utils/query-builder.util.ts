import mongoose, { Document, Model } from "mongoose";
import type { FilterQuery } from "mongoose";

interface QueryOptions {
  search?: string;
  searchFields?: string[];
  filter?: Record<string, any>;
  sort?: string;
  page?: number;
  limit?: number;
}

export class QueryBuilder<T extends Document> {
  private model: Model<T>;
  private query: FilterQuery<T> = {};
  private sortOption: Record<string, 1 | -1> = { createdAt: -1 };
  private pageNum: number = 1;
  private limitNum: number = 10;
  private searchFields: string[] = [];

  constructor(model: Model<T>) {
    this.model = model;
  }

  search(term: string, fields: string[]) {
    if (term && fields.length) {
      this.searchFields = fields;
      this.query.$or = fields.map((field) => ({
        [field]: { $regex: term.split("").join(".*"), $options: "i" },
      })) as any;
    }
    return this;
  }

  filter(filters: Record<string, any>) {
    const cleaned = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
    );
    this.query = { ...this.query, ...cleaned };
    return this;
  }

  sort(sortStr?: string) {
    if (sortStr) {
      const order = sortStr.startsWith("-") ? -1 : 1;
      const field = sortStr.replace("-", "");
      this.sortOption = { [field]: order };
    }
    return this;
  }

  paginate(page?: number, limit?: number) {
    this.pageNum = Math.max(1, page || 1);
    this.limitNum = Math.min(100, limit || 10);
    return this;
  }

  async execute(populate?: string | string[]) {
    const skip = (this.pageNum - 1) * this.limitNum;
    const total = await this.model.countDocuments(this.query);

    let queryExec = this.model
      .find(this.query)
      .sort(this.sortOption)
      .skip(skip)
      .limit(this.limitNum);

    if (populate) {
      const fields = Array.isArray(populate) ? populate : [populate];
      fields.forEach((f) => { queryExec = queryExec.populate(f) as any; });
    }

    const data = await queryExec.lean();

    return {
      data,
      meta: {
        total,
        page: this.pageNum,
        limit: this.limitNum,
        totalPages: Math.ceil(total / this.limitNum),
        hasNext: this.pageNum < Math.ceil(total / this.limitNum),
        hasPrev: this.pageNum > 1,
      },
    };
  }
}
