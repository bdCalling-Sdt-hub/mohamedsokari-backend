import { FilterQuery, Query } from 'mongoose';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';


class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields: string[]) {
    const searchTerm = this.query?.searchTerm as string;
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map(
          (field) =>
            ({
              [field]: { $regex: searchTerm, $options: 'i' },
            }) as FilterQuery<T>,
        ),
      });
    }
    return this;
  }

  filter() {
    const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields', 'minPrice', 'maxPrice'];
    const queryObj = { ...this.query };
    excludeFields.forEach((el) => delete queryObj[el]);

    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
    return this;
  }

  priceFilter(priceField: string = 'price') {
    const minPrice = this.query?.minPrice ? Number(this.query.minPrice) : undefined;
    const maxPrice = this.query?.maxPrice ? Number(this.query.maxPrice) : undefined;
    
    const priceFilter: Record<string, unknown> = {};
    
    if (minPrice !== undefined) {
      priceFilter[priceField] = { ...priceFilter[priceField] as object, $gte: minPrice };
    }
    
    if (maxPrice !== undefined) {
      priceFilter[priceField] = { 
        ...(priceFilter[priceField] as object || {}), 
        $lte: maxPrice 
      };
    }
    
    if (Object.keys(priceFilter).length > 0) {
      this.modelQuery = this.modelQuery.find(priceFilter as FilterQuery<T>);
    }
    
    return this;
  }

  sort() {
    const sort =
      (this.query?.sort as string)?.split(',')?.join(' ') || '-createdAt';
    this.modelQuery = this.modelQuery.sort(sort as string);
    return this;
  }

  paginate(defaultLimit = 10) {
    const page = Number(this.query?.page) || 1;
    const limit = Number(this.query?.limit) || defaultLimit;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit).sort();
    return this;
  }

  fields() {
    const fields =
      (this.query?.fields as string)?.split(',')?.join(' ') || '-__v';
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  async countTotal() {
    try {
      const totalQueries = this.modelQuery.getFilter();
      const total = await this.modelQuery.model.countDocuments(totalQueries);
      const page = Number(this.query?.page) || 1;
      const limit = Number(this.query?.limit) || 10;
      const totalPage = Math.ceil(total / limit);

      return { page, limit, total, totalPage };
    } catch (error) {
      throw new AppError(StatusCodes.SERVICE_UNAVAILABLE, error as string);
    }
  }
}

export default QueryBuilder;