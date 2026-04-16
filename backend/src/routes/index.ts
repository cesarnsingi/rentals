import { Router } from 'express';
import rateLimit   from 'express-rate-limit';
import { protect, requireRole, optionalAuth } from '../middleware/auth';
import { upload } from '../config/cloudinary';
import * as auth    from '../controllers/auth.controller';
import * as listing from '../controllers/listing.controller';
import * as booking from '../controllers/booking.controller';
import * as admin   from '../controllers/admin.controller';

const router = Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

// ── Auth ──────────────────────────────────────────────────────────────────────
router.post('/auth/register',    authLimiter, auth.register);
router.post('/auth/login',       authLimiter, auth.login);
router.post('/auth/google',      authLimiter, auth.googleAuth);
router.get('/auth/me',           protect, auth.getMe);
router.put('/auth/profile',      protect, auth.updateProfile);
router.post('/auth/push-token',  protect, auth.savePushToken);

// ── Listings ──────────────────────────────────────────────────────────────────
router.get('/listings',          optionalAuth, listing.getListings);
router.get('/listings/my',       protect, listing.getMyListings);
router.get('/listings/saved',    protect, listing.getSavedListings);
router.get('/listings/:slug',    optionalAuth, listing.getListing);
router.post('/listings',         protect, requireRole('landlord','admin'), upload.array('images', 10), listing.createListing);
router.put('/listings/:id',      protect, upload.array('images', 10), listing.updateListing);
router.delete('/listings/:id',   protect, listing.deleteListing);
router.post('/listings/:id/save',protect, listing.toggleSave);

// ── Bookings ──────────────────────────────────────────────────────────────────
router.post('/bookings',         protect, booking.createBooking);
router.get('/bookings',          protect, booking.getBookings);
router.put('/bookings/:id/status', protect, booking.updateBookingStatus);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get('/admin/dashboard',   protect, requireRole('admin'), admin.getDashboard);
router.get('/admin/users',       protect, requireRole('admin'), admin.getUsers);
router.put('/admin/users/:id',   protect, requireRole('admin'), admin.updateUser);
router.delete('/admin/users/:id',protect, requireRole('admin'), admin.deleteUser);
router.get('/admin/listings',    protect, requireRole('admin'), admin.getAllListings);
router.put('/admin/listings/:id/feature', protect, requireRole('admin'), admin.featureListing);
router.put('/admin/listings/bulk-approve', protect, requireRole('admin'), admin.approveListings);

export default router;
