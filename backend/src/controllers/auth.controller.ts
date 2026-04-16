import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function signToken(id: string, role: string) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET!, { expiresIn: '30d' });
}

// POST /api/auth/register
export async function register(req: Request, res: Response) {
  const { name, email, password, role } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already registered' });

  const user = await User.create({ name, email, password, role: role ?? 'tenant' });
  const token = signToken(user._id.toString(), user.role);

  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  });
}

// POST /api/auth/login
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.password) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await user.comparePassword(password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signToken(user._id.toString(), user.role);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  });
}

// POST /api/auth/google
export async function googleAuth(req: Request, res: Response) {
  const { idToken } = req.body;
  const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
  const payload = ticket.getPayload()!;

  let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email: payload.email }] });

  if (!user) {
    user = await User.create({
      name:       payload.name,
      email:      payload.email,
      googleId:   payload.sub,
      avatar:     payload.picture,
      isVerified: true,
    });
  } else if (!user.googleId) {
    user.googleId = payload.sub;
    if (!user.avatar) user.avatar = payload.picture;
    await user.save();
  }

  const token = signToken(user._id.toString(), user.role);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  });
}

// GET /api/auth/me
export async function getMe(req: AuthRequest, res: Response) {
  const user = await User.findById(req.user!.id).populate('savedListings', 'title images price location.city');
  res.json(user);
}

// PUT /api/auth/profile
export async function updateProfile(req: AuthRequest, res: Response) {
  const { name, phone } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user!.id,
    { name, phone },
    { new: true },
  );
  res.json(user);
}

// POST /api/auth/push-token
export async function savePushToken(req: AuthRequest, res: Response) {
  const { token } = req.body;
  await User.findByIdAndUpdate(req.user!.id, { $addToSet: { pushTokens: token } });
  res.json({ ok: true });
}
