const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password, first_name, last_name, phone } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { data, error } = await supabase.from('profiles').insert([
      { email, password: hashedPassword, first_name, last_name, phone, role: 'customer' }
    ]).select();

    if (error) throw error;
    res.status(201).json({ success: true, user: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data: user, error } = await supabase.from('profiles').select('*').eq('email', email).single();
    if (error || !user) return res.status(401).json({ error: 'Credenciales inválidas' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.first_name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};