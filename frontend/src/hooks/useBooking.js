import { useState, useEffect } from 'react';
import api from '../services/api';

export const useBooking = (initialDetails) => {
    const [categories, setCategories] = useState([]);
    const [charges, setCharges] = useState([]);
    // IMPORTANTE: Inicializamos con objeto vacío {} para evitar el error de Object.values
    const [selectedCharges, setSelectedCharges] = useState({});
    const [loading, setLoading] = useState(false);

    // Estados de fecha y hora
    const [pDate, setPDate] = useState(initialDetails?.pDate || '');
    const [pTime, setPTime] = useState(initialDetails?.pTime || '');
    const [rDate, setRDate] = useState(initialDetails?.rDate || '');
    const [rTime, setRTime] = useState(initialDetails?.rTime || '');

    useEffect(() => {
        const fetchCharges = async () => {
            setLoading(true);
            try {
                const response = await api.get('/api/hq/charges');
                const data = response.data || []; // Aseguramos que sea un array
                const uniqueCats = [...new Set(data.map(c => c.category_name))];
                setCategories(uniqueCats);
                setCharges(data);
            } catch (err) {
                console.error("Error al cargar cargos de HQ:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCharges();
    }, []);

    const toggleCharge = (charge) => {
        if (!charge || !charge.id) return;
        setSelectedCharges(prev => {
            const newCharges = { ...prev };
            if (newCharges[charge.id]) {
                delete newCharges[charge.id];
            } else {
                newCharges[charge.id] = charge;
            }
            return newCharges;
        });
    };

    return {
        categories, 
        charges, 
        selectedCharges: selectedCharges || {}, // Doble seguridad
        loading,
        dates: { pDate, pTime, rDate, rTime },
        setters: { setPDate, setPTime, setRDate, setRTime },
        toggleCharge
    };
};