import QueryBuilder from "../../builder/QueryBuilder";
import Product from "../products/products.model";

const getMyListingProduct = async (sellerId: string,query:Record<string, unknown>) => {
    const queryBuilder = new QueryBuilder(Product.find({sellerId}), query);
    const listing = await queryBuilder
      .filter()
      .sort()
      .paginate()
      .fields()
      .modelQuery.exec();
  
    const meta = await queryBuilder.countTotal();
    return { listing, meta };
};
const getMyPercess = async (id: string) => {
    // const myListing = await 
};
export const AccauntService = {
    getMyListingProduct,
  getMyPercess,
};
