import { Response } from 'express';
import slugify from 'slugify';
import Listing from '../models/Listing';
import User from '../models/User';
import { cloudinary } from '../config/cloudinary';
import { AuthRequest } from '../middleware/auth';

// GET /api/listings
export async function getListings(req: AuthRequest, res: Response) {
  const {
    city, type, minPrice, maxPrice, bedrooms, furnished,
    amenities, search, sort = '-createdAt', page = 1, limit = 12,
    featured, currency,
  } = req.query as any;

  const filter: any = { status: 'available' };

  if (city)      filter['location.city'] = new RegExp(city, 'i');
  if (type)      filter.type = type;
  if (furnished !== undefined) filter.furnished = furnished === 'true';
  if (featured)  filter.featured = true;
  if (currency)  filter.currency = currency;
  if (bedrooms)  filter.bedrooms = { $gte: parseInt(bedrooms) };
  if (amenities) filter.amenities = { $all: amenities.split(',') };

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseInt(minPrice);
    if (maxPrice) filter.price.$lte = parseInt(maxPrice);
  }

  if (search) {
    filter.$text = { $search: search };
  }

  const sortMap: any = {
    '-createdAt': { createdAt: -1 },
    'price':      { price: 1 },
    '-price':     { price: -1 },
    '-viewCount': { viewCount: -1 },
  };

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .sort(sortMap[sort] ?? { createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('landlord', 'name avatar phone')
      .lean(),
    Listing.countDocuments(filter),
  ]);

  res.json({
    listings,
    total,
    page:       parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
  });
}

// GET /api/listings/:slug
export async function getListing(req: AuthRequest, res: Response) {
  const listing = await Listing.findOne({
    $or: [{ slug: req.params.slug }, { _id: req.params.slug.length === 24 ? req.params.slug : null }],
  }).populate('landlord', 'name avatar phone email');

  if (!listing) return res.status(404).json({ message: 'Listing not found' });

  // Increment view count (non-blocking)
  Listing.findByIdAndUpdate(listing._id, { $inc: { viewCount: 1 } }).exec();

  res.json(listing);
}

// POST /api/listings
export async function createListing(req: AuthRequest, res: Response) {
  const data = JSON.parse(req.body.data ?? '{}');
  const files = (req.files as Express.Multer.File[]) ?? [];

  const images = files.map((f: any) => ({ url: f.path, publicId: f.filename }));

  const slug = slugify(data.title, { lower: true, strict: true }) + '-' + Date.now();

  const listing = await Listing.create({
    ...data,
    slug,
    images,
    landlord: req.user!.id,
    location: typeof data.location === 'string' ? JSON.parse(data.location) : data.location,
    amenities: typeof data.amenities === 'string' ? JSON.parse(data.amenities) : (data.amenities ?? []),
  });

  res.status(201).json(listing);
}

// PUT /api/listings/:id
export async function updateListing(req: AuthRequest, res: Response) {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return res.status(404).json({ message: 'Not found' });

  if (listing.landlord.toString() !== req.user!.id && req.user!.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const data = JSON.parse(req.body.data ?? '{}');
  const newFiles = (req.files as Express.Multer.File[]) ?? [];
  const newImages = newFiles.map((f: any) => ({ url: f.path, publicId: f.filename }));

  // Merge existing images (keep those not deleted)
  const keepImages = JSON.parse(req.body.keepImages ?? '[]');
  const keptExisting = listing.images.filter((img) => keepImages.includes(img.publicId));

  // Delete removed images from Cloudinary
  const removedIds = listing.images
    .filter((img) => !keepImages.includes(img.publicId))
    .map((img) => img.publicId);
  await Promise.all(removedIds.map((id) => cloudinary.uploader.destroy(id)));

  const updated = await Listing.findByIdAndUpdate(
    req.params.id,
    { ...data, images: [...keptExisting, ...newImages] },
    { new: true },
  );

  res.json(updated);
}

// DELETE /api/listings/:id
export async function deleteListing(req: AuthRequest, res: Response) {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return res.status(404).json({ message: 'Not found' });

  if (listing.landlord.toString() !== req.user!.id && req.user!.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  // Delete images from Cloudinary
  await Promise.all(listing.images.map((img) => cloudinary.uploader.destroy(img.publicId)));

  await listing.deleteOne();
  res.json({ message: 'Deleted' });
}

// POST /api/listings/:id/save  (toggle save)
export async function toggleSave(req: AuthRequest, res: Response) {
  const user = await User.findById(req.user!.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const listingId = req.params.id as any;
  const index = user.savedListings.findIndex((id) => id.toString() === listingId.toString());

  if (index === -1) {
    user.savedListings.push(listingId);
  } else {
    user.savedListings.splice(index, 1);
  }

  await user.save();
  res.json({ saved: index === -1, count: user.savedListings.length });
}

// GET /api/listings/my  (landlord's own listings)
export async function getMyListings(req: AuthRequest, res: Response) {
  const listings = await Listing.find({ landlord: req.user!.id })
    .sort('-createdAt')
    .lean();
  res.json(listings);
}

// GET /api/listings/saved
export async function getSavedListings(req: AuthRequest, res: Response) {
  const user = await User.findById(req.user!.id)
    .populate({
      path: 'savedListings',
      populate: { path: 'landlord', select: 'name phone' },
    });
  res.json(user?.savedListings ?? []);
}
