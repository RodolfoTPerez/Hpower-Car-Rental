// i18n translations for Hpower Car Rental - Consolidated
// This file consolidates all translations from all HTML pages

const translations = {
    es: {
        nav: {
            home: 'Inicio',
            fleet: 'Flota',
            book: 'Reservar',
            contact: 'Contacto',
            about: 'Sobre Nosotros'
        },
        pickup: {
            title: 'Recogida',
            location: 'Ubicación',
            date: 'Fecha',
            time: 'Hora',
            sameLocation: 'Devolver en la misma ubicación'
        },
        return: {
            title: 'Devolución',
            location: 'Ubicación',
            date: 'Fecha',
            time: 'Hora'
        },
        select: {
            city: 'Ciudad...'
        },
        button: {
            search: 'RESERVAR AHORA →',
            back: '← Volver'
        },
        results: {
            title: 'Vehículos Disponibles'
        },
        terms: {
            heroTitle: 'Términos y Condiciones',
            heroSubtitle: 'Información importante sobre nuestro servicio de alquiler de vehículos.',
            updated: 'Última actualización: Abril 2026',
            tocTitle: 'Contenido',
            toc1: 'Requisitos de Alquiler',
            toc2: 'Seguro y Cobertura',
            toc3: 'Política de Combustible',
            toc4: 'Política de Cancelación',
            toc5: 'Límite de Millas',
            toc6: 'Daños y Responsabilidad',
            toc7: 'Conductores Adicionales',
            toc8: 'Viajes entre Estados',
            s1Title: 'Requisitos de Alquiler',
            s1p1: 'Para alquilar un vehículo con Hpower Car Rental, el arrendatario debe cumplir con los siguientes requisitos:',
            s1l1: 'Tener al menos 21 años de edad. Los conductores menores de 25 años pueden estar sujetos a un recargo por conductor joven.',
            s1l2: 'Presentar una licencia de conducir válida y vigente. Se aceptan licencias internacionales con traducción oficial.',
            s1l3: 'Disponer de una tarjeta de crédito válida a nombre del conductor principal para el depósito de seguridad.',
            s1l4: 'Presentar un documento de identidad vigente (pasaporte para visitantes internacionales).',
            s1note: '⚠️ No se aceptan tarjetas de débito como forma de pago para el depósito de seguridad.',
            s2Title: 'Seguro y Cobertura',
            s2p1: 'Todos los vehículos de Hpower Car Rental incluyen seguro de responsabilidad civil básico (State Minimum Liability Insurance). Opciones adicionales disponibles:',
            s2l1: '<strong>CDW (Collision Damage Waiver)</strong> — Reduce la responsabilidad del arrendatario en caso de colisión. Desde $15/día.',
            s2l2: '<strong>SLI (Supplemental Liability Insurance)</strong> — Cobertura adicional de responsabilidad civil hasta $1,000,000. Desde $12/día.',
            s2l3: '<strong>PAI (Personal Accident Insurance)</strong> — Cobertura médica para el conductor y pasajeros. Desde $5/día.',
            s2l4: '<strong>Protección contra Robo</strong> — Cobertura en caso de robo del vehículo. Desde $9/día.',
            s3Title: 'Política de Combustible',
            s3p1: 'Hpower Car Rental opera bajo la política de "tanque lleno a tanque lleno" (Full-to-Full):',
            s3l1: 'El vehículo se entrega con el tanque de combustible lleno.',
            s3l2: 'El arrendatario debe devolver el vehículo con el tanque lleno.',
            s3l3: 'Si el tanque no está lleno al momento de la devolución, se cobrará un cargo por combustible más una tarifa de servicio de reabastecimiento.',
            s3l4: 'Se acepta como combustible solamente el tipo indicado en la etiqueta del tanque del vehículo.',
            s3note: '💡 Recomendamos recargar en una estación cercana al punto de devolución para evitar cargos adicionales.',
            s4Title: 'Política de Cancelación',
            s4p1: 'Nuestra política de cancelación es la siguiente:',
            s4l1: '<strong>Más de 48 horas antes</strong> de la recogida: cancelación gratuita, reembolso completo.',
            s4l2: '<strong>Entre 24 y 48 horas antes</strong> de la recogida: cargo del 25% del total de la reserva.',
            s4l3: '<strong>Menos de 24 horas antes</strong> de la recogida: cargo del 50% del total de la reserva.',
            s4l4: '<strong>No-Show</strong> (no presentarse): cargo del 100% del total de la reserva.',
            s5Title: 'Límite de Millas',
            s5p1: 'Dependiendo de la categoría de vehículo y la duración del alquiler, las millas pueden ser limitadas o ilimitadas:',
            s5l1: '<strong>Alquileres diarios y semanales</strong>: Millas ilimitadas incluidas en todas las categorías.',
            s5l2: '<strong>Alquileres mensuales</strong>: Incluyen hasta 2,500 millas por mes. Millas adicionales a $0.25/milla.',
            s5l3: '<strong>Vehículos Premium/Lujo</strong>: Pueden tener restricciones adicionales. Consultar al momento de la reserva.',
            s6Title: 'Daños y Responsabilidad',
            s6p1: 'El arrendatario es responsable de cualquier daño al vehículo durante el período de alquiler:',
            s6l1: 'Se realizará una inspección conjunta del vehículo al momento de la recogida y devolución.',
            s6l2: 'Cualquier daño no reportado previamente será cargado al arrendatario.',
            s6l3: 'La responsabilidad máxima del arrendatario (sin cobertura CDW) es el valor total de reparación o reemplazo del vehículo.',
            s6l4: 'Los daños a neumáticos, parabrisas y tren inferior no están cubiertos por la póliza estándar.',
            s6note: '⚠️ Recomendamos tomar fotografías del vehículo al momento de la recogida como evidencia del estado inicial.',
            s7Title: 'Conductores Adicionales',
            s7p1: 'Se pueden agregar conductores adicionales bajo las siguientes condiciones:',
            s7l1: 'Cargo adicional de $10/día por cada conductor adicional.',
            s7l2: 'Cada conductor adicional debe cumplir con los mismos requisitos de edad y licencia.',
            s7l3: 'El cónyuge o pareja doméstica puede ser agregado sin cargo adicional (con documentación válida).',
            s7l4: 'Máximo de 3 conductores adicionales por contrato de alquiler.',
            s8Title: 'Viajes entre Estados',
            s8p1: 'Los viajes entre estados están permitidos bajo las siguientes condiciones:',
            s8l1: 'Se permite conducir dentro de los Estados Unidos continentales sin cargo adicional.',
            s8l2: 'No se permite conducir fuera de los Estados Unidos (incluyendo México y Canadá) sin autorización previa.',
            s8l3: 'La devolución en una ubicación diferente (one-way) puede generar un cargo adicional según la distancia.',
            s8l4: 'El arrendatario es responsable de todas las multas de tránsito y peajes incurridos durante el alquiler.',
            s8note: '📍 Devolución entre nuestras sucursales (Miami ↔ Charlotte ↔ Nashville): cargo fijo de $75.'
        },
        footer: {
            company: 'Hpower Car Rental',
            description: 'Tu mejor opción en renta de autos<br>en Miami, Charlotte y Nashville.',
            phone: '1-800-HPOWER',
            email: 'info@hpower.com',
            quickLinks: 'Enlaces Rápidos',
            fleet: 'Nuestra Flota',
            bookNow: 'Reservar Ahora',
            terms: 'Términos y Condiciones',
            followUs: 'Síguenos',
            connect: 'Conecta con nosotros',
            copyright: ' 2026 Hpower Car Rental. Todos los derechos reservados. | Diseñado con '
        },
        home: {
            locationsTitle: 'Nuestras Sucursales Principales',
            locationsDesc: 'Vehículos listos para ti en los mejores destinos',
            availableVehicles: 'vehículos disponibles'
        },
        features: {
            fleet: {
                title: 'Flota Premium',
                desc: 'Modelos recientes en excelentes condiciones, desde económicos hasta SUVs de lujo familiares.'
            },
            noHidden: {
                title: 'Cero Cargos Ocultos',
                desc: 'Transparencia total. Lo que ves es lo que pagas, sin sorpresas en el mostrador cuando retiras.'
            },
            support: {
                title: 'Soporte VIP 24/7',
                desc: 'Estamos contigo en cada kilómetro. Te asistimos en cualquier eventualidad durante tu alquiler.'
            }
        },
        contact: {
            branchesTitle: 'Nuestras Sucursales',
            hours: 'Horario',
            miamiHours: 'Lun - Vie: 8:00 AM - 6:00 PM<br>Sáb: 9:00 AM - 4:00 PM<br>Dom: 10:00 AM - 2:00 PM',
            charlotteHours: 'Lun - Vie: 8:00 AM - 6:00 PM<br>Sáb: 9:00 AM - 4:00 PM<br>Dom: Cerrado',
            nashvilleHours: 'Lun - Vie: 8:00 AM - 6:00 PM<br>Sáb: 9:00 AM - 3:00 PM<br>Dom: Cerrado',
            heroTitle: 'Contáctanos',
            heroSubtitle: 'Estamos aquí para ayudarte. Visítanos en cualquiera de nuestras sucursales o envíanos un mensaje.',
            callUs: 'Llámanos',
            emailUs: 'Escríbenos',
            chatNow: 'Chat en vivo',
            formTitle: 'Envíanos un Mensaje',
            name: 'Nombre completo',
            email: 'Correo electrónico',
            phone: 'Teléfono',
            branch: 'Sucursal',
            selectBranch: 'Seleccionar sucursal...',
            subject: 'Asunto',
            selectSubject: 'Seleccionar asunto...',
            subjectReservation: 'Consulta sobre reserva',
            subjectPricing: 'Precios y tarifas',
            subjectComplaint: 'Queja o reclamo',
            subjectSuggestion: 'Sugerencia',
            subjectOther: 'Otro',
            message: 'Mensaje',
            send: 'Enviar Mensaje',
            successTitle: '¡Mensaje Enviado!',
            successDesc: 'Gracias por contactarnos. Te responderemos dentro de las próximas 24 horas.',
            faqTitle: 'Preguntas Frecuentes',
            faq1q: '¿Qué necesito para alquilar un vehículo?',
            faq1a: 'Necesitas tener al menos 21 años de edad, una licencia de conducir válida, una tarjeta de crédito a nombre del conductor principal y un depósito de seguridad.',
            faq2q: '¿Puedo devolver el auto en una ubicación diferente?',
            faq2a: 'Sí, ofrecemos devolución en cualquiera de nuestras 3 ubicaciones (Miami, Charlotte y Nashville). Puede aplicar un cargo adicional por devolución en una ubicación diferente.',
            faq3q: '¿El seguro está incluido en el precio?',
            faq3a: 'Sí, todos nuestros vehículos incluyen seguro de responsabilidad civil básico. También ofrecemos opciones de cobertura adicional como CDW (Collision Damage Waiver) y protección contra robo.',
            faq4q: '¿Cuál es la política de combustible?',
            faq4a: 'Entregamos el vehículo con el tanque lleno y esperamos que lo devuelvas de la misma manera. Si el tanque no está lleno al momento de la devolución, se aplicará un cargo por combustible.',
            faq5q: '¿Puedo cancelar mi reserva?',
            faq5a: 'Sí, puedes cancelar sin cargo hasta 48 horas antes de la fecha de recogida. Cancelaciones con menos de 48 horas pueden estar sujetas a un cargo del 50% del total de la reserva.',
            faq6q: '¿Aceptan conductores adicionales?',
            faq6a: 'Sí, puedes agregar conductores adicionales por un cargo diario adicional. Cada conductor adicional debe cumplir con los mismos requisitos de edad y licencia que el conductor principal.'
        },
        fleet: {
            heroTitle: 'Nuestra Flota',
            heroSubtitle: 'El vehículo perfecto te espera. Desde económicos hasta premium, tenemos la opción ideal para cada viaje.',
            allLocations: 'Todas las Ubicaciones',
            popular: 'Popular',
            familyFavorite: 'Favorito Familiar',
            economy: 'Economy',
            compact: 'Compact',
            intermediate: 'Intermediate',
            fullsize: 'Full-Size',
            premium: 'Premium / Lujo',
            orSimilar: 'o similar',
            passengers: 'pasajeros',
            bags: 'maletas',
            automatic: 'Automático',
            leather: 'Cuero',
            from: 'Desde',
            day: 'día',
            bookNow: 'Reservar',
            whyTitle: '¿Por qué elegir Hpower?',
            why1Title: 'Seguro Incluido',
            why1Desc: 'Todos nuestros vehículos incluyen seguro básico para tu tranquilidad.',
            why2Title: 'Atención 24/7',
            why2Desc: 'Soporte en carretera disponible las 24 horas, los 7 días de la semana.',
            why3Title: 'Mejores Precios',
            why3Desc: 'Tarifas competitivas sin cargos ocultos. Transparencia total.',
            why4Title: '3 Ubicaciones',
            why4Desc: 'Recoge y devuelve en Miami, Charlotte o Nashville según tu conveniencia.',
            ctaTitle: '¿Listo para conducir?',
            ctaDesc: 'Reserva tu vehículo ahora y recíbelo en cualquiera de nuestras ubicaciones.',
            ctaButton: 'RESERVAR AHORA',
            available: 'Disponibles',
            loading: 'Cargando flota...',
            noVehicles: 'No hay vehículos disponibles en esta ubicación.',
            unitsAvailable: 'disponibles'
        },
        about: {
            navSubtitle: 'Página Corporativa | Quiénes Somos',
            heroTitle: 'SOBRE <span class="logo-accent">NOSOTROS</span>',
            heroDescription: 'En HPOWER CAR RENTAL, no solo rentamos autos; entregamos las llaves de una experiencia de lujo inigualable en el corazón de Miami.',
            historyTitle: 'Nuestra Historia',
            historyP1: 'Fundada en 2018, HPOWER nació de la necesidad de elevar el estándar del alquiler de vehículos en la ciudad de Miami. Identificamos que el mercado demandaba más que movilidad: demandaba potencia, prestigio y un servicio al cliente que estuviera a la altura de los vehículos que ofrecemos.',
            historyP2: 'Lo que comenzó como una pequeña flota de deportivos se ha transformado en una de las colecciones más exclusivas de la región, atendiendo a ejecutivos, celebridades y viajeros que buscan lo extraordinario.',
            mission: 'Misión',
            missionText: 'Proveer soluciones de movilidad de lujo con un enfoque obsesivo en la puntualidad y la satisfacción del cliente.',
            vision: 'Visión',
            visionText: 'Ser el referente global de renta de autos de lujo en Florida, destacando por nuestra flota moderna y ética profesional.',
            yearsOfExcellence: 'Años de Excelencia',
            standardTitle: 'El Estándar HPOWER',
            standardSubtitle: 'Nuestros pilares fundamentales',
            securityTitle: 'Seguridad Sin Compromisos',
            securityDesc: 'Cada vehículo en nuestra flota pasa por una inspección rigurosa de 50 puntos antes de cada entrega.',
            luxuryTitle: 'Lujo Premium',
            luxuryDesc: 'Seleccionamos solo los últimos modelos de alta gama para asegurar que viajes con estilo y confort total.',
            reliabilityTitle: 'Fiabilidad 24/7',
            reliabilityDesc: 'Nuestro equipo de conserjería está disponible las 24 horas para asistirte en cualquier punto de Miami.',
            personalizedTitle: 'Servicio Personalizado',
            personalizedDesc: 'Entendemos que cada cliente es único. Personalizamos cada detalle, desde la entrega hasta el equipamiento.',
            servicesTitle: 'Lo Que Ofrecemos',
            servicesSubtitle: 'Nuestros servicios exclusivos',
            carRentals: 'Alquiler de Autos',
            carRentalsDesc: 'Amplia selección de vehículos modernos de lujo.',
            fastBooking: 'Reserva Rápida',
            fastBookingDesc: 'Reserva en segundos con nuestro sistema moderno.',
            support247: 'Soporte 24/7',
            support247Desc: 'Asistencia las 24 horas para todos nuestros clientes.',
            teamTitle: 'Nuestro Equipo',
            teamSubtitle: 'Los profesionales detrás de HPOWER',
            ceo: 'CEO & Fundador',
            ceoDesc: 'Líder visionario con más de 15 años de experiencia en la industria automotriz de lujo.',
            coo: 'Directora de Operaciones',
            cooDesc: 'Experta en logística y gestión de flota, asegura la excelencia operativa en cada ubicación.',
            cdo: 'Director de Experiencia',
            cdoDesc: 'Diseña y ejecuta estrategias para garantizar una experiencia memorable para cada cliente.',
            concierge: '24/7 Support',
            conciergeDesc: 'Profesionales dedicados disponibles las 24 horas para asistirte en cualquier momento.',
            ctaTitle: '¿Listo para reservar tu auto?',
            ctaDesc: 'Experimenta el lujo y la comodidad que solo HPOWER puede ofrecerte.',
            ctaButton: 'Reservar Ahora',
            footerLocations: 'Miami Beach | Downtown | MIA Airport',
            footerCopyright: '© 2026 HPOWER CAR RENTAL. SERVICIO CORPORATIVO DE LUJO.'
        },
        reviews: {
            title: 'Lo Que Dicen Nuestros Clientes',
            subtitle: 'Reseñas reales de clientes satisfechos',
            noReviews: 'No hay reseñas aún. ¡Sé el primero en dejar una!',
            errorLoading: 'Error al cargar reseñas.',
            formTitle: 'Deja tu Reseña',
            nameLabel: 'Nombre',
            namePlaceholder: 'Tu nombre',
            ratingLabel: 'Calificación',
            commentLabel: 'Comentario',
            commentPlaceholder: 'Comparte tu experiencia...',
            submitButton: '💾 Enviar Reseña',
            submitting: 'Enviando...',
            selectRating: 'Por favor selecciona una calificación',
            thanksHigh: '¡Gracias {name}! 😊\n\n¡Esperamos verte de nuevo pronto! Tu opinión es muy importante para nosotros.',
            thanksLow: 'Gracias {name} por rentar con nosotros.\n\nLamentamos los inconvenientes. Trabajaremos para mejorar tu experiencia en el futuro.',
            thanksMedium: 'Gracias {name} por tu reseña.\n\nLa próxima vez te prometemos una mejor experiencia. ¡Nos esforzaremos por mejorar!',
            submitError: 'Error al enviar la reseña. Por favor intenta nuevamente.\n\nError: {error}'
        }
    },
    en: {
        nav: {
            home: 'Home',
            fleet: 'Fleet',
            book: 'Book',
            contact: 'Contact',
            about: 'About Us'
        },
        pickup: {
            title: 'Pickup',
            location: 'Location',
            date: 'Date',
            time: 'Time',
            sameLocation: 'Return to same location'
        },
        return: {
            title: 'Return',
            location: 'Location',
            date: 'Date',
            time: 'Time'
        },
        select: {
            city: 'City...'
        },
        button: {
            search: 'BOOK NOW →',
            back: '← Back'
        },
        results: {
            title: 'Available Vehicles'
        },
        terms: {
            heroTitle: 'Terms and Conditions',
            heroSubtitle: 'Important information about our car rental service.',
            updated: 'Last updated: April 2026',
            tocTitle: 'Table of Contents',
            toc1: 'Rental Requirements',
            toc2: 'Insurance and Coverage',
            toc3: 'Fuel Policy',
            toc4: 'Cancellation Policy',
            toc5: 'Mileage Limit',
            toc6: 'Damage and Liability',
            toc7: 'Additional Drivers',
            toc8: 'Interstate Travel',
            s1Title: 'Rental Requirements',
            s1p1: 'To rent a vehicle with Hpower Car Rental, the renter must meet the following requirements:',
            s1l1: 'Be at least 21 years old. Drivers under 25 may be subject to a young driver surcharge.',
            s1l2: 'Present a valid and current driver\'s license. International licenses with official translation are accepted.',
            s1l3: 'Have a valid credit card in the main driver\'s name for the security deposit.',
            s1l4: 'Present a valid ID document (passport for international visitors).',
            s1note: '⚠️ Debit cards are not accepted as payment for the security deposit.',
            s2Title: 'Insurance and Coverage',
            s2p1: 'All Hpower Car Rental vehicles include basic liability insurance (State Minimum Liability Insurance). Additional options available:',
            s2l1: '<strong>CDW (Collision Damage Waiver)</strong> — Reduces renter liability in case of collision. From $15/day.',
            s2l2: '<strong>SLI (Supplemental Liability Insurance)</strong> — Additional liability coverage up to $1,000,000. From $12/day.',
            s2l3: '<strong>PAI (Personal Accident Insurance)</strong> — Medical coverage for driver and passengers. From $5/day.',
            s2l4: '<strong>Theft Protection</strong> — Coverage in case of vehicle theft. From $9/day.',
            s3Title: 'Fuel Policy',
            s3p1: 'Hpower Car Rental operates under a "full-to-full" fuel policy:',
            s3l1: 'The vehicle is delivered with a full fuel tank.',
            s3l2: 'The renter must return the vehicle with a full fuel tank.',
            s3l3: 'If the tank is not full at the time of return, a fuel charge plus a refueling service fee will be charged.',
            s3l4: 'Only the fuel type indicated on the vehicle tank label is accepted.',
            s3note: '💡 We recommend refueling at a station near the return location to avoid additional charges.',
            s4Title: 'Cancellation Policy',
            s4p1: 'Our cancellation policy is as follows:',
            s4l1: '<strong>More than 48 hours before</strong> pickup: free cancellation, full refund.',
            s4l2: '<strong>Between 24 and 48 hours before</strong> pickup: 25% of total reservation charge.',
            s4l3: '<strong>Less than 24 hours before</strong> pickup: 50% of total reservation charge.',
            s4l4: '<strong>No-Show</strong>: 100% of total reservation charge.',
            s5Title: 'Mileage Limit',
            s5p1: 'Depending on vehicle category and rental duration, mileage may be limited or unlimited:',
            s5l1: '<strong>Daily and weekly rentals</strong>: Unlimited miles included in all categories.',
            s5l2: '<strong>Monthly rentals</strong>: Includes up to 2,500 miles per month. Additional miles at $0.25/mile.',
            s5l3: '<strong>Premium/Luxury vehicles</strong>: May have additional restrictions. Consult at time of reservation.',
            s6Title: 'Damage and Liability',
            s6p1: 'The renter is responsible for any damage to the vehicle during the rental period:',
            s6l1: 'A joint inspection of the vehicle will be performed at pickup and return.',
            s6l2: 'Any previously unreported damage will be charged to the renter.',
            s6l3: 'The renter\'s maximum liability (without CDW coverage) is the total repair or replacement cost of the vehicle.',
            s6l4: 'Damage to tires, windshield, and undercarriage is not covered by the standard policy.',
            s6note: '⚠️ We recommend taking photos of the vehicle at pickup as evidence of initial condition.',
            s7Title: 'Additional Drivers',
            s7p1: 'Additional drivers can be added under the following conditions:',
            s7l1: 'Additional charge of $10/day per additional driver.',
            s7l2: 'Each additional driver must meet the same age and license requirements.',
            s7l3: 'Spouse or domestic partner can be added at no additional charge (with valid documentation).',
            s7l4: 'Maximum of 3 additional drivers per rental contract.',
            s8Title: 'Interstate Travel',
            s8p1: 'Interstate travel is permitted under the following conditions:',
            s8l1: 'Driving within the continental United States is permitted at no additional charge.',
            s8l2: 'Driving outside the United States (including Mexico and Canada) is not permitted without prior authorization.',
            s8l3: 'Return at a different location (one-way) may incur an additional charge depending on distance.',
            s8l4: 'The renter is responsible for all traffic fines and tolls incurred during the rental.',
            s8note: '📍 Return between our locations (Miami ↔ Charlotte ↔ Nashville): flat fee of $75.'
        },
        footer: {
            company: 'Hpower Car Rental',
            description: 'Your best option for car rental<br>in Miami, Charlotte and Nashville.',
            phone: '1-800-HPOWER',
            email: 'info@hpower.com',
            quickLinks: 'Quick Links',
            fleet: 'Our Fleet',
            bookNow: 'Book Now',
            terms: 'Terms and Conditions',
            followUs: 'Follow Us',
            connect: 'Connect with us',
            copyright: ' 2026 Hpower Car Rental. All rights reserved. | Designed with '
        },
        home: {
            locationsTitle: 'Our Main Locations',
            locationsDesc: 'Vehicles ready for you in the best destinations',
            availableVehicles: 'vehicles available'
        },
        features: {
            fleet: {
                title: 'Premium Fleet',
                desc: 'Recent models in excellent condition, from economy to family luxury SUVs.'
            },
            noHidden: {
                title: 'Zero Hidden Fees',
                desc: 'Full transparency. What you see is what you pay, no surprises at the counter when you pick up.'
            },
            support: {
                title: 'VIP 24/7 Support',
                desc: 'We are with you every kilometer. We assist you in any eventuality during your rental.'
            }
        },
        contact: {
            branchesTitle: 'Our Branches',
            hours: 'Hours',
            miamiHours: 'Mon - Fri: 8:00 AM - 6:00 PM<br>Sat: 9:00 AM - 4:00 PM<br>Sun: 10:00 AM - 2:00 PM',
            charlotteHours: 'Mon - Fri: 8:00 AM - 6:00 PM<br>Sat: 9:00 AM - 4:00 PM<br>Sun: Closed',
            nashvilleHours: 'Mon - Fri: 8:00 AM - 6:00 PM<br>Sat: 9:00 AM - 3:00 PM<br>Sun: Closed',
            heroTitle: 'Contact Us',
            heroSubtitle: 'We are here to help. Visit us at any of our branches or send us a message.',
            callUs: 'Call Us',
            emailUs: 'Email Us',
            chatNow: 'Live Chat',
            formTitle: 'Send Us a Message',
            name: 'Full Name',
            email: 'Email',
            phone: 'Phone',
            branch: 'Branch',
            selectBranch: 'Select branch...',
            subject: 'Subject',
            selectSubject: 'Select subject...',
            subjectReservation: 'Reservation inquiry',
            subjectPricing: 'Pricing and rates',
            subjectComplaint: 'Complaint',
            subjectSuggestion: 'Suggestion',
            subjectOther: 'Other',
            message: 'Message',
            send: 'Send Message',
            successTitle: 'Message Sent!',
            successDesc: 'Thank you for contacting us. We will respond within the next 24 hours.',
            faqTitle: 'Frequently Asked Questions',
            faq1q: 'What do I need to rent a vehicle?',
            faq1a: 'You need to be at least 21 years old, have a valid driver\'s license, a credit card in the main driver\'s name, and a security deposit.',
            faq2q: 'Can I return the car at a different location?',
            faq2a: 'Yes, we offer return at any of our 3 locations (Miami, Charlotte and Nashville). An additional fee may apply for return at a different location.',
            faq3q: 'Is insurance included in the price?',
            faq3a: 'Yes, all our vehicles include basic liability insurance. We also offer additional coverage options such as CDW (Collision Damage Waiver) and theft protection.',
            faq4q: 'What is the fuel policy?',
            faq4a: 'We deliver the vehicle with a full tank and expect you to return it the same way. If the tank is not full at return time, a fuel charge will be applied.',
            faq5q: 'Can I cancel my reservation?',
            faq5a: 'Yes, you can cancel without charge up to 48 hours before the pickup date. Cancellations with less than 48 hours may be subject to a 50% charge of the total reservation.',
            faq6q: 'Do you accept additional drivers?',
            faq6a: 'Yes, you can add additional drivers for an additional daily charge. Each additional driver must meet the same age and license requirements as the main driver.'
        },
        fleet: {
            heroTitle: 'Our Fleet',
            heroSubtitle: 'The perfect vehicle awaits you. From economy to premium, we have the ideal option for every trip.',
            allLocations: 'All Locations',
            popular: 'Popular',
            familyFavorite: 'Family Favorite',
            economy: 'Economy',
            compact: 'Compact',
            intermediate: 'Intermediate',
            fullsize: 'Full-Size',
            premium: 'Premium / Luxury',
            orSimilar: 'or similar',
            passengers: 'passengers',
            bags: 'bags',
            automatic: 'Automatic',
            leather: 'Leather',
            from: 'From',
            day: 'day',
            bookNow: 'Book Now',
            whyTitle: 'Why Choose Hpower?',
            why1Title: 'Insurance Included',
            why1Desc: 'All our vehicles include basic insurance for your peace of mind.',
            why2Title: '24/7 Support',
            why2Desc: 'Roadside assistance available 24 hours a day, 7 days a week.',
            why3Title: 'Best Prices',
            why3Desc: 'Competitive rates with no hidden fees. Full transparency.',
            why4Title: '3 Locations',
            why4Desc: 'Pick up and return in Miami, Charlotte or Nashville at your convenience.',
            ctaTitle: 'Ready to Drive?',
            ctaDesc: 'Book your vehicle now and pick it up at any of our locations.',
            ctaButton: 'BOOK NOW',
            available: 'Available',
            loading: 'Loading fleet...',
            noVehicles: 'No vehicles available at this location.',
            unitsAvailable: 'available'
        },
        about: {
            navSubtitle: 'Corporate Page | About Us',
            heroTitle: 'ABOUT <span class="logo-accent">US</span>',
            heroDescription: 'At HPOWER CAR RENTAL, we don\'t just rent cars; we deliver the keys to an unparalleled luxury experience in the heart of Miami.',
            historyTitle: 'Our History',
            historyP1: 'Founded in 2018, HPOWER was born from the need to elevate the standard of car rentals in Miami. We identified that the market demanded more than mobility: it demanded power, prestige, and customer service worthy of the vehicles we offer.',
            historyP2: 'What started as a small fleet of sports cars has transformed into one of the most exclusive collections in the region, serving executives, celebrities, and travelers seeking the extraordinary.',
            mission: 'Mission',
            missionText: 'Provide luxury mobility solutions with an obsessive focus on punctuality and customer satisfaction.',
            vision: 'Vision',
            visionText: 'To be the global reference for luxury car rentals in Florida, standing out for our modern fleet and professional ethics.',
            yearsOfExcellence: 'Years of Excellence',
            standardTitle: 'The HPOWER Standard',
            standardSubtitle: 'Our fundamental pillars',
            securityTitle: 'Security Without Compromise',
            securityDesc: 'Every vehicle in our fleet undergoes a rigorous 50-point inspection before each delivery.',
            luxuryTitle: 'Premium Luxury',
            luxuryDesc: 'We select only the latest high-end models to ensure you travel in style and total comfort.',
            reliabilityTitle: '24/7 Reliability',
            reliabilityDesc: 'Our concierge team is available 24 hours to assist you at any point in Miami.',
            personalizedTitle: 'Personalized Service',
            personalizedDesc: 'We understand that every client is unique. We customize every detail, from delivery to equipment.',
            servicesTitle: 'What We Offer',
            servicesSubtitle: 'Our exclusive services',
            carRentals: 'Car Rentals',
            carRentalsDesc: 'Wide selection of modern luxury vehicles.',
            fastBooking: 'Fast Booking',
            fastBookingDesc: 'Book in seconds with our modern system.',
            support247: '24/7 Support',
            support247Desc: '24-hour assistance for all our clients.',
            teamTitle: 'Our Team',
            teamSubtitle: 'The professionals behind HPOWER',
            ceo: 'CEO & Founder',
            ceoDesc: 'Visionary leader with over 15 years of experience in the luxury automotive industry.',
            coo: 'Director of Operations',
            cooDesc: 'Logistics and fleet management expert, ensuring operational excellence at every location.',
            cdo: 'Director of Experience',
            cdoDesc: 'Designs and executes strategies to guarantee a memorable experience for every client.',
            concierge: '24/7 Support',
            conciergeDesc: 'Dedicated professionals available 24 hours to assist you at any time.',
            ctaTitle: 'Ready to book your car?',
            ctaDesc: 'Experience the luxury and comfort that only HPOWER can offer you.',
            ctaButton: 'Book Now',
            footerLocations: 'Miami Beach | Downtown | MIA Airport',
            footerCopyright: '© 2026 HPOWER CAR RENTAL. LUXURY CORPORATE SERVICE.'
        },
        reviews: {
            title: 'What Our Clients Say',
            subtitle: 'Real reviews from satisfied customers',
            noReviews: 'No reviews yet. Be the first to leave one!',
            errorLoading: 'Error loading reviews.',
            formTitle: 'Leave Your Review',
            nameLabel: 'Name',
            namePlaceholder: 'Your name',
            ratingLabel: 'Rating',
            commentLabel: 'Comment',
            commentPlaceholder: 'Share your experience...',
            submitButton: '💾 Submit Review',
            submitting: 'Submitting...',
            selectRating: 'Please select a rating',
            thanksHigh: 'Thank you {name}! 😊\n\nWe hope to see you again soon! Your opinion is very important to us.',
            thanksLow: 'Thank you {name} for renting with us.\n\nWe apologize for the inconvenience. We will work to improve your experience in the future.',
            thanksMedium: 'Thank you {name} for your review.\n\nNext time we promise a better experience. We will strive to improve!',
            submitError: 'Error submitting review. Please try again.\n\nError: {error}'
        }
    }
};

let currentLang = localStorage.getItem('lang') || 'es';

window.setLanguage = function(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    updateTranslations();
    updateLangButtons();
}

function updateTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const keys = key.split('.');
        let value = translations[currentLang];
        keys.forEach(k => {
            value = value ? value[k] : '';
        });
        if (value) {
            el.innerHTML = value;
        }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const keys = key.split('.');
        let value = translations[currentLang];
        keys.forEach(k => {
            value = value ? value[k] : '';
        });
        // Theme management is now handled by js/theme-shared.js
        if (value) {
            el.placeholder = value;
        }
    });
}

function updateLangButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === currentLang) {
            btn.classList.add('active');
        }
    });
    document.documentElement.lang = currentLang;
}

// Initialize i18n when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        updateTranslations();
        updateLangButtons();
    });
} else {
    updateTranslations();
    updateLangButtons();
}
