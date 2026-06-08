import { CustomError } from "../../shared/error/custom.error";
import { QueryBuilder } from "../../utils/query-builder.util";
import { getOrSetCache, invalidateCache, invalidateCacheByPattern } from "../../utils/redis/redis.cache";
import { CacheKeys, CacheTTL } from "../../utils/redis/redis.keys";
import { getVenueById } from "../venue/venue.service";
import { CreateShowDTO, ShowQueryDTO, UpdateShowDTO } from "./show.dto";
import { ShowModel } from "./show.model";

export const createShow = async (data: CreateShowDTO) => {
  const venue = await getVenueById(data.venueId);

  const existing = await ShowModel.findOne({
    venueId: data.venueId,
    date: data.date,
    time: data.time,
  }).lean();
  if (existing) throw new CustomError("A show already exists at this venue, date and time", 400);

  const show = await ShowModel.create({
    ...data,
    totalSeats: data.totalSeats ?? venue.totalSeats,
    availableSeats: data.totalSeats ?? venue.totalSeats,
  });

  await invalidateCacheByPattern("shows:list:*");
  return show;
};

export const getAllShows = async (query: ShowQueryDTO) => {
  const key = CacheKeys.showsList(JSON.stringify(query));
  
  return await getOrSetCache(key, CacheTTL.SHOW_LIST, async () => {
    const filter: Record<string, any> = {};
    if (query.date) filter.date = query.date;
    if (query.venueId) filter.venueId = query.venueId;

    return await new QueryBuilder(ShowModel)
      .search(query.search || "", ["movieName"])
      .filter(filter)
      .sort(query.sort)
      .paginate(query.page, query.limit)
      .execute("venueId");
  });
};

export const getShowById = async (id: string) => {
  const key = CacheKeys.showDetail(id);
  
  return await getOrSetCache(key, CacheTTL.SHOW_DETAIL, async () => {
    const show = await ShowModel.findById(id).populate("venueId").lean();
    if (!show) throw new CustomError("Show not found", 404);
    return show;
  });
};

export const getShowsByCity = async (city: string, query: ShowQueryDTO) => {
  const key = CacheKeys.showsList(JSON.stringify({ city, ...query }));

  return await getOrSetCache(key, CacheTTL.SHOW_LIST, async () => {
    const venues = await getAllVenueIdsByCity(city);
    const filter: Record<string, any> = { venueId: { $in: venues } };
    if (query.date) filter.date = query.date;

    return await new QueryBuilder(ShowModel)
      .search(query.search || "", ["movieName"])
      .filter(filter)
      .sort(query.sort)
      .paginate(query.page, query.limit)
      .execute("venueId");
  });
};

export const updateShow = async (id: string, data: UpdateShowDTO) => {
  const show = await ShowModel.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate("venueId")
    .lean();
  if (!show) throw new CustomError("Show not found", 404);

  await Promise.all([
    invalidateCache(CacheKeys.showDetail(id)),
    invalidateCacheByPattern("shows:list:*"),
  ]);

  return show;
};

export const deleteShow = async (id: string) => {
  const show = await ShowModel.findByIdAndDelete(id).lean();
  if (!show) throw new CustomError("Show not found", 404);

  await Promise.all([
    invalidateCache(CacheKeys.showDetail(id)),
    invalidateCacheByPattern("shows:list:*"),
  ]);
};

const getAllVenueIdsByCity = async (city: string): Promise<string[]> => {
  const { data } = await import("../venue/venue.service").then((m) =>
    m.getAllVenues({ city, limit: 1000 })
  );
  return (data as any[]).map((v) => v._id.toString());
};
