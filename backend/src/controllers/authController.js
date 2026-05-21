const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/userModel');

const signToken = (user) =>
  jwt.sign(
    { id: user._id || user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { full_name, email, password, phone } = req.body;
    const existing = await User.findByEmail(email);
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

    const password_hash = await bcrypt.hash(password, 10);
    const newUser = new User({ full_name, email, password_hash, phone });
    await newUser.save();

    const token = signToken(newUser);
    const { password_hash: _, __v, ...safeUser } = newUser.toObject();
    res.status(201).json({ success: true, token, user: { ...safeUser, id: newUser._id } });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!user.is_active) return res.status(403).json({ success: false, message: 'Account disabled' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = signToken(user);
    const { password_hash, __v, _id, ...rest } = user;
    res.json({ success: true, token, user: { ...rest, id: _id } });
  } catch (err) { next(err); }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password_hash -__v').lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: { ...user, id: user._id } });
  } catch (err) { next(err); }
};

exports.updateMe = async (req, res, next) => {
  try {
    const { full_name, phone } = req.body;
    const updates = {};
    if (full_name) updates.full_name = full_name;
    if (phone !== undefined) updates.phone = phone;
    if (req.file) updates.avatar = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true })
      .select('-password_hash -__v').lean();
    res.json({ success: true, user: { ...user, id: user._id } });
  } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    const password_hash = await bcrypt.hash(new_password, 10);
    await User.findByIdAndUpdate(req.user.id, { $set: { password_hash } });
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) { next(err); }
};
