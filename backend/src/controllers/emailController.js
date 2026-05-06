const nodemailer = require('nodemailer');
const supabase = require('../config/supabase');

// Obtener configuración de email desde Supabase
async function getEmailConfig() {
  try {
    const { data, error } = await supabase
      .from('email_config')
      .select('*')
      .eq('active', true)
      .single();
    
    if (error || !data) {
      console.error('Error obteniendo configuración de email:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Error en getEmailConfig:', err);
    return null;
  }
}

// Enviar email
async function sendEmail(to, subject, htmlContent) {
  try {
    const config = await getEmailConfig();
    
    if (!config || !config.smtp_user || !config.smtp_pass) {
      throw new Error('Configuración de email no encontrada o incompleta');
    }
    
    const transporter = nodemailer.createTransport({
      host: config.smtp_host,
      port: config.smtp_port,
      secure: false,
      auth: {
        user: config.smtp_user,
        pass: config.smtp_pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    const mailOptions = {
      from: config.email_from || config.smtp_user,
      to: config.email_to || to,
      subject: subject,
      html: htmlContent
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado via SMTP:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Error enviando email:', err);
    throw err;
  }
}

// Guardar configuración de email
exports.saveEmailConfig = async (req, res) => {
  try {
    const { smtp_host, smtp_port, smtp_user, smtp_pass, email_from, email_to, active } = req.body;
    
    const { data, error } = await supabase
      .from('email_config')
      .upsert({
        id: 1,
        smtp_host: smtp_host || 'smtp.gmail.com',
        smtp_port: smtp_port || 587,
        smtp_user,
        smtp_pass,
        email_from,
        email_to: email_to || 'info@hpower.com',
        active: active !== false
      }, { onConflict: 'id' });
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Configuración de email guardada correctamente' });
  } catch (err) {
    console.error('Error guardando configuración de email:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Obtener configuración de email
exports.getEmailConfig = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('email_config')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (error) throw error;
    
    // No devolver la contraseña por seguridad
    if (data) {
      delete data.smtp_pass;
    }
    
    res.json({ success: true, config: data });
  } catch (err) {
    console.error('Error obteniendo configuración de email:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Probar envío de email
exports.testEmail = async (req, res) => {
  try {
    const config = await getEmailConfig();
    
    if (!config || !config.smtp_user || !config.smtp_pass) {
      return res.status(400).json({ success: false, error: 'Configuración de email incompleta' });
    }
    
    const testHtml = `
      <h2>Prueba de Email - Hpower Car Rental</h2>
      <p>Este es un email de prueba para verificar que la configuración de SMTP es correcta.</p>
      <p><strong>Configuración:</strong></p>
      <ul>
        <li>SMTP Host: ${config.smtp_host}</li>
        <li>SMTP Port: ${config.smtp_port}</li>
        <li>Email From: ${config.email_from}</li>
        <li>Email To: ${config.email_to}</li>
      </ul>
      <p>Si recibes este email, la configuración es correcta.</p>
    `;
    
    const result = await sendEmail(config.email_to, 'Prueba de Email - Hpower Car Rental', testHtml);
    
    res.json({ success: true, message: 'Email de prueba enviado correctamente', result });
  } catch (err) {
    console.error('Error en prueba de email:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Enviar email de contacto
exports.sendContactEmail = async (req, res) => {
  try {
    const { name, email, phone, branch, subject, message } = req.body;
    
    // Validar campos requeridos
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, error: 'Todos los campos requeridos deben ser completados' });
    }
    
    const config = await getEmailConfig();
    
    if (!config || !config.smtp_user || !config.smtp_pass) {
      console.log('⚠️ Configuración de email no encontrada, solo logueando mensaje');
      console.log('📧 Nuevo mensaje de contacto:', { name, email, phone, branch, subject, message });
      return res.json({ success: true, message: 'Mensaje recibido (email no configurado)' });
    }
    
    // Obtener nombre de la ubicación desde Supabase
    let branchName = branch || 'No seleccionada';
    if (branch) {
      try {
        const { data: locationData } = await supabase
          .from('locations')
          .select('city, state')
          .eq('id', parseInt(branch))
          .single();
        
        if (locationData) {
          branchName = `${locationData.city}, ${locationData.state}`;
        }
      } catch (err) {
        console.error('Error obteniendo nombre de ubicación:', err);
      }
    }
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px; background: #4ecca3;">
          <img src="https://xtvopaehirznzeyuanwc.supabase.co/storage/v1/object/public/logos/logo_hpower.png" alt="Hpower Car Rental" style="max-width: 200px; height: auto;">
        </div>
        <div style="padding: 30px 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Nuevo mensaje de Contacto</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Nombre:</strong> ${name}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 10px 0;"><strong>Teléfono:</strong> ${phone || 'No proporcionado'}</p>
            <p style="margin: 10px 0;"><strong>Sucursal:</strong> ${branchName}</p>
            <p style="margin: 10px 0;"><strong>Asunto:</strong> ${subject}</p>
          </div>
          <div style="background: #e9ecef; padding: 20px; border-radius: 8px;">
            <p style="margin: 0 0 10px 0;"><strong>Mensaje:</strong></p>
            <p style="white-space: pre-wrap; margin: 0;">${message}</p>
          </div>
          <p style="margin-top: 20px; color: #666; font-size: 12px;">
            Este mensaje fue enviado desde el formulario de contacto de Hpower Car Rental.
          </p>
        </div>
        <div style="text-align: center; padding: 20px; background: #4ecca3; color: white; font-size: 12px;">
          <p style="margin: 0;">© 2024 Hpower Car Rental. Todos los derechos reservados.</p>
        </div>
      </div>
    `;
    
    const result = await sendEmail(config.email_to, `Nuevo Contacto: ${subject}`, htmlContent);
    
    console.log('📧 Nuevo mensaje de contacto enviado por email:', { name, email, subject });
    res.json({ success: true, message: 'Mensaje enviado correctamente', result });
  } catch (err) {
    console.error('Error enviando email de contacto:', err);
    res.status(500).json({ success: false, error: 'Error al enviar mensaje' });
  }
};
