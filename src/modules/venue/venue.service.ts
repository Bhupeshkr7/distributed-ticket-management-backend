import { CustomError } from "../../shared/error/custom.error";
import { QueryBuilder } from "../../utils/query-builder.util";
import { getOrSetCache, invalidateCache, invalidateCacheByPattern } from "../../utils/redis/redis.cache";
import { CacheKeys, CacheTTL } from "../../utils/redis/redis.keys";
import { CreateVenueDTO, UpdateVenueDTO, VenueQueryDTO } from "./venue.dto";
import { VenueModel } from "./venue.model";

export const createVenue = async (data: CreateVenueDTO) => {
  const existing = await VenueModel.findOne({ name: data.name, city: data.city }).lean();
  if (existing) throw new CustomError("Venue already exists in this city", 400);
  
  const venue = await VenueModel.create(data);
  await invalidateCacheByPattern("venues:list:*");
  return venue;
};

export const getAllVenues = async (query: VenueQueryDTO) => {
  const key = CacheKeys.venuesList(JSON.stringify(query));

  return await getOrSetCache(key, CacheTTL.VENUE_LIST, async () => {
    return await new QueryBuilder(VenueModel)
      .search(query.search || "", ["name", "city"])
      .filter({ ...(query.city && { city: query.city }) })
      .sort(query.sort)
      .paginate(query.page, query.limit)
      .execute();
  });
};

export const getVenueById = async (id: string) => {
  const key = CacheKeys.venueDetail(id);

  return await getOrSetCache(key, CacheTTL.VENUE_DETAIL, async () => {
    const venue = await VenueModel.findById(id).lean();
    if (!venue) throw new CustomError("Venue not found", 404);
    return venue;
  });
};

export const updateVenue = async (id: string, data: UpdateVenueDTO) => {
  const venue = await VenueModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  if (!venue) throw new CustomError("Venue not found", 404);

  await Promise.all([
    invalidateCache(CacheKeys.venueDetail(id)),
    invalidateCacheByPattern("venues:list:*"),
  ]);

  return venue;
};

export const deleteVenue = async (id: string) => {
  const venue = await VenueModel.findByIdAndDelete(id).lean();
  if (!venue) throw new CustomError("Venue not found", 404);

  await Promise.all([
    invalidateCache(CacheKeys.venueDetail(id)),
    invalidateCacheByPattern("venues:list:*"),
  ]);
};
