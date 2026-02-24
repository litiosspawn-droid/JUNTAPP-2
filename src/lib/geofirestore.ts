import { db } from './firebase/client';
import * as geofirestore from 'geofirestore';

// Crea una instancia de Geofirestore
const geofire = geofirestore.initializeApp(db);

// Referencia a la colección con capacidad geoespacial
const eventsGeo = geofire.collection('events');

export { eventsGeo };
