// VERSIÓN CORREGIDA - publicBookingController.js
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

const emptyToNull = (v) => {
    if (v == null) return null;
    const s = String(v).trim();
    return s === '' ? null : s;
};

// 🔑 NUEVO: Función para obtener location_id
const getLocationId = (locationName) => {
    if (!locationName) return 1;
    const name = locationName.toLowerCase();
    if (name.includes('charlotte')) return 5;
    if (name.includes('nashville')) return 6;
    if (name.includes('miami')) return 1;
    return 1; // Default
};

exports.createPublicReservation = async (req, res) => {
    try {
        const { 
            customerData, 
            reservationData, 
            selectedCharges,
            pTime,  // ✅ RECIBIR: Hora pickup
            rTime   // ✅ RECIBIR: Hora return
        } = req.body;

        // Validaciones existentes...
        if (!customerData?.email || !reservationData?.vehicle_id) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos obligatorios (email o vehículo)'
            });
        }

        // Validación de datos completos del cliente
        const requiredCustomerFields = ['firstName', 'lastName', 'email', 'phone'];
        const missingFields = requiredCustomerFields.filter(field => !customerData[field] || customerData[field]?.trim() === '');
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Datos del cliente incompletos. Faltan: ${missingFields.join(', ')}`
            });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerData.email)) {
            return res.status(400).json({
                success: false,
                message: 'Formato de email inválido'
            });
        }

        // Validar formato de teléfono (si se proporciona)
        if (customerData.phone) {
            const phoneRegex = /^[+]?[0-9\s\-\(\)]+$/;
            if (!phoneRegex.test(customerData.phone)) {
                return res.status(400).json({
                    success: false,
                    message: 'Formato de teléfono inválido. Use solo números, espacios, +, -, ()'
                });
            }
        }

        // Validar formato de código postal (si se proporciona) - OMITIDO: columna no existe en tabla
        // const zip = customerData.zip;
        // if (zip && !/^[0-9\-\s]{3,10}$/.test(zip)) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Formato de código postal inválido'
        //     });
        // }

        // 🔑 INSERCIÓN DIRECTA A SUPABASE (SIN RPC)
        console.log(' Creando cliente y reserva directamente...');
        
        // 1. Verificar si cliente existe, si no crearlo con esquema real
        let customer;
        const { data: existingCustomer, error: searchError } = await supabase
            .from('customers')
            .select('id, first_name, last_name, airline_info')
            .eq('email', customerData.email)
            .maybeSingle();

        if (searchError) {
            console.error('Error buscando cliente:', searchError);
            return res.status(500).json({
                success: false,
                message: 'Error verificando cliente',
                error: searchError.message
            });
        }

        if (existingCustomer) {
            console.log(' Cliente existente encontrado, ID:', existingCustomer.id);
            console.log(' DEBUG - Airline info del cliente existente:', existingCustomer.airline_info);
            
            // Si el cliente existente no tiene airline_info pero el nuevo formulario sí, actualizarlo
            if (!existingCustomer.airline_info && customerData.airlineInfo) {
                console.log(' DEBUG - Actualizando airline_info del cliente existente...');
                const { data: updatedCustomer, error: updateError } = await supabase
                    .from('customers')
                    .update({ airline_info: customerData.airlineInfo })
                    .eq('id', existingCustomer.id)
                    .select()
                    .single();
                
                if (updateError) {
                    console.error('Error actualizando airline_info:', updateError);
                } else {
                    console.log(' DEBUG - Airline info actualizada exitosamente:', updatedCustomer.airline_info);
                    customer = updatedCustomer;
                }
            } else {
                customer = existingCustomer;
            }
        } else {
            console.log(' Creando nuevo cliente con esquema real...');
            
            // DEBUG: Verificar que llegue airlineInfo
            console.log(' DEBUG - customerData.airlineInfo:', customerData.airlineInfo);
            console.log(' DEBUG - customerData completo:', JSON.stringify(customerData, null, 2));
            
            // 1. Crear customer directamente (sin relación con users)
            const { data: newCustomer, error: customerError } = await supabase
                .from('customers')
                .insert([{
                    first_name: customerData.firstName,      // TEXT NOT NULL
                    last_name: customerData.lastName,        // TEXT NOT NULL
                    email: customerData.email,              // TEXT NOT NULL
                    phone: customerData.phone,              // TEXT NULL
                    address: customerData.street1,          // TEXT NULL
                    city: customerData.city,                // TEXT NULL
                    state: customerData.state,              // TEXT NULL
                    zip_code: customerData.zip,              // TEXT NULL
                    country: customerData.country,          // TEXT NULL
                    birthday: customerData.birthday,        // DATE NULL
                    other_email: customerData.otherEmail,   // TEXT NULL
                    other_phone: customerData.otherPhone,   // TEXT NULL
                    license_number: customerData.licenseNumber, // TEXT NULL
                    license_state: customerData.licenseState,   // TEXT NULL
                    license_expiry: customerData.licenseExpiry, // DATE NULL
                    airline_info: customerData.airlineInfo,   // TEXT NULL
                    created_at: new Date().toISOString()    // TIMESTAMP NULL
                }])
                .select()
                .single();

            if (customerError) {
                console.error('Error creando cliente:', customerError);
                return res.status(500).json({
                    success: false,
                    message: 'Error al crear cliente',
                    error: customerError.message
                });
            }

            // DEBUG: Verificar datos guardados
            console.log(' DEBUG - Customer creado exitosamente:');
            console.log(' DEBUG - ID:', newCustomer.id);
            console.log(' DEBUG - Airline info guardada:', newCustomer.airline_info);
            console.log(' DEBUG - Datos completos:', JSON.stringify(newCustomer, null, 2));

            customer = newCustomer;
        }

        // 2. Validar existencia de vehículo
        const { data: vehicleExists, error: vehicleError } = await supabase
            .from('vehicles')
            .select('id')
            .eq('id', reservationData.vehicle_id)
            .single();

        if (vehicleError || !vehicleExists) {
            console.error('Vehículo no encontrado:', reservationData.vehicle_id);
            return res.status(400).json({
                success: false,
                message: 'Vehículo no disponible',
                error: 'Vehicle not found'
            });
        }

        // 3. Crear reserva (solo campos reales del esquema)
        const { data: reservation, error: reservationError } = await supabase
            .from('reservations')
            .insert([{
                customer_id: customer.id, // FK a customers (obligatorio) - CORREGIDO
                vehicle_id: reservationData.vehicle_id,
                pickup_date: reservationData.pickup_date,
                return_date: reservationData.return_date,
                pickup_location: reservationData.pickup_location,
                return_location: reservationData.return_location,
                total_days: Math.ceil((new Date(reservationData.return_date) - new Date(reservationData.pickup_date)) / (1000 * 60 * 60 * 24)) || 1, // Calcular días entre fechas
                base_price: reservationData.total_amount * 0.8, // 80% base
                discount_amount: 0, // Sin descuento por ahora
                tax_amount: reservationData.total_amount * 0.2, // 20% impuestos
                total_amount: reservationData.total_amount,
                status: 'CONFIRMED', // reservation_status enum
                payment_status: 'PAID', // payment_status enum
                payment_method: 'CREDIT_CARD', // payment_method enum (valor válido)
                notes: reservationData.notes,
                customer_email: customerData.email, // Campo adicional del esquema - CORREGIDO
                created_at: new Date().toISOString()
            }])
            .select();

        if (reservationError) {
            console.error('Error creando reserva:', reservationError);
            return res.status(500).json({
                success: false,
                message: 'Error al crear reserva',
                error: reservationError.message
            });
        }

        // 4. Validar y crear cargos extras si existen
        if (selectedCharges && Object.keys(selectedCharges).length > 0) {
            // Validar que todos los charges existan
            const chargeIds = Object.values(selectedCharges).map(charge => charge.id);
            const { data: existingCharges, error: chargesValidationError } = await supabase
                .from('charges')
                .select('id, name')
                .in('id', chargeIds);

            if (chargesValidationError) {
                console.error('Error validando cargos:', chargesValidationError);
                return res.status(500).json({
                    success: false,
                    message: 'Error validando cargos disponibles',
                    error: chargesValidationError.message
                });
            }

            if (existingCharges.length !== chargeIds.length) {
                console.error('Algunos cargos no existen');
                return res.status(400).json({
                    success: false,
                    message: 'Algunos cargos seleccionados no están disponibles'
                });
            }

            // Obtener brand_id según ubicación
            const locationId = getLocationId(reservationData.pickup_location);
            const brandId = locationId === 6 ? '3' : locationId === 5 ? '2' : '1';
            
            const chargesToInsert = Object.values(selectedCharges).map(charge => ({
                reservation_id: reservation[0].id, // FK a reservations
                charge_id: charge.id, // FK a charges (integer)
                name: charge.name, // Campo obligatorio del esquema
                amount: charge.percent_amount?.[brandId]?.amount || charge.percent_amount?.['1']?.amount || 0, // NUMERIC(10,2) - CORREGIDO
                created_at: new Date().toISOString() // TIMESTAMP
            }));

            const { error: chargesError } = await supabase
                .from('reservation_charges')
                .insert(chargesToInsert);

            if (chargesError) {
                console.error('Error creando cargos:', chargesError);
                return res.status(500).json({
                    success: false,
                    message: 'Error al crear cargos extras',
                    error: chargesError.message
                });
            }
        }

        // 4. Generar código de reserva
        const reservationCode = 'HP' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();

        // 5. Actualizar reserva con código
        const { error: updateError } = await supabase
            .from('reservations')
            .update({ reservation_code: reservationCode })
            .eq('id', reservation[0].id);

        if (updateError) {
            console.error('Error actualizando código:', updateError);
        }

        // 6. Respuesta exitosa
        return res.status(200).json({
            success: true,
            message: 'Reserva creada exitosamente',
            data: {
                id: reservation[0].id,
                reservation_code: reservationCode,
                customer: customer,
                reservation: reservation[0]
            }
        });

    } catch (error) {
        console.error('Error general en creación:', error);
        return res.status(500).json({
            success: false,
            message: 'Error general: ' + error.message,
            error: error.message
        });
    }
};
