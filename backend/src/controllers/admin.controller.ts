import { Response } from 'express';
import User from '../models/User';
import Listing from '../models/Listing';
import Booking from '../models/Booking';
import { AuthRequest } from '../middleware/auth';

export async function getDashboard(_req: AuthRequest, res: Response) {
  const [totalUsers, totalListings, totalBookings, pendingListings] = await Promise.all([
    User.countDocuments(),
    Listing.countDocuments(),
    Booking.countDocuments(),
    Listing.countDocuments({ status: 'pending' }),
  ]);

  const recentListings = await Listing.find()
    .sort('-createdAt')
    .limit(5)
    .populate('landlord', 'name')
    .lean();

  const recentBookings = await Booking.find()
    .sort('-createdAt')
    .limit(5)
    .populate('listing', 'title')
    .populate('tenant', 'name')
    .lean();

  res.json({ totalUsers, totalListings, totalBookings, pendingListings, recentListings, recentBookings });
}

export async function getUsers(req: AuthRequest, res: Response) {
  const { page = 1, limit = 20, search, role } = req.query as any;
  const filter: any = {};
  if (role)   filter.role = role;
  if (search) filter.$or = [
    { name:  new RegExp(search, 'i') },
    { email: new RegExp(search, 'i') },
  ];

  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(parseInt(limit)),
    User.countDocuments(filter),
  ]);
  res.json({ users, total });
}

export async function updateUser(req: AuthRequest, res: Response) {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(user);
}

export async function deleteUser(req: AuthRequest, res: Response) {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
}

export async function featureListing(req: AuthRequest, res: Response) {
  const { days = 7 } = req.body;
  const until = new Date(Date.now() + days * 86400000);
  const listing = await Listing.findByIdAndUpdate(
    req.params.id,
    { featured: true, featureUntil: until },
    { new: true },
  );
  res.json(listing);
}

export async function approveListings(req: AuthRequest, res: Response) {
  const { ids, status } = req.body;
  await Listing.updateMany({ _id: { $in: ids } }, { status });
  res.json({ updated: ids.length });
}

export async function getAllListings(req: AuthRequest, res: Response) {
  const { page = 1, limit = 20, status, city } = req.query as any;
  const filter: any = {};
  if (status) filter.status = status;
  if (city)   filter['location.city'] = new RegExp(city, 'i');

  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('landlord', 'name email'),
    Listing.countDocuments(filter),
  ]);
  res.json({ listings, total });
}
