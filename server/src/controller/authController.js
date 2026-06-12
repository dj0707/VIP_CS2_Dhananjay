import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { User } from '../model/User.js';

function createToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

function cleanUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    department: user.department,
    ratingAverage: user.ratingAverage,
    ratingCount: user.ratingCount
  };
}

function matchesPortal(role, expectedRole) {
  if (!expectedRole) return true;
  if (expectedRole === 'ADMIN') return ['ADMIN', 'SUPER_ADMIN'].includes(role);
  if (expectedRole === 'AGENT') return ['AGENT', 'SENIOR_AGENT'].includes(role);
  return role === expectedRole;
}

function validateCaptcha(captchaToken, captchaAnswer) {
  try {
    const decoded = jwt.verify(captchaToken, process.env.JWT_SECRET);
    return decoded.type === 'captcha' && Number(captchaAnswer) === decoded.answer;
  } catch (_error) {
    return false;
  }
}

export function getCaptcha(_req, res) {
  const left = Math.floor(Math.random() * 9) + 1;
  const right = Math.floor(Math.random() * 9) + 1;
  const operator = Math.random() > 0.5 ? '+' : '-';
  const first = operator === '-' ? Math.max(left, right) : left;
  const second = operator === '-' ? Math.min(left, right) : right;
  const answer = operator === '+' ? first + second : first - second;
  const captchaToken = jwt.sign({ type: 'captcha', answer }, process.env.JWT_SECRET, { expiresIn: '5m' });
  res.json({ question: `${first} ${operator} ${second} = ?`, captchaToken });
}

export function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({ message: errors.array().map((error) => error.msg).join(', ') });
}

export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Authentication token is required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.active) return res.status(401).json({ message: 'User account unavailable' });

    req.user = user;
    next();
  } catch (_error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Access denied' });
    next();
  };
}

export async function register(req, res, next) {
  try {
    if (!validateCaptcha(req.body.captchaToken, req.body.captchaAnswer)) {
      return res.status(400).json({ message: 'Incorrect or expired CAPTCHA' });
    }
    const existing = await User.findOne({ email: req.body.email });
    if (existing) return res.status(409).json({ message: 'Email is already registered' });

    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
      role: 'USER',
      emailVerified: true
    });
    res.status(201).json({ token: createToken(user), user: cleanUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    if (!validateCaptcha(req.body.captchaToken, req.body.captchaAnswer)) {
      return res.status(400).json({ message: 'Incorrect or expired CAPTCHA' });
    }
    const user = await User.findOne({ email: req.body.email }).select('+password');
    if (!user || !(await user.matchPassword(req.body.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!matchesPortal(user.role, req.body.expectedRole)) {
      return res.status(403).json({ message: `Use the ${user.role.toLowerCase()} login page` });
    }

    res.json({ token: createToken(user), user: cleanUser(user) });
  } catch (error) {
    next(error);
  }
}

export function me(req, res) {
  res.json({ user: cleanUser(req.user) });
}
