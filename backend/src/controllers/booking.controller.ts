import { Response } from 'express';
import Booking from '../models/Booking';
import Listing from '../models/Listing';
import { AuthRequest } from '../middleware/auth';

// POST /api/bookings
export async function createBooking(req: AuthRequest, res: Response) {
  const { listingId, startDate, endDate, message } = req.body;

  const listing = await Listing.findById(listingId);
  if (!listing) return res.status(404).json({ message: 'Listing not found' });
  if (listing.status !== 'available') return res.status(400).json({ message: 'Not available' });

  const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000);
  const totalPrice = listing.pricePeriod === 'month'
    ? listing.price * Math.ceil(days / 30)
    : listing.pricePeriod === 'week'
    ? listing.price * Math.ceil(days / 7)
    : listing.price * days;

  const booking = await Booking.create({
    listing:    listingId,
    tenant:     req.user!.id,
    landlord:   listing.landlord,
    startDate,
    endDate,
    totalPrice,
    currency:   listing.currency,
    message,
  });

  res.status(201).json(booking);
}

// GET /api/bookings (tenant sees own, landlord sees their listings' bookings)
export async function getBookings(req: AuthRequest, res: Response) {
  const filter = req.user!.role === 'landlord'
    ? { landlord: req.user!.id }
    : { tenant: req.user!.id };

  const bookings = await Booking.find(filter)
    .populate('listing', 'title images location price currency')
    .populate('tenant',  'name email phone')
    .sort('-createdAt')
    .lean();

  res.json(bookings);
}

// PUT /api/bookings/:id/status
export async function updateBookingStatus(req: AuthRequest, res: Response) {
  const { status } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Not found' });

  // Only landlord or admin can confirm/cancel
  if (booking.landlord.toString() !== req.user!.id && req.user!.role !== 'admin') {
    if (status !== 'cancelled' || booking.tenant.toString() !== req.user!.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  }

  booking.status = status;
  await booking.save();
  res.json(booking);
}
